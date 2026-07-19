# Project: flyrank-capstone

## Stack
- Framework: [React / plain HTML-CSS-JS / etc]
- Styling: Tailwind CSS

## Conventions
- Commit format: Conventional Commits
- Formatting: 2-space indent

## Rules learned from Round 1 vs Round 2 drill

1. Forms must ship with tests covering every validation rule (required fields, format checks, boundary lengths) and the disabled/enabled states of submit buttons — a form without these is not considered done, regardless of how correct it looks.
2. Repeated conditional logic for accessibility attributes (e.g. aria-describedby) must be extracted into a shared helper function, not duplicated per field — duplication risks silent, per-field accessibility bugs.
3. Any AI-assisted feature must go through an explicit write-then-verify loop (write code, write tests, run tests, fix failures) before being considered complete — accepting first-pass output without running tests is not acceptable, even if the output looks polished.