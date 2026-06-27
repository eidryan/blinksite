# Blink Home Radar and Research Sections

## Recovery Plan - Blog Window Direction

- [x] Inspect current branch, recent commits, and existing Radar/Research implementation.
- [x] Compare the current result against the approved requirement: separate `04. Radar`, `05. Research`, and `06. Fundadores`.
- [x] Review the 21st.dev `glass-blog-card` inspiration and identify the intended pattern: editorial preview card, not a full-section glass stacking interaction.
- [x] Audit the browser-visible current result for lost labels, CTA duplication, anchor/header overlap, and oversized pinned animation.
- [x] Restart the concept around Radar and Research as two editorial destinations from Blink, presented in a stimulating way.
- [x] Check in on the proposed visual direction before implementation.
- [x] Validate the detailed "Janela Editorial Blink" design before writing the spec.
- [x] Write the approved restart spec in `docs/superpowers/specs/2026-06-27-blink-editorial-window-design.md`.
- [x] Self-review the written spec for contradictions, vague requirements, and missing verification criteria.
- [x] Write the implementation plan in `docs/superpowers/plans/2026-06-27-blink-editorial-window-implementation.md`.
- [ ] Tighten `scripts/verify-home-radar-research.mjs` so it protects visible `04. Radar` and `05. Research` labels again.
- [ ] Redesign `src/components/RadarResearchSections.jsx` around separate section headers plus a compact editorial window card for each destination.
- [ ] Remove the sticky pin/blur stacking behavior and keep motion to section reveal, card tilt, and card hover only.
- [ ] Verify with source checks, production build, and browser review on desktop and mobile.

## Current Recovery Findings

- The current implementation keeps two DOM sections, but no longer renders visible `04. Radar` or `05. Research`.
- The latest verifier was relaxed to check eyebrows instead of the approved section labels, so it can pass while the visual numbering is broken.
- The current card is too large for the blog-window inspiration: it has pinned full-screen sections, duplicated CTAs, blurred stacking, and oversized internal illustrations.
- The reusable idea from the 21st.dev reference is the compact editorial structure: image preview, tags, headline, excerpt, metadata, and one clear hover/click action.
- The smallest likely change set is `src/components/RadarResearchSections.jsx` and `scripts/verify-home-radar-research.mjs`; `App.jsx`, `Navbar.jsx`, and `Fundadores.jsx` already have the correct wiring.
- Restart decision: the section should present Radar and Research as two Blink editorial destinations, but with enough visual pull to make visitors want to open them.
- Tone decision: avoid a playful/ludic treatment. Radar should mix editorial curiosity with market urgency; Research should mix editorial curiosity with applied authority. The interaction should read as "clique para conhecer", not as a game or abstract spectacle.
- Selected direction: `Janela Editorial Blink`.

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
