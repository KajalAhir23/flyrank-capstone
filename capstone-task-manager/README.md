# TaskFlow — AI-Powered Task Manager

A task management app built with Next.js App Router, featuring a streaming AI
assistant that turns your goals into actionable tasks.

**Live demo:** https://flyrank-capstone-donq.vercel.app/

## Features

- **AI Task Assistant** (`/chat`) — describe a goal in plain language and get
  it broken down into concrete tasks, streamed token-by-token. Suggested
  tasks can be added directly to your task list with one click.
- **Dashboard** (`/`) — live overview of total, completed, and pending tasks.
- **Tasks** (`/tasks`) — view, check off, delete, or manually add tasks.
- **Settings** (`/settings`) — dark mode toggle and a "clear all tasks" reset.

## Tech stack

- **Next.js** (App Router) + TypeScript
- **AI SDK** (`ai`, `@ai-sdk/react`) for streaming chat
- **Groq** (Llama 3.3 70B) as the model provider, via `@ai-sdk/groq`
- **Tailwind CSS v4** for styling
- Task/theme state persisted client-side via `localStorage`

## Key files

- `app/api/chat/route.ts` — server route handler, streams responses using
  `streamText` from the AI SDK.
- `components/Chat.tsx` — the streaming chat UI (`useChat`, thinking
  indicator, stop button, auto-scroll, task-suggestion buttons).
- `lib/ai/config.ts` — model choice, system prompt, and generation settings
  in one place.
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

```
GROQ_API_KEY=your-key-here
```