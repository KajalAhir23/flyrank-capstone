"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";

export function Chat() {
  const { messages, sendMessage, status, stop } = useChat();
  const [input, setInput] = useState("");

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

          {messages.map((message) => (
            <div
              key={message.id}
              className={`chat-message chat-message-${message.role}`}
            >
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
          ))}

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