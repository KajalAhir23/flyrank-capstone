import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from "ai";
import { chatModel, systemPrompt, chatSettings } from "@/lib/ai/config";
import { scoreTaskPriority, confirmAddTask } from "@/lib/ai/tools";
import { checkRateLimit, sweepStaleBuckets, validateChatInput } from "@/lib/ai/rate-limit";

export const maxDuration = 30;

export async function POST(req: Request) {
  sweepStaleBuckets();

  // Identify the caller by IP (Vercel sets x-forwarded-for on every
  // request). Fall back to a constant key if it's ever missing, so a
  // request without the header still gets rate-limited as a group
  // rather than bypassing the check entirely.
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "Too many requests. Please slow down and try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  const validation = validateChatInput(messages);
  if (!validation.valid) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  const result = streamText({
    model: chatModel,
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    temperature: chatSettings.temperature,
    maxOutputTokens: chatSettings.maxOutputTokens,
    tools: {
      scoreTaskPriority,
      confirmAddTask,
    },
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}