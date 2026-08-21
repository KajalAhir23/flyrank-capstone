"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { addTask } from "@/lib/tasks";
import { PriorityScoreCard, type ScoreResult } from "@/components/PriorityScoreCard";

function extractTaskLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^(\d+[.)]|[-*•])\s+/.test(line))
    .map((line) => line.replace(/^(\d+[.)]|[-*•])\s+/, "").trim())
    .filter(Boolean);
}

// ---- Server tool renderer (scoreTaskPriority) ----

function ScoreToolPart({ part }: { part: any }) {
  const state = part.state;

  if (state === "input-streaming") {
    return (
      <div className="tool-card tool-card-loading">
        <div className="tool-card-spinner" />
        <p>Preparing to score a task…</p>
      </div>
    );
  }

  if (state === "input-available") {
    return (
      <div className="tool-card tool-card-loading">
        <div className="tool-card-spinner" />
        <p>
          Scoring <strong>{part.input?.title ?? "task"}</strong>…
        </p>
      </div>
    );
  }

  if (state === "output-available") {
    return <PriorityScoreCard result={part.output as ScoreResult} />;
  }

  if (state === "output-error") {
    return (
      <div className="tool-card tool-card-error">
        <p className="tool-card-error-title">⚠ Couldn't score this task</p>
        <p className="tool-card-error-detail">
          {part.errorText || "Something went wrong running the tool."}
        </p>
      </div>
    );
  }

  return null;
}

// ---- Client interactive tool renderer (confirmAddTask) ----

function ConfirmToolPart({
  part,
  onAnswer,
}: {
  part: any;
  onAnswer: (toolCallId: string, title: string, confirmed: boolean) => void;
}) {
  const state = part.state;

  if (state === "input-streaming") {
    return (
      <div className="tool-card tool-card-loading">
        <div className="tool-card-spinner" />
        <p>Preparing a confirmation…</p>
      </div>
    );
  }

  if (state === "input-available") {
    const title = part.input?.title ?? "this task";
    return (
      <div className="tool-card tool-card-confirm">
        <p className="tool-card-confirm-text">
          Add <strong>{title}</strong> to your tasks now?
        </p>
        <div className="tool-card-confirm-actions">
          <button
            type="button"
            className="tool-confirm-yes"
            onClick={() => onAnswer(part.toolCallId, title, true)}
          >
            Yes, add it
          </button>
          <button
            type="button"
            className="tool-confirm-no"
            onClick={() => onAnswer(part.toolCallId, title, false)}
          >
            No thanks
          </button>
        </div>
      </div>
    );
  }

  if (state === "output-available") {
    const confirmed = (part.output as { confirmed: boolean })?.confirmed;
    return (
      <div className={`tool-card ${confirmed ? "tool-card-result" : "tool-card-loading"}`}>
        <p>{confirmed ? "✓ Added to your tasks." : "Skipped — not added."}</p>
      </div>
    );
  }

  if (state === "output-error") {
    return (
      <div className="tool-card tool-card-error">
        <p className="tool-card-error-title">⚠ Couldn't process that</p>
      </div>
    );
  }

  return null;
}

export function Chat() {
  const {
    messages,
    sendMessage,
    status,
    stop,
    addToolOutput,
    error,
    regenerate,
  } = useChat();

  const [input, setInput] = useState("");
  const [addedTasks, setAddedTasks] = useState<Set<string>>(new Set());
  const [isRetrying, setIsRetrying] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isPinnedToBottomRef = useRef(true);

  const isStreaming = status === "streaming" || status === "submitted";

  function handleScroll() {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight;
    isPinnedToBottomRef.current = distanceFromBottom < 80;
  }

  useEffect(() => {
    if (!isPinnedToBottomRef.current) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  function scrollToBottom() {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    isPinnedToBottomRef.current = true;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage({ text: input });
    setInput("");
    isPinnedToBottomRef.current = true;
  }

  function handleAddTask(taskLine: string, key: string) {
    addTask(taskLine);
    setAddedTasks((prev) => new Set(prev).add(key));
  }

  function handleConfirmAnswer(
    toolCallId: string,
    title: string,
    confirmed: boolean
  ) {
    if (confirmed) {
      addTask(title);
    }
    addToolOutput({
      toolCallId,
      tool: "confirmAddTask",
      output: { confirmed },
    });
  }

  function handleRetry() {
    if (isRetrying) return;
    setIsRetrying(true);
    regenerate();
    setTimeout(() => setIsRetrying(false), 1000);
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-header-icon">✦</div>
          <div>
            <p className="chat-header-title">Task Assistant</p>
            <p className="chat-header-subtitle">
              Describe a goal, or ask me to score a task's priority
            </p>
          </div>
        </div>

        <div
          className="chat-messages"
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          {messages.length === 0 && (
            <div className="chat-empty">
              <div className="chat-empty-icon">✦</div>
              <p className="chat-empty-title">What are you working on?</p>
              <p className="chat-empty-subtitle">Try one of these:</p>
              <div className="chat-empty-examples">
                {[
                  "I'm moving apartments next month",
                  "How urgent is replying to my landlord's email today?",
                  "Plan a birthday party for my friend",
                ].map((example) => (
                  <button
                    key={example}
                    type="button"
                    className="chat-empty-example"
                    onClick={() => setInput(example)}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, msgIndex) => {
            const isLastMessage = msgIndex === messages.length - 1;
            const showTaskButtons =
              message.role === "assistant" &&
              !(isLastMessage && isStreaming);

            const fullText = message.parts
              .filter((p) => p.type === "text")
              .map((p) => (p as { text: string }).text)
              .join("");

            const taskLines = showTaskButtons
              ? extractTaskLines(fullText)
              : [];

            return (
              <div key={message.id}>
                <div className={`chat-message chat-message-${message.role}`}>
                  {message.role === "assistant" && (
                    <div className="chat-avatar chat-avatar-assistant">✦</div>
                  )}
                  <div className="chat-bubble-wrap">
                    {message.parts.map((part, i) => {
                      if (part.type === "text") {
                        return (
                          <div key={i} className="chat-bubble">
                            {part.text}
                          </div>
                        );
                      }
                      if (part.type === "tool-scoreTaskPriority") {
                        return <ScoreToolPart key={i} part={part} />;
                      }
                      if (part.type === "tool-confirmAddTask") {
                        return (
                          <ConfirmToolPart
                            key={i}
                            part={part}
                            onAnswer={handleConfirmAnswer}
                          />
                        );
                      }
                      return null;
                    })}
                  </div>
                  {message.role === "user" && (
                    <div className="chat-avatar chat-avatar-user">You</div>
                  )}
                </div>

                {taskLines.length > 0 && (
                  <div className="chat-task-suggestions">
                    {taskLines.map((line, i) => {
                      const key = `${message.id}-${i}`;
                      const added = addedTasks.has(key);
                      return (
                        <button
                          key={key}
                          type="button"
                          className={`chat-task-button ${
                            added ? "chat-task-button-added" : ""
                          }`}
                          onClick={() => handleAddTask(line, key)}
                          disabled={added}
                        >
                          {added ? "✓ Added" : "+ Add to my tasks"}
                          <span className="chat-task-button-label">
                            {line}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {status === "submitted" && (
            <div className="chat-message chat-message-assistant">
              <div className="chat-avatar chat-avatar-assistant">✦</div>
              <div className="chat-bubble chat-thinking">
                <span className="chat-dot" />
                <span className="chat-dot" />
                <span className="chat-dot" />
              </div>
            </div>
          )}

          {error && (
            <div className="chat-message chat-message-assistant">
              <div className="chat-avatar chat-avatar-assistant">✦</div>
              <div className="tool-card tool-card-error chat-error-card">
                <p className="tool-card-error-title">
                  ⚠ Message failed to send
                </p>
                <p className="tool-card-error-detail">
                  {error.message ||
                    "Something went wrong. Your other messages are safe."}
                </p>
                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="chat-retry-button"
                >
                  {isRetrying ? "Retrying…" : "Retry this message"}
                </button>
              </div>
            </div>
          )}
        </div>

        {!isPinnedToBottomRef.current && (
          <button
            type="button"
            className="chat-jump-button"
            onClick={scrollToBottom}
          >
            ↓ Jump to latest
          </button>
        )}

        <form className="chat-input-row" onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe something you need to do…"
            className="chat-input"
            disabled={isStreaming}
          />
          {isStreaming ? (
            <button
              type="button"
              onClick={stop}
              className="chat-stop-button"
              aria-label="Stop generating"
            >
              ◼
            </button>
          ) : (
            <button
              type="submit"
              className="chat-send-button"
              disabled={!input.trim()}
              aria-label="Send message"
            >
              ↑
            </button>
          )}
        </form>
      </div>
    </div>
  );
}