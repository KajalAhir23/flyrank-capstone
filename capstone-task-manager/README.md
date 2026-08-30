# TaskFlow — AI-Powered Task Manager

A task management app built with Next.js App Router, featuring a streaming AI
assistant that turns your goals into actionable tasks.

**Live demo:** https://flyrank-capstone-donq.vercel.app/

## Screenshots

D:\flyrank-capstone\capstone-task-manager\docs\1dashbord.png
D:\flyrank-capstone\capstone-task-manager\docs\2chat.png
D:\flyrank-capstone\capstone-task-manager\docs\3task.png

## Features

- **AI Task Assistant** (`/chat`) — describe a goal in plain language and get
  it broken down into concrete tasks, streamed token-by-token. Suggested
  tasks can be added directly to your task list with one click. Can also
  score a task's priority/urgency on request, rendered as a real component.
- **Dashboard** (`/`) — live overview of total, completed, and pending tasks.
- **Tasks** (`/tasks`) — view, check off, delete, or manually add tasks.
- **Settings** (`/settings`) — dark mode toggle and a "clear all tasks" reset.

## Tech stack

- **Next.js 16** (App Router) + **React 19** + TypeScript
- **AI SDK** (`ai`, `@ai-sdk/react`) for streaming chat and tool calling
- **Groq** as the model provider, via `@ai-sdk/groq` — currently
  `openai/gpt-oss-120b` (switched from `llama-3.3-70b-versatile` after Groq
  deprecated that model; see "decisions" below)
- **Zod** for tool input schema validation
- **Tailwind CSS v4** for styling
- Task/theme state persisted client-side via `localStorage` — no database
- **Vitest** + **Testing Library** for unit tests, **Playwright** for e2e

## Run it locally

```bash
git clone https://github.com/KajalAhir23/flyrank-capstone.git
cd flyrank-capstone/capstone-task-manager
npm install
```

Create a `.env.local` file (see env var table below), then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other scripts

```bash
npm run build          # production build
npm run start           # run the production build locally
npm run lint              # eslint
npm run test                # vitest unit tests, single run
npm run test:watch           # vitest, watch mode
npx playwright test            # end-to-end tests
```

## Environment variables

| Variable | Required | Where to get it | Used for |
|---|---|---|---|
| `GROQ_API_KEY` | Yes | Free at [console.groq.com/keys](https://console.groq.com/keys) | Authenticates all chat/AI requests. Without it, `/chat` returns an API error; Dashboard, Tasks, and Settings still work normally since they don't depend on it. |

Set locally in `.env.local` (gitignored, never committed). In production
it's set in Vercel's **Settings → Environment Variables**, for Production,
Preview, and Development.

## Architecture overview

```
app/
  page.tsx              Dashboard
  chat/                 Chat page
  tasks/                Tasks list + task detail routes
  settings/             Settings page
  api/chat/route.ts     Server route: rate limit -> validate -> streamText
  motion-button/        Standalone demo page for MotionButton (FE-AA1)
  components/           Shared UI (TopNav, etc.)
lib/
  ai/
    config.ts            Model choice, system prompt, generation settings
    tools.ts               scoreTaskPriority + confirmAddTask (Zod schemas)
    rate-limit.ts             In-memory rate limiter + input validation
  tasks.ts                     Task store (add/toggle/delete/clear), localStorage-backed
  theme.ts                       Dark mode state
```

**Request flow:** `app/chat/page.tsx` renders `components/Chat.tsx`, which
uses the AI SDK's `useChat` hook to POST the conversation to
`app/api/chat/route.ts`. That route checks the per-IP rate limit, validates
input length/message count, then calls `streamText` with the Groq model and
both tools registered, streaming the result back token-by-token.

## Key files

- `app/api/chat/route.ts` — server route handler: rate limiting, input
  validation, then `streamText` from the AI SDK with tools registered.
- `components/Chat.tsx` — the streaming chat UI (`useChat`, thinking
  indicator, stop button, auto-scroll, task-suggestion buttons, tool part
  rendering).
- `lib/ai/config.ts` — model choice, system prompt, and generation settings
  in one place.
- `lib/ai/tools.ts` — server-side AI tool definitions (Zod schema + execute
  functions).
- `lib/ai/rate-limit.ts` — per-IP request throttling and input-size caps
  (added for FE-11; see "Production hygiene" below).
- `lib/tasks.ts` — shared task store (add/toggle/delete/clear), persisted
  to `localStorage`, used by the chat, dashboard, and tasks pages.

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

## Motion Button (FE-AA1)

Demo: `/motion-button`

A reusable animated button component (`components/MotionButton.tsx`) with
a full state lifecycle: idle → hover/focus → loading → success/error →
back to idle.

**Duration & easing choices:**
- Icon width/opacity/scale animate together at 260ms with a spring-like
  `cubic-bezier(0.34, 1.56, 0.64, 1)`, so the spinner/checkmark feels like
  it "arrives" rather than pops in.
- Background color transitions at 220ms ease — deliberate but not sluggish.
- Success draws an SVG checkmark stroke (320ms); error shakes once (380ms,
  transform-only, never repeats).
- Hover only animates `transform`/`box-shadow`, never causes layout shift.
- Under `prefers-reduced-motion`, all durations collapse near-zero —
  motion is removed, but color/icon state changes still communicate
  (verified: button still switches to green "Sent" with checkmark
  instantly instead of animating).

---

## Production hygiene (FE-11)

- **Rate limiting** — `lib/ai/rate-limit.ts` implements a per-IP sliding
  window: max 10 requests per minute. Requests over the limit get a `429`
  with a `Retry-After` header. **Honest limitation:** this is in-memory, so
  it resets on a serverless cold start and isn't shared across concurrent
  instances under real load — a reasonable deterrent against casual abuse
  at this project's traffic level, not a substitute for a distributed
  limiter (see "what I'd add" below).
- **Input caps** — the same file rejects any single message over 2000
  characters, and any request with more than 40 messages in one thread,
  both with a `400` and a clear error — so a malicious or buggy client
  can't send an oversized payload and burn through API credits in one
  request.
- **`maxDuration = 30`** is set on the streaming route, so a hung or
  unusually slow generation can't tie up a serverless function
  indefinitely.

## Decisions (and tradeoffs)

- **No database.** Tasks persist via `localStorage` rather than a real
  backend. This means task data is per-browser, not shared across devices,
  and clearing browser storage clears your tasks. Deliberate scope decision
  for a capstone timeline — the biggest thing a "real" version of this app
  would need next.
- **In-memory rate limiting over a distributed one.** Chosen for simplicity
  at capstone scale rather than adding an external Redis dependency for a
  project with no real production traffic yet.
- **Switched Groq models mid-project.** Originally used
  `llama-3.3-70b-versatile`; Groq deprecated it (June 17, 2026), which
  silently broke `/chat` in production even though local dev and the build
  both looked fine. Fixed by switching to `openai/gpt-oss-120b` after
  reading the actual runtime error in Vercel's logs and cross-checking
  Groq's current model list — not by guessing.
- **Two explicit AI tools instead of one open-ended prompt.**
  `scoreTaskPriority` and `confirmAddTask` are structured tools the model
  calls (Zod-validated), not just instructions in the system prompt — this
  makes their behavior testable and their output renderable as real UI (a
  score card, a yes/no confirm card) instead of parsing free-form text.

## How AI tools built this

Being direct about this rather than vague: this project was built primarily
by directing an AI assistant (Claude) to generate code, then reviewing,
testing, and fixing what it produced — rather than hand-writing most of it
from scratch. Specifics:

- **Where AI wrote most of the code:** the chat UI component, the AI tool
  definitions and their Zod schemas, the rate limiter, MotionButton's
  animation states, the shader-based hero experiment (separate assignment),
  and most of the styling.
- **Where I made calls AI can't make for you:** what to build at all (the
  task-manager concept, which two AI tools were worth building, the
  decision to persist via `localStorage` rather than add a database this
  cycle), and reviewing generated code for correctness rather than
  accepting it blindly.
