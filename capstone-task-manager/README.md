# TaskFlow — AI-Powered Task Manager

A task management app built with Next.js App Router, featuring a streaming AI
assistant that turns your goals into actionable tasks.

**Live demo:** https://flyrank-capstone-donq.vercel.app/

## Features

- **AI Task Assistant** (`/chat`) — describe a goal in plain language and get
  it broken down into concrete tasks, streamed token-by-token. Suggested
  tasks can be added directly to your task list with one click. Can also
  score a task's priority/urgency on request, rendered as a real component.
- **Dashboard** (`/`) — live overview of total, completed, and pending tasks.
- **Tasks** (`/tasks`) — view, check off, delete, or manually add tasks.
- **Settings** (`/settings`) — dark mode toggle and a "clear all tasks" reset.

## Tech stack

- **Next.js** (App Router) + TypeScript
- **AI SDK** (`ai`, `@ai-sdk/react`) for streaming chat and tool calling
- **Groq** (Llama 3.3 70B) as the model provider, via `@ai-sdk/groq`
- **Zod** for tool input schema validation
- **Tailwind CSS v4** for styling
- Task/theme state persisted client-side via `localStorage`

## Key files

- `app/api/chat/route.ts` — server route handler, streams responses using
  `streamText` from the AI SDK, with tools registered.
- `components/Chat.tsx` — the streaming chat UI (`useChat`, thinking
  indicator, stop button, auto-scroll, task-suggestion buttons, tool part
  rendering).
- `lib/ai/config.ts` — model choice, system prompt, and generation settings
  in one place.
- `lib/ai/tools.ts` — server-side AI tool definitions (Zod schema + execute
  functions).
- `lib/tasks.ts` — shared task store (add/toggle/delete/clear), used by the
  chat, dashboard, and tasks pages.

## Getting started locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll need a
`GROQ_API_KEY` in a `.env.local` file to use the AI assistant (get one free
at [console.groq.com/keys](https://console.groq.com/keys)).

## AI Tools

### `scoreTaskPriority`

Defined in `lib/ai/tools.ts`, registered in `app/api/chat/route.ts`.

The assistant calls this tool when the user asks to prioritize, score, or
estimate urgency/effort for a specific task. The scoring logic is real
keyword analysis run server-side — not a number invented by the model.

**Input schema:**
```ts
{
  title: string;          // required, the task title
  description?: string;   // optional extra detail
}
```

**Return shape:**
```ts
{
  title: string;
  urgency: "low" | "medium" | "high";
  score: number;           // 0-100
  estimatedMinutes: number;
  category: string;        // e.g. "Quick task", "Project", "General"
  reasoning: string;       // short explanation of the score
}
```

**UI states rendered** (`components/Chat.tsx`, `ToolPart` component):
- `input-streaming` / `input-available` — dashed loading card with spinner
- `output-available` — Priority Score Card: colored urgency dot, score
  ring, category, time estimate, reasoning
- `output-error` — red-bordered error card, no crash

### `confirmAddTask`

Defined in `lib/ai/tools.ts`, registered in `app/api/chat/route.ts`.

A client-side, user-interaction tool (no `execute` function) — the model
calls it, but the UI collects the actual answer. Used right after scoring
a task as HIGH urgency, to confirm before adding it to the task list.

**Input schema:**
```ts
{
  title: string;   // the exact task title to potentially add
}
```

**Return shape (provided by the client via `addToolOutput`):**
```ts
{
  confirmed: boolean;
}
```

**UI states rendered** (`components/Chat.tsx`, `ConfirmToolPart` component):
- `input-available` — "Add [title] to your tasks now?" with Yes/No buttons
- `output-available` — "✓ Added to your tasks" or "Skipped — not added"

Requires `stopWhen: stepCountIs(5)` in the route handler so the model can
chain from `scoreTaskPriority` into `confirmAddTask` in the same turn.