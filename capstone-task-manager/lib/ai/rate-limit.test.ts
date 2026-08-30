import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  checkRateLimit,
  validateChatInput,
  MAX_MESSAGE_LENGTH,
  MAX_MESSAGES_IN_THREAD,
} from "@/lib/ai/rate-limit";

describe("checkRateLimit", () => {
  it("allows the first request from a new IP", () => {
    const result = checkRateLimit("1.1.1.1-test-first");
    expect(result.allowed).toBe(true);
  });

  it("allows up to the configured limit, then blocks the next request", () => {
    const ip = "2.2.2.2-test-limit";
    for (let i = 0; i < 10; i++) {
      expect(checkRateLimit(ip).allowed).toBe(true);
    }
    const blocked = checkRateLimit(ip);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("tracks separate IPs independently", () => {
    const ipA = "3.3.3.3-test-a";
    const ipB = "4.4.4.4-test-b";
    for (let i = 0; i < 10; i++) checkRateLimit(ipA);
    // ipA is now exhausted, but ipB should be unaffected
    expect(checkRateLimit(ipB).allowed).toBe(true);
  });
});

describe("validateChatInput", () => {
  it("rejects an empty messages array", () => {
    const result = validateChatInput([]);
    expect(result.valid).toBe(false);
  });

  it("rejects a non-array input", () => {
    const result = validateChatInput(null as unknown as unknown[]);
    expect(result.valid).toBe(false);
  });

  it("accepts a normal, short conversation", () => {
    const messages = [
      { parts: [{ type: "text", text: "Hello there" }] },
    ];
    expect(validateChatInput(messages).valid).toBe(true);
  });

  it("rejects a message longer than the max length", () => {
    const messages = [
      { parts: [{ type: "text", text: "a".repeat(MAX_MESSAGE_LENGTH + 1) }] },
    ];
    const result = validateChatInput(messages);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/too long/i);
  });

  it("accepts a message at exactly the max length", () => {
    const messages = [
      { parts: [{ type: "text", text: "a".repeat(MAX_MESSAGE_LENGTH) }] },
    ];
    expect(validateChatInput(messages).valid).toBe(true);
  });

  it("rejects a thread with more messages than the cap", () => {
    const messages = Array.from({ length: MAX_MESSAGES_IN_THREAD + 1 }, () => ({
      parts: [{ type: "text", text: "hi" }],
    }));
    const result = validateChatInput(messages);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/too long/i);
  });
});