- **A concrete bug AI-generated code didn't catch, that I found by
  testing:** the chat feature was calling a Groq model
  (`llama-3.3-70b-versatile`) that had been deprecated, which silently
  broke chat in production while local dev and the build both looked
  fine. Caught by actually using the deployed app rather than trusting a
  green build, diagnosed via Vercel's runtime logs, fixed by cross-checking
  Groq's current model list.
- **Where AI got things wrong and needed correction:** an early version of
  a shader effect (`fe-aa3-shader-hero`, a separate assignment) had a color
  formula that clipped to black across most of the frame — caught by
  looking at the actual rendered output, not by reading the GLSL source,
  since the bug wasn't visible from the code alone.
- **What I did not have AI do:** decide which accessibility/performance
  issues were worth fixing versus documenting as known limitations (see
  `AUDIT.md`), and verify every claim in this README against the actual
  codebase before writing it.

## Cross-browser testing (FE-11)

Manually tested the full flow (Dashboard → Chat → send message → tool
confirmation → Tasks page) on:

| Browser | Platform | Result |
|---|---|---|
| Chrome | Windows desktop | ✅ Full flow works |
| Firefox | macOS (via BrowserStack) | ✅ Full flow works |
| Safari | macOS (via BrowserStack) | ✅ Full flow works |
| Safari | iOS 17, iPhone 15 (via BrowserStack) | ✅ Full flow works, streaming and tool cards render correctly |
| Firefox | Android 13, Samsung Galaxy S23 (via BrowserStack) | ✅ Full flow works (bonus) |

No native macOS or iOS device was available, so Safari (desktop and mobile)
was tested via BrowserStack's real-device cloud rather than physical
hardware.

**Known issue found during this pass** (not browser-specific — reproduced
identically on every browser tested): the assistant's Markdown bold syntax
(`**text**`) renders as literal asterisks instead of bold text in the chat
bubble. Documented here as a known limitation rather than fixed under this
assignment's scope.

## What I'd add with more time

- A real database (Postgres via Vercel Postgres, or similar) so tasks sync
  across devices instead of being per-browser `localStorage`.
- A distributed rate limiter (Upstash Redis) if this saw real traffic.
- Proper Markdown rendering in chat bubbles instead of literal asterisks.
- Automated Lighthouse CI, building on the manual audit in `AUDIT.md`.

## Related documents in this repo

- `AUDIT.md` — FE-10 accessibility and performance audit (before/after
  Lighthouse and WAVE results, contrast fixes, keyboard-only pass).
- `fe-aa2-3d-viewer/README.md` — drag-and-drop 3D model viewer (FE-AA2),
  deployed independently.
- `fe-aa3-shader-hero/README.md` — custom WebGL shader hero (FE-AA3),
  deployed independently.