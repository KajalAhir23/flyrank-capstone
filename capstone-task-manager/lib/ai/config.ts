import { groq } from "@ai-sdk/groq";

/**
 * Central AI configuration for the task manager's chat assistant.
 * Keep model choice, system prompt, and generation settings here so
 * every route/component that talks to the model stays in sync.
 */

// The model used for all chat completions in this app.
// Llama 3.3 70B is a strong, fast, free-tier-friendly choice on Groq.
export const chatModel = groq("llama-3.3-70b-versatile");

// The assistant's persona and behavior. Edit this single string to
// change how the assistant responds across the whole app.
export const systemPrompt = `
You are a helpful task-planning assistant inside a task manager app.

When the user describes something they need to do (a goal, an event,
a big vague task, or a rough plan), break it down into a short list of
clear, actionable tasks. Keep each task specific and doable — avoid
vague items like "prepare" or "plan" without a concrete action.

Keep responses concise. Use a numbered or bulleted list for tasks when
appropriate. If the user is just chatting or asking a question instead
of describing something to plan, respond naturally and helpfully
without forcing a task list.
`.trim();

// Shared generation settings.
export const chatSettings = {
  temperature: 0.7,
  maxOutputTokens: 800,
};