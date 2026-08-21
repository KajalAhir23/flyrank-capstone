"use client";

import { useRef, useState } from "react";

type ButtonState = "idle" | "loading" | "success" | "error";

interface MotionButtonProps {
  label?: string;
  loadingLabel?: string;
  successLabel?: string;
  errorLabel?: string;
  /** The async action to run. Should resolve on success, reject on failure. */
  onAction: () => Promise<void>;
}

export function MotionButton({
  label = "Send",
  loadingLabel = "Sending…",
  successLabel = "Sent",
  errorLabel = "Retry",
  onAction,
}: MotionButtonProps) {
  const [state, setState] = useState<ButtonState>("idle");
  const runIdRef = useRef(0);

  async function handleClick() {
    // Ignore clicks while already loading — prevents double-fire on spam-click.
    if (state === "loading") return;

    // Track this specific run so a stale async result can't clobber a
    // newer one if the user clicks again quickly after an error/success.
    const runId = ++runIdRef.current;
    setState("loading");

    try {
      await onAction();
      if (runId !== runIdRef.current) return; // a newer click superseded this one
      setState("success");
      setTimeout(() => {
        if (runId === runIdRef.current) setState("idle");
      }, 1400);
    } catch {
      if (runId !== runIdRef.current) return;
      setState("error");
      setTimeout(() => {
        if (runId === runIdRef.current) setState("idle");
      }, 2200);
    }
  }

  const currentLabel =
    state === "loading"
      ? loadingLabel
      : state === "success"
      ? successLabel
      : state === "error"
      ? errorLabel
      : label;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={state === "loading"}
      data-state={state}
      className="mbtn"
      aria-live="polite"
    >
      <span className="mbtn-content">
        <span className="mbtn-icon" aria-hidden="true">
          {state === "loading" && <span className="mbtn-spinner" />}
          {state === "success" && (
            <svg viewBox="0 0 24 24" className="mbtn-check">
              <path
                d="M4 12.5L9.5 18L20 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          {state === "error" && (
            <svg viewBox="0 0 24 24" className="mbtn-x">
              <path
                d="M6 6L18 18M18 6L6 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          )}
        </span>
        <span className="mbtn-label">{currentLabel}</span>
      </span>
    </button>
  );
}