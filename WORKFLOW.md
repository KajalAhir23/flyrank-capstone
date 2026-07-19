# WORKFLOW.md

## The Experiment
I built the same settings form feature twice: once with a single vague prompt ("Build a settings form with validation"), and once with a precise prompt including file references, explicit constraints, accessibility requirements, and a verification step (write tests, run them, fix failures).

## Correctness
Round one produced a working form but shipped with **zero test files** — confirmed by `git show round-1-vague --stat`, which returned no test-related files at all. Round two included a 182-line test suite (`SettingsForm.test.tsx`) plus test setup infrastructure. During test execution, the AI caught two real bugs before finishing: typing 501 characters into the bio field was too slow (a performance issue under rapid input), and the disabled-save-button logic left the display name field in an invalid state under a specific interaction sequence. Both were fixed and re-verified before the round was considered done. Round one had no equivalent verification step, so any comparable bugs would have shipped silently.

## Accessibility
Both rounds implemented `aria-describedby` linking for error messages. The meaningful difference was in implementation quality: round one repeated the same conditional (`errors.field ? "field-error" : undefined`) inline for every field, while round two extracted this into a reusable `getFieldAriaProps()` helper. This isn't just cleaner code — it's more resistant to bugs, since a typo in one of round one's repeated conditionals could silently break accessibility for a single field without being caught anywhere.

## Edge Cases
Round two's precise prompt explicitly called out edge cases (empty required fields, invalid email, invalid URL, bio over character limit, reset behavior) and verified each with a dedicated test. Round one's vague prompt left edge-case handling entirely up to the model's judgment, with no way to confirm coverage without manual testing.

## Review Effort
This is the most counterintuitive part. Round two's prompt took longer to write and the AI's turn took longer to run (scaffolding, writing tests, catching and fixing two failures). But my own review time was much lower: I could trust the tests as verification instead of manually clicking through every field and edge case myself. Round one's output looked done faster, but I would have needed to manually verify validation logic, accessibility wiring, and edge cases myself before trusting it — work that round two's AI already did and proved with passing tests.

## Takeaway
The core lesson: a vague prompt doesn't save time, it just moves the verification burden from the AI onto me. A precise prompt with a built-in verification loop front-loads that cost into the AI's turn, where it's cheaper and more thorough than my own manual review would be.