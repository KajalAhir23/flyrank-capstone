# FE-10: Accessibility and Performance Audit

**App audited:** TaskFlow (capstone-task-manager)
**Live URL:** https://flyrank-capstone-donq.vercel.app
**Pages audited:** Dashboard (`/`) and Chat (`/chat`)
**Tools used:** Lighthouse (Mobile preset, Chrome DevTools), WAVE (WebAIM browser extension), manual keyboard-only pass

---

## 1. Baseline (before)

| Page | Lighthouse Performance | Lighthouse Accessibility | WAVE Errors | WAVE Alerts |
|---|---|---|---|---|
| Dashboard | 97 | 95 | 0 | 4 (3 contrast, 1 heading×3 counted separately, 1 redundant link) |
| Chat | 87 | 100 | 1 | 2 |

Screenshots: `audit/audit-before-lighthouse-home.png`, `audit/before-lighthouse-chat.png`, `audit/before-wave-home.png`, `audit/before-wave-chat.png`

### Issues found

**Dashboard — 3 contrast errors (WAVE):**
1. "Chat with AI Assistant" button — white text on `var(--accent)` background, 3.68:1 (needs 4.5:1)
2. "Dashboard" active nav pill — text on accent-soft background, 3.12:1
3. "OVERVIEW" eyebrow label — accent-colored text on surface background, 3.97:1

Root cause: a single `--accent` CSS variable (dark mode: `#3b82f6`) was being reused both as a *text* color (needs to be lighter for sufficient contrast against dark backgrounds) and as a *solid button background* under white text (needs to be darker for white text to read clearly). No single color value can satisfy both WCAG AA thresholds simultaneously — this was confirmed with contrast-ratio math before choosing replacement colors.

**Dashboard — 1 redundant link alert (WAVE):** the "TaskFlow" logo and the "Dashboard" nav item are adjacent links pointing to the same URL (`/`).

**Dashboard — 3 "possible heading" alerts (WAVE):** the bold `0` values under Total Tasks / Completed / Pending read visually like headings but aren't marked up with heading tags.

**Chat — 1 missing form label error (WAVE):** the message input had only a `placeholder`, no accessible name (`aria-label`, `id`+`<label>`, or `aria-labelledby`).

**Chat — no `aria-live` region:** streamed assistant responses were not announced to screen reader users as they arrived (an explicit FE-10 requirement for AI-specific accessibility).

**Chat — 1 "no heading structure" alert (WAVE):** unlike the Dashboard (which has an `<h1>Dashboard</h1>`), the Chat page has no heading at all.

---

## 2. Fixes applied

### Contrast (Dashboard, 3 errors → 0)
Split the single `--accent` variable into two purpose-built variables in `app/globals.css`:
- `--accent` (dark mode: `#93c5fd`) — kept for text-only usage (labels, icons, borders), now with enough luminance to read clearly against dark backgrounds and surfaces.
- `--accent-solid` (dark mode: `#1d4ed8`) — new variable for solid backgrounds paired with white text (buttons, avatars, active states), dark enough that white text clears 4.5:1 comfortably (~6.7:1).

Every CSS rule that used `var(--accent)` as a **background** under white text was switched to `var(--accent-solid)`: `.dashboard-chat-link`, `.chat-header-icon`, `.chat-avatar-assistant`, `.chat-message-user .chat-bubble`, `.chat-send-button`, `.tool-confirm-yes`, `.mbtn` (and its loading state). One additional instance was found and fixed directly in `app/page.tsx`, where the dashboard CTA button used a Tailwind arbitrary-value class (`bg-[var(--accent)]`) outside the shared CSS file — updated to `bg-[var(--accent-solid)]`.

Light mode was unaffected (its existing accent color already cleared both contrast checks) — a matching `--accent-solid` variable was added there too, set equal to the existing accent, purely for consistency across the codebase.

### Redundant link (Dashboard)
Added `aria-hidden="true"` and `tabIndex={-1}` to the "TaskFlow" logo link in `TopNav.tsx`, since the adjacent "Dashboard" nav item already provides a properly labeled, keyboard-reachable path to the same destination. This removes the duplicate from the accessibility tree and tab order while leaving the logo visually and functionally unchanged for mouse users.

*Note:* WAVE continued to flag this after the fix, because the link is still present in the DOM (just hidden from assistive tech). We're documenting this as **justified** rather than pursuing further changes: the actual accessibility impact is zero, since a screen reader or keyboard user can no longer reach or hear the duplicate link — this is standard practice on the vast majority of production sites (logo linking home + a "Home"/"Dashboard" nav item).

