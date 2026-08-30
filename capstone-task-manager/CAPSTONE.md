# Ship It — Capstone Submission: TaskFlow

## Project Brief

TaskFlow is a task manager where you describe a goal in plain language and
an AI assistant turns it into concrete, actionable tasks — scoring how
urgent each one is and asking for explicit confirmation before adding
anything to your list, rather than just being a chatbot that echoes ideas
back. It's built for anyone who already has a mental list of things to do
but finds turning that into an organized, prioritized task list tedious. I
chose this idea because I wanted the AI integration to solve a real
problem — actually helping decide *what to do first* — rather than bolting
a text box onto an otherwise ordinary CRUD app.

---

## Live, Deployed Application

**URL:** https://flyrank-capstone-donq.vercel.app

Fully functional, not a mockup — Dashboard, Chat (with real streaming AI
responses and two working AI tools), and a Tasks list all work end-to-end
against the live URL. WCAG 2.1 AA-audited (see Performance & Accessibility
section below).

---

## Repository & README

**Repo:** https://github.com/KajalAhir23/flyrank-capstone
**Full README:** https://github.com/KajalAhir23/flyrank-capstone/blob/main/capstone-task-manager/README.md

The README covers setup/run instructions (`npm install && npm run dev`),
a full architecture overview, exactly how the two AI tools
(`scoreTaskPriority`, `confirmAddTask`) work with their input/output
schemas, an environment variable table, explicit decisions and tradeoffs
(no database, in-memory rate limiter, why the Groq model was switched
mid-project), and known limitations — rather than restating all of that
here, this submission links to it as the source of truth.

---

## AI Integration — Summary

(Full detail in README's "AI Tools" section.)

The assistant has two tools wired directly into the model (not just
prompted for, but structurally defined with Zod schemas):

- **`scoreTaskPriority`** — the model calls this when a user asks how
  urgent/effortful a task is. Returns a real score (0–100), urgency level,
  time estimate, and reasoning, rendered as an actual UI component (a
  score ring + reasoning card), not just text.
- **`confirmAddTask`** — a client-side confirmation tool. After scoring a
  task as high-urgency, the assistant asks the user to confirm before it's
  added to their list — the model never silently writes data.

Model: Groq's `openai/gpt-oss-120b` (switched from `llama-3.3-70b-versatile`
mid-project after Groq deprecated it — see "Reflection" below for what that
taught me).

---

## Testing Evidence

41 tests across 5 test files, all passing. Overall coverage: **55.75%
statements / 59.06% lines** (v8 coverage report), above the 50% bar.

```
 ✓ lib/tasks.test.ts (15 tests)
 ✓ lib/ai/rate-limit.test.ts (9 tests)
 ✓ components/PriorityScoreCard.test.tsx (6 tests)
 ✓ components/Chat.test.tsx (7 tests)
 ✓ app/tasks/new/page.test.tsx (4 tests)

 Test Files  5 passed (5)
      Tests  41 passed (41)

 % Coverage report from v8
------------------------|---------|----------|---------|---------|
File                    | % Stmts | % Branch | % Funcs | % Lines |
------------------------|---------|----------|---------|---------|
All files               |   55.75 |    48.69 |   59.57 |   59.06 |
 lib/tasks.ts           |   95.83 |    83.33 |     100 |     100 |
 lib/ai/rate-limit.ts   |   78.12 |    78.26 |   66.66 |   83.33 |
 PriorityScoreCard.tsx  |     100 |      100 |     100 |     100 |
------------------------|---------|----------|---------|---------|
```

`lib/tasks.ts` (the task store) and `lib/ai/rate-limit.ts` (rate limiting +
input validation) are pure-logic files with no prior test coverage before
this capstone submission — added specifically to close that gap and push
overall coverage past 50%.

---

## Performance & Accessibility Audit

Full before/after detail in
[`AUDIT.md`](https://github.com/KajalAhir23/flyrank-capstone/blob/main/capstone-task-manager/AUDIT.md).
Summary:

| Page | Lighthouse Performance | Lighthouse Accessibility | WAVE Errors |
|---|---|---|---|
| Dashboard | 96 | 100 | 0 |
| Chat | 94 | 100 | 0 |

**One concrete improvement made from audit findings:** WAVE flagged 3
separate-looking contrast errors on the Dashboard. Rather than patching
each one individually, I traced them to a single root cause — one CSS
variable (`--accent`) being reused both as text color and as a solid
button background, two roles that need opposite luminance to meet WCAG AA
simultaneously. Fixed by splitting it into two purpose-built variables
(`--accent` for text, `--accent-solid` for backgrounds), which resolved
all three errors at once and raised Dashboard Accessibility from 95 to 100.

---

## Deployment & Operation

Full checklist:
[`DEPLOYMENT.md`](https://github.com/KajalAhir23/flyrank-capstone/blob/main/capstone-task-manager/DEPLOYMENT.md)

- **Error states:** a failed chat message shows a visible retry card
  instead of hanging or crashing silently.
- **Production hygiene:** per-IP rate limiting (10 req/min), input caps
  (2000 chars/message, 40 messages/thread), `maxDuration = 30`.
- **Rollback plan:** Vercel retains every previous deployment — a bad
  deploy can be reverted instantly via "Promote to Production" on the last
  known-good deployment, no code changes required. No database means no
  migration rollback complexity.
- **Monitoring, stated honestly:** there is no dedicated error/uptime
  monitoring service wired up. Verification is currently manual (checking
  Vercel's deployment logs and the live URL after changes) — a real,
  acknowledged gap, listed under "what I'd add" in the README.

---

## Reflection

Full reflection:
[`REFLECTION.md`](https://github.com/KajalAhir23/flyrank-capstone/blob/main/capstone-task-manager/REFLECTION.md)

Short version: the hardest part was building real understanding in three
areas I'd never worked in before (accessibility, GLSL shaders, AI tool
calling) rather than just writing code. The thing I'd do differently is
test the *deployed* app earlier and more often instead of trusting a green
build and passing local tests. And the thing that genuinely surprised me:
a passing build and passing tests don't mean an app actually works in
production — proven directly when Groq deprecated the model this app was
calling, which broke chat in production silently, with the build and every
local test still green the whole time.