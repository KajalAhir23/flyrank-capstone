/**
 * Lightweight in-memory rate limiter, keyed by client IP.
 *
 * Tradeoff, stated honestly: this resets whenever Vercel spins up a new
 * serverless instance (cold start), and isn't shared across concurrent
 * instances under real load. For a project at capstone/demo traffic
 * levels this is a reasonable deterrent against a stranger scripting
 * requests against the public URL; it is NOT a substitute for a real
 * distributed limiter (e.g. Upstash Redis + @upstash/ratelimit) in an
 * app with meaningful traffic or cost exposure. See README "what I'd
 * add with more time" for the upgrade path.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 10; // per IP, per window

export function checkRateLimit(ip: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const bucket = buckets.get(ip);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

// Occasionally clear stale entries so the Map doesn't grow forever
// across a long-lived serverless instance's lifetime.
let lastSweep = Date.now();
export function sweepStaleBuckets() {
  const now = Date.now();
  if (now - lastSweep < WINDOW_MS) return;
  lastSweep = now;
  for (const [ip, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(ip);
  }
}

// ---- Input caps ----
// Hard limits on what a single request is allowed to contain, so a
// malicious or buggy client can't send an enormous payload and burn
// through Groq API credits or tokens in one request.
export const MAX_MESSAGE_LENGTH = 2000; // characters, per user message
export const MAX_MESSAGES_IN_THREAD = 40; // total messages sent in one request

export function validateChatInput(messages: unknown[]): { valid: boolean; error?: string } {
  if (!Array.isArray(messages) || messages.length === 0) {
    return { valid: false, error: "No messages provided." };
  }
  if (messages.length > MAX_MESSAGES_IN_THREAD) {
    return {
      valid: false,
      error: `Conversation is too long (max ${MAX_MESSAGES_IN_THREAD} messages per request).`,
    };
  }
  for (const message of messages as Array<{ parts?: Array<{ type?: string; text?: string }> }>) {
    const parts = message.parts ?? [];
    for (const part of parts) {
      if (part.type === "text" && typeof part.text === "string" && part.text.length > MAX_MESSAGE_LENGTH) {
        return {
          valid: false,
          error: `Message is too long (max ${MAX_MESSAGE_LENGTH} characters).`,
        };
      }
    }
  }
  return { valid: true };
}