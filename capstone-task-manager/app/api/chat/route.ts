import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from "ai";
import { chatModel, systemPrompt, chatSettings } from "@/lib/ai/config";
import { scoreTaskPriority, confirmAddTask } from "@/lib/ai/tools";

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
      confirmAddTask,
    },
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}