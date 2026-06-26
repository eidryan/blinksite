# Blink Home Radar and Research Sections

## Working Plan

- [x] Inspect current homepage structure, section order, navbar scroll behavior, and existing Radar/Research routing.
- [x] Clarify the exact positioning and message for the new Radar/Research square.
- [x] Propose 2-3 design approaches for the square, including layout, copy, CTA behavior, and header animation impact.
- [x] Get approval on the revised Research copy before implementation.
- [x] Write the approved design spec in `docs/superpowers/specs/`.
- [x] Create the implementation plan with verification steps.
- [x] Implement only after plan approval.
- [x] Verify with build and browser-level review.

## Current Findings

- The homepage order is `Hero -> Sobre -> ComoAtuamos -> Portfolio -> Fundadores -> Footer`.
- `Radar` and `Research` already exist as navbar links and Vercel rewrites to `blink-press`.
- The content purpose from `docs/blink-press-deploy-status.md` is:
  - `/radar`: curated news for PMEs with "por que isso importa" analysis.
  - `/research`: deeper papers with academic depth and immediate application.
- The navbar currently changes style after the hero and uses section IDs for active underline state.
- The new sections should be added to the section/scroll-spy structure so the header animation and active state work when visitors reach them.

## Confirmed Direction

- Use two separate sequential sections.
- `04. Radar` comes first and explains Radar.
- `05. Research` comes next and explains Research.
- `06. Fundadores` comes after Research.
- Radar copy is approved.
- The planned animations are approved.

## Approved Decision

The revised Research copy is approved.

## Selected Approach

Use the "Radar -> Research as a knowledge journey" approach, but split across separate homepage sections:

- Radar frames Blink as a company that watches market signals.
- Research frames Blink as a bridge between academic production and Brazilian PMEs.
- Research must not say that Blink is incubated by UFF.
- Research should say that the area presents papers, research, and tools developed by academia to PMEs in Brazil.
- The sections should sit after `Portfolio` and before `Fundadores`.

## Review

- Design spec written: `docs/superpowers/specs/2026-06-26-blink-home-radar-research-design.md`.
- Gemini execution plan written: `docs/superpowers/plans/2026-06-26-blink-home-radar-research-gemini.md`.
- Spec self-review passed: no placeholders, no conflicting section order, and UFF appears only as a forbidden-copy rule.
- Implemented separate `04. Radar` and `05. Research` sections after `Portfolio`.
- Moved `Fundadores` to `06. Fundadores`.
- Navbar now anchors to `#radar` and `#research`; section CTAs navigate to `/radar` and `/research`.
- Verified with `npm run verify:home-radar-research`.
- Verified with `npm run build`.
- Browser-reviewed desktop and mobile layouts locally.
