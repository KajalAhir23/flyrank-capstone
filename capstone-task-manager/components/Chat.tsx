"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { addTask } from "@/lib/tasks";

// Pulls out lines that look like list items (numbered or bulleted)
// from a block of assistant text, so we can offer "add to tasks"
// buttons under each one.
function extractTaskLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^(\d+[.)]|[-*•])\s+/.test(line))
    .map((line) => line.replace(/^(\d+[.)]|[-*•])\s+/, "").trim())
    .filter(Boolean);
}

export function Chat() {
  const { messages, sendMessage, status, stop } = useChat();
  const [input, setInput] = useState("");
  const [addedTasks, setAddedTasks] = useState<Set<string>>(new Set());

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

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-header-icon">✦</div>
          <div>
            <p className="chat-header-title">Task Assistant</p>
            <p className="chat-header-subtitle">
              Describe a goal and I'll break it into tasks
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
              <p className="chat-empty-subtitle">
                Try: "I'm moving apartments next month"
              </p>
            </div>
          )}

          {messages.map((message, msgIndex) => {
            const isLastMessage = msgIndex === messages.length - 1;
            // Only show "add to tasks" buttons once this message has
            // finished streaming — not while text is still arriving.
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
                  <div className="chat-bubble">
                    {message.parts.map((part, i) =>
                      part.type === "text" ? (
                        <span key={i}>{part.text}</span>
                      ) : null
                    )}
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