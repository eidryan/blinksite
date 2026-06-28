# Blink Home Radar and Research Sections

## Latest Radar Card Plan

- [x] Confirm current `blink-press` source of truth and live latest Radar post.
- [x] Choose the structured JSON endpoint design instead of scraping `/radar` HTML.
- [x] Write implementation plan for `blink-hub` latest endpoint plus `blinksite` card integration.
- [x] Add and test the `blink-hub` latest-post helper against existing Radar fixtures.
- [x] Add the `blinksite` latest-post fetch helper, Vercel rewrite, component wiring, and source verifier checks.
- [x] Verify the `blinksite` source checks, targeted ESLint, and production build.
- [x] Create `blink-press/app/api/radar/latest/route.ts` after writable access allowed creating the new `app/api/radar/latest` directory.
- [x] Verify the actual JSON endpoint and browser-visible homepage card against the local `blink-press` server.

## Task 2 Executor Checklist

- [x] Read `.superpowers/sdd/task-2-brief.md` and confirm the allowed file scope.
- [x] Run `npm run verify:home-radar-research` first and capture the expected baseline failure.
- [x] Replace `src/components/RadarResearchSections.jsx` with the approved editorial-window implementation from the brief.
- [x] Re-run `npm run verify:home-radar-research` and confirm the stricter checks pass.
- [x] Run `npm run build` to verify the homepage still compiles.
- [x] Write the required execution report to `.superpowers/sdd/task-2-report.md`.

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
- [x] Tighten `scripts/verify-home-radar-research.mjs` so it protects visible `04. Radar` and `05. Research` labels again.
- [x] Redesign `src/components/RadarResearchSections.jsx` around separate section headers plus a compact editorial window card for each destination.
- [x] Remove the sticky pin/blur stacking behavior and keep motion to section reveal, card tilt, and card hover only.
- [x] Verify with source checks, production build, and desktop/mobile browser review.

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

- 2026-06-28 latest Radar card work is partially implemented: `blinksite` now fetches `/api/radar/latest`, normalizes the payload, and uses the latest post only for the Radar card while preserving static fallback and standalone CTAs.
- `blink-press` helper/test work is present in the adjacent checkout and passes `npm test`; the route handler now exists at `app/api/radar/latest/route.ts`.
- Verified latest Radar work with `npm run verify:home-radar-research`, targeted ESLint, `npm run build`, and `blink-press` `npm test` plus `npm run build`; the `blink-press` build route list now includes `/api/radar/latest`.
- Runtime QA confirmed `GET http://127.0.0.1:3000/api/radar/latest` returns 200 JSON with the latest published Radar post, and `http://127.0.0.1:5175/#radar` renders that post in the Radar card while standalone CTAs still point to `/radar`.
- 2026-06-27 restart completed around the approved `Janela Editorial Blink` direction.
- Replaced the overbuilt pinned/glass-stacking Radar/Research treatment with two separate editorial destination windows.
- Preserved visible sequence labels: `04. Radar`, `05. Research`, `06. Fundadores`, and corrected footer contact to `07. Contato`.
- Post-review fix: card links now expose accessible names with CTA plus editorial title, instead of repeating only the generic CTA.
- Post-review fix: `scripts/verify-home-radar-research.mjs` now checks JSX wiring for ids, themes, labels, body copy, card title/excerpt, href usage, accessible card labels, and mobile CTA source order.
- Post-review cleanup: `scripts/verify-scroll-behavior.mjs` now validates normal non-pinned scroll behavior for Radar and Research across desktop/mobile.
- Tightened `scripts/verify-home-radar-research.mjs` to protect labels, destinations, approved copy, no UFF copy, no sticky pinning, no `h-screen`, no blur-stacking, contact numbering, and rendered JSX wiring.
- Verified with `npm run verify:home-radar-research` (`41 checks`).
- Verified with `npx eslint src/components/RadarResearchSections.jsx src/components/Footer.jsx scripts/verify-home-radar-research.mjs scripts/verify-scroll-behavior.mjs`.
- Verified with `npm run build`; Vite still reports the existing chunk-size warning after a successful build.
- Verified with `node scripts/verify-scroll-behavior.mjs`; rerun required elevated local-port/browser access after sandbox blocked binding `::1:5173`.
- Browser-reviewed `#radar` and `#research` at 390x844 and 1440x900: labels and CTAs are visible in the intended breakpoints, Radar/Research have no internal horizontal overflow, and `/radar`/`/research` links remain intact.

- Design spec written: `docs/superpowers/specs/2026-06-26-blink-home-radar-research-design.md`.
- Gemini execution plan written: `docs/superpowers/plans/2026-06-26-blink-home-radar-research-gemini.md`.
- Spec self-review passed: no placeholders, no conflicting section order, and UFF appears only as a forbidden-copy rule.
- Implemented separate `04. Radar` and `05. Research` sections after `Portfolio`.
- Moved `Fundadores` to `06. Fundadores`.
- Navbar now anchors to `#radar` and `#research`; section CTAs navigate to `/radar` and `/research`.
- Verified with `npm run verify:home-radar-research`.
- Verified with `npm run build`.
- Browser-reviewed desktop and mobile layouts locally.
