import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { chatModel, systemPrompt, chatSettings } from "@/lib/ai/config";
import { scoreTaskPriority } from "@/lib/ai/tools";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: chatModel,
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    temperature: chatSettings.temperature,
    maxOutputTokens: chatSettings.maxOutputTokens,
    tools: {
      scoreTaskPriority,
    },
  });

  return result.toUIMessageStreamResponse();
}