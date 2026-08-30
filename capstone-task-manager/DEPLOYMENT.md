# Deployment Checklist — TaskFlow

Filled out and signed off as part of the "Ship It" capstone (FE-12).

## Pre-deploy

- [x] `GROQ_API_KEY` set in Vercel → Settings → Environment Variables, for
      Production, Preview, and Development environments.
- [x] `npm run build` succeeds locally with no errors.
- [x] `npm run test` — all tests pass (41/41 at time of this checklist).
- [x] `npm run lint` — no blocking errors.
- [x] Framework Preset in Vercel confirmed as **Next.js** (learned the hard
      way on a sibling project, `fe-aa3-shader-hero`, where this being set
      to "Other" caused a build failure — checked explicitly here as a
      result).

## Production hygiene

- [x] Rate limiting on `/api/chat` (`lib/ai/rate-limit.ts`) — 10
      requests/minute per IP, documented limitation: in-memory, resets on
      cold start.
- [x] Input caps on `/api/chat` — max 2000 chars/message, max 40
      messages/thread.
- [x] `maxDuration = 30` set on the streaming route.
- [x] Error states are visible to the user, not silent failures: a failed
      chat message shows a retry card (`chat-error-card` in `Chat.tsx`)
      instead of the UI hanging or crashing.

## Accessibility & performance

- [x] Lighthouse Performance ≥ 90 on both audited pages (Dashboard: 96,
      Chat: 94 — see `AUDIT.md`).
- [x] Lighthouse Accessibility = 100 on both audited pages (see
      `AUDIT.md`).
- [x] WAVE: 0 errors on both audited pages (see `AUDIT.md`).
- [x] Keyboard-only pass completed on the primary flow (see `AUDIT.md`).

## Post-deploy verification

- [x] Live URL loads and the full flow works: Dashboard → Chat → send a
      message → get a streamed response → confirm-add a task → see it on
      the Tasks page.
- [x] Cross-browser pass: Chrome, Firefox, Safari, mobile Safari (see
      `README.md` → "Cross-browser testing").

## Rollback plan

This app has no database and no migrations, so rollback is simple:

1. **Fastest path — Vercel's own rollback:** Vercel keeps every previous
   deployment. If a bad deploy goes out, go to the project's
   **Deployments** tab, find the last known-good deployment, and click
   **"Promote to Production"** — this is instant and requires no code
   changes.
2. **If the bad code was already merged to `main`:** `git revert` the
   offending commit(s) and push — Vercel auto-deploys the reverted state.
3. **Monitoring, honestly stated:** there is no dedicated uptime/error
   monitoring service (e.g. Sentry) wired up for this project — that's a
   real gap, not hidden here. In its current state, "monitoring" means
   manually checking Vercel's deployment logs and the live URL after any
   change. Listed under "what I'd add with more time" in `README.md` for
   exactly this reason.

## Signed off

Kajal Bhatiya — checked through this list against the live production
deployment before capstone submission.