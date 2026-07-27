# NOTES.md — Comparing my components to shadcn/ui

## Modal vs shadcn Dialog

1. **Portal rendering.** shadcn renders the dialog into a React Portal
   (`DialogPortal`), mounting it outside the normal component tree. Mine
   renders inline where the component sits in the DOM. In a real app with
   nested layouts, an inline modal can get visually or functionally trapped
   inside a parent with `overflow: hidden` or a low `z-index`. A portal
   avoids that entirely.

2. **Focus trap is a tested primitive, not hand-written.** I wrote my own
   Tab-cycling logic by querying focusable elements and manually wrapping
   focus at the first/last element. shadcn's version outsources this to
   Base UI's `Dialog.Root`/`Popup`, which has presumably been tested against
   edge cases I didn't think to handle — like focusable elements that get
   added or removed while the dialog is open.

3. **No `DialogDescription`.** shadcn separates a `Title` from a
   `Description`, giving screen readers both a label and supplementary
   context via `aria-describedby`. My modal only has a title — there's no
   way to attach descriptive text with its own ARIA relationship.

## Tabs vs shadcn Tabs

1. **No vertical orientation support.** shadcn's Tabs explicitly supports
   `orientation="vertical"`, which per the APG pattern should respond to
   **ArrowUp/ArrowDown** instead of ArrowLeft/ArrowRight. My version only
   handles the horizontal case — reusing it for a vertical layout would be
   keyboard-incorrect per spec.

2. **No disabled-tab handling.** shadcn's trigger supports a disabled state
   (`aria-disabled`, skipped interaction). My `focusTab` function would
   happily focus a "disabled" tab since I never accounted for that case —
   arrow-key navigation doesn't skip anything.

3. **Keyboard logic is hand-rolled vs. outsourced.** Same story as the
   modal — my arrow-key/Home/End logic is a `handleKeyDown` function I wrote
   from the APG spec. shadcn relies on Base UI's tested `Tab` primitive.

## What I'd take away from this
Building these by hand was useful for actually understanding *why* each
ARIA attribute and keyboard interaction exists — I wouldn't have known to
check for a focus trap or roving tabindex if I hadn't implemented it
myself. But shadcn's versions are clearly hardened against edge cases
(orientation, disabled states, portal rendering) that I didn't think to
handle, which is exactly why "read the generated source" matters — it's
not just boilerplate, it's covering scenarios my quick implementation
missed.