### Missing form label (Chat, 1 error → 0)
Added `aria-label="Describe something you need to do"` to the chat message `<input>` in `components/Chat.tsx`, matching its placeholder text so the accessible name and visible text stay in sync.

### Streamed output announced politely (AI-specific accessibility)
Added `role="log"`, `aria-live="polite"`, `aria-atomic="false"`, and `aria-relevant="additions text"` to the message-list container in `components/Chat.tsx`. This means:
- New messages and in-progress streaming text are announced to screen reader users automatically.
- `polite` ensures announcements wait for a natural pause rather than interrupting the user mid-action.
- `aria-atomic="false"` means only the *new* text is announced, not the entire conversation history re-read on every update.

### Keyboard-reachable stop button
Already implemented correctly before this audit: the Stop button (shown while a response is streaming) is a real `<button type="button">` with `aria-label="Stop generating"`, and was confirmed reachable and operable via `Tab` + `Enter`/`Space` during the manual keyboard pass below. No change needed.

### Not fixed — documented as justified (alerts only)
- **3 "possible heading" alerts** (Dashboard stat numbers) and **1 "no heading structure" alert** (Chat page) remain. These are WAVE *alerts*, not errors, and the assignment rubric explicitly allows alerts to be "fixed or justified." Given time constraints, these were deprioritized after the higher-impact fixes (contrast, missing label, aria-live) — they don't block screen reader users from understanding or using either page, since all interactive content is still properly labeled and operable. Flagged here as known follow-up work rather than silently left out.

---

## 3. Manual keyboard-only pass

Tested on the live production URL, no mouse used at any point.

- Tabbed from page load through the Dashboard: nav links, stat cards, and the "Chat with AI Assistant" button all received a clearly visible focus outline, in a logical top-to-bottom / left-to-right order.
- Reached and activated the Chat link via `Tab` + `Enter`.
- On the Chat page, tabbed to the message input, typed a message, and submitted with `Enter`.
- While the response was streaming, tabbed to the **Stop** button and successfully activated it with the keyboard alone.
- Result: the primary flow (navigate → open chat → send a message → stop a streaming response) is fully completable by keyboard alone, with visible focus indicators at every step.

---

## 4. After

| Page | Lighthouse Performance | Lighthouse Accessibility | WAVE Errors | WAVE Alerts |
|---|---|---|---|---|
| Dashboard | 96 | **100** | **0** | 4 (unchanged — all justified above) |
| Chat | 94 | **100** | **0** | 2 (unchanged — justified above) |

Screenshots: `audit/after-lighthouse-home.png`, `audit/after-lighthouse-chat.png`, `audit/after-wave-home.png`, `audit/after-wave-chat.png`

### Deltas
- Dashboard Accessibility: 95 → **100** (+5)
- Chat Accessibility: 100 → **100** (already perfect; missing-label error fixed without regressing the score)
- Chat Performance: 87 → **94** (+7 — likely noise/variance from the small DOM/CSS changes rather than a deliberate optimization, but confirms the accessibility fixes cost nothing on the performance budget)
- Dashboard Performance: 97 → 96 (−1, within normal Lighthouse run-to-run variance)
- WAVE Errors (both pages combined): 1 → **0**
- WAVE Contrast Errors (Dashboard): 3 → **0**

Both pages now clear the 90+ target (not just the 80 minimum) on every measured metric.

---

## 5. Bonus fix found during this audit

While testing the primary chat flow for the keyboard pass, discovered that chat was completely non-functional in production: the app was calling `llama-3.3-70b-versatile`, a Groq model deprecated on June 17, 2026. Traced via Vercel's runtime logs (`Error [AI_APICallError]`), confirmed against Groq's current model list, and fixed by switching to `openai/gpt-oss-120b` in `lib/ai/config.ts`. This was necessary to be able to test the "primary flow, chat included" requirement at all — without it, there was no way to reach the streaming/stop-button states this audit needed to check.

---

## 6. What I'd do with more time

- Add proper heading structure to the Chat page (currently has none) and convert the Dashboard's bold stat numbers into real `<h2>`/`<h3>` elements so screen reader users can navigate by heading.
- Run a second manual pass with an actual screen reader (NVDA or VoiceOver) rather than relying solely on WAVE's static analysis, since WAVE can't verify that the `aria-live` region is announced at a sensible pace during real streaming.
- Add automated Lighthouse CI (per the linked docs) so contrast/performance regressions are caught before merge, not after manual audit.