# Reflection

## What was hardest, and why

The hardest part wasn't writing code — it was actually understanding new
concepts well enough to know when something was wrong, in three areas I'd
never worked with before this internship: accessibility, shaders, and AI
tool calling.

With accessibility, the difficulty wasn't running WAVE or Lighthouse —
those just spit out numbers. It was understanding *why* three separate-
looking contrast errors (a button, a nav pill, a label) all traced back to
one root cause: a single `--accent` CSS variable being asked to do two
contradictory jobs (readable text color vs. a background dark enough for
white text). Until I understood the actual WCAG contrast-ratio math, I
would have "fixed" each symptom individually and probably introduced new
inconsistencies.

With shaders, I had zero prior GLSL knowledge. The hardest part was that a
shader can be *syntactically correct and still render as almost entirely
black* — the bug (color values clipping below zero) wasn't visible from
reading the code, only from seeing the actual rendered output and reasoning
backward about the math. That's a different kind of debugging than I was
used to.

With AI tool calling (`scoreTaskPriority`, `confirmAddTask`), understanding
*why* a tool needs `stopWhen: stepCountIs(5)` to chain from one tool call
into a client-side confirmation, in the same conversational turn, took
longer to click than I expected — it's a different mental model than a
normal request/response API call.

## What I'd do differently

I'd test the deployed app earlier and more often, instead of trusting that
a passing local dev server and a green build meant the feature actually
worked. The clearest example: the chat feature was completely broken in
production for a stretch of time — not because of a bug in the code I'd
written, but because Groq deprecated the exact model
(`llama-3.3-70b-versatile`) the app was calling. Locally, this had never
surfaced as an error I'd seen, and the build always succeeded, because a
missing/deprecated model isn't a compile-time or type error — it's a
runtime failure that only shows up when you actually try to use the
feature against the real API. I only found it because I happened to
actually click "send" on the live URL while working on an unrelated
accessibility assignment, not because any automated check caught it.

Next time, "deploy and forget" isn't good enough — I'd build in a habit of
actually using the live app's core flow after every deploy, not just
checking that the build succeeded.

## One thing that surprised me

That a green build and passing tests don't mean the app actually works in
production. Before this project, "tests pass" and "it builds" felt like
strong enough signals that a feature was fine. The Groq model deprecation
proved that wrong in the most direct way possible: `npm run build`
succeeded, all local tests passed, and the deployed app's core feature
(chat) was completely non-functional the whole time, because the failure
mode was external (a third-party API's model catalog changing), not
anything my code or tests could have caught on their own. It's changed how
I think about "done" — done means verified against the real, deployed
thing, not just a clean build log.