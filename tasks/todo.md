# Organic SEO Pages Diagnosis - 2026-06-30

## Domain Readiness Plan - 2026-07-01

- [x] Confirm the local `blinksite` checkout is linked to the intended Vercel project/team.
- [x] Inspect which Vercel project currently owns `blinkgroup.com.br` and `www.blinkgroup.com.br`.
- [x] Verify public DNS for apex and `www`.
- [x] Decide the immediate canonical domain owner before continuing Radar architecture work.
- [x] If needed, fix project domain assignment/alias so the root site can go live ready.
- [x] Verify production headers/routes on the final domain after deploy or alias changes.

## Domain Readiness Findings

- `.vercel/project.json` links this checkout to Vercel project `blinksite` under team `blinkgroup`.
- `vercel inspect https://blinkgroup.com.br` and `https://www.blinkgroup.com.br` both resolve to the same production `blinksite` deployment.
- Public DNS resolves `blinkgroup.com.br` to `216.198.79.1`; `www.blinkgroup.com.br` is a CNAME to `blinkgroup.com.br`.
- The immediate canonical owner should remain `blinksite`; Radar/Research can be served under that domain via the local proxy while the longer architecture decision stays open.
- `vercel domains inspect` reports no direct domain object access under the current CLI account, and `vercel domains ls` returns 0 domains, but deployment aliases and DNS are already serving the root project correctly.
- No DNS/domain reassignment was needed. Published production deployment `dpl_EeLsgATu7wzEUBogwPDB2MKqJzrz` (`blinksite-6hy6h7738-blinkgroup.vercel.app`) and Vercel aliased it to `https://blinkgroup.com.br` and `https://www.blinkgroup.com.br`.
- Updated `package.json` to Node `24.x` before the final deploy, removing the Vercel Node 20 deprecation blocker for future deployments.
- Verified production after final deploy: apex `/`, `/radar`, `/research`, `/radar/anpd-fiscalizacao-dados-clientes`, `/sitemap.xml`, and `/robots.txt` return `200`.
- Verified canonical domain behavior after final deploy: `https://www.blinkgroup.com.br/` and `https://www.blinkgroup.com.br/radar` return `308` redirects to the apex domain.
- Verified production SEO headers after final deploy: `/radar`, `/research`, the article URL, `/sitemap.xml`, and `/robots.txt` no longer emit `x-robots-tag: noindex`.
- Verified production `robots.txt` allows `/`, disallows `/preview/`, `/keystatic/`, and `/admin`, and points to `https://blinkgroup.com.br/sitemap.xml`.
- Verified production sitemap includes `https://blinkgroup.com.br/`, `/radar`, `/research`, and existing Radar article URLs.

- [x] Confirm the current branch, route ownership, and Vercel rewrite shape.
- [x] Trace how `/radar`, `/research`, blog assets, APIs, sitemap, and robots are served today.
- [x] Identify the root cause behind the roadmap/domain/project friction.
- [x] Compare the main solution paths: migrate into `blinksite`, keep `blink-press` behind rewrites, or split subdomains.
- [x] Document the diagnosis, recommended path, and verification evidence.

## Organic SEO Completion Plan - 2026-07-01

- [x] Add a `blinksite` Vercel Function proxy for the SEO-owned `blink-press` routes so `blinkgroup.com.br` can strip upstream `x-robots-tag: noindex`.
- [x] Route `/radar`, `/research`, `/sitemap.xml`, `/robots.txt`, and `/api/radar/latest` through the proxy while keeping the existing `blink-press` content source.
- [x] Make the proxied sitemap include the canonical Blink home URL without hardcoding the article list in `blinksite`.
- [x] Add an automated SEO surface verifier that proves the proxy strips `x-robots-tag`, guards the route map, and protects `robots.txt`/sitemap behavior.
- [x] Run source verification, lint/build checks, and local proxy behavior checks.
- [x] Document final verification evidence and any deploy-only checks still required.

## Organic SEO Completion Review

- Implemented `api/press-proxy.js` in `blinksite` as the minimum viable fix: it fetches allowed `blink-press` routes, strips upstream `x-robots-tag`, avoids copying unsafe response headers, blocks paths outside the allowlist, and adds the canonical home URL to proxied sitemap responses.
- Updated `vercel.json` so `/radar`, `/radar/:path*`, `/research`, `/research/:path*`, `/api/radar/latest`, `/sitemap.xml`, and `/robots.txt` route through the local proxy. `_next` assets and `/api/newsletter` remain direct rewrites to `blink-press`.
- Added `npm run verify:seo`; it passed with `45 checks`.
- Re-ran `npm run verify:home-radar-research`; it passed with `55 checks`.
- Ran targeted ESLint on `api/press-proxy.js`, `scripts/verify-seo-surface.mjs`, and `scripts/verify-home-radar-research.mjs`; it passed with no output.
- Ran full `npm run lint`; it still fails on pre-existing unrelated warnings/errors such as unused variables in UI/homepage files and `no-undef` in debug scripts. The SEO files added in this task are clean under targeted ESLint.
- Ran `npm run build`; it passed with the existing Vite chunk-size warning.
- Ran `vercel dev --listen 127.0.0.1:3005` and confirmed local Vercel routing returns `200` with no `x-robots-tag` for `/radar`, `/research`, `/radar/anpd-fiscalizacao-dados-clientes`, `/api/radar/latest`, `/sitemap.xml`, and `/robots.txt`.
- Confirmed local proxied `robots.txt` includes `Allow: /`, disallows preview/admin surfaces, and points to `https://blinkgroup.com.br/sitemap.xml`.
- Confirmed local proxied sitemap includes `https://blinkgroup.com.br/` plus the existing Radar/Research URLs.
- Production check completed after shipping: `curl -I` against `https://blinkgroup.com.br/radar`, `/research`, `/sitemap.xml`, `/robots.txt`, and one article URL proved the deployed domain no longer emits `x-robots-tag: noindex`.

## Organic SEO Diagnosis Findings

- `blinksite` owns the landing page and introduces Radar/Research as homepage sections, but it does not own the indexable organic pages.
- `vercel.json` rewrites `/radar`, `/research`, `/_next/*`, `/api/radar/latest`, `/api/newsletter`, and `/sitemap.xml` to the separate `blink-press` Vercel app.
- `blink-press` is the actual content engine: Next.js, MDX content, generated metadata, JSON-LD, sitemap, robots, newsletter, Keystatic, and the Radar latest API.
- Production checks on 2026-06-30 showed `https://blinkgroup.com.br/radar`, `/research`, article detail pages, `/sitemap.xml`, `/api/radar/latest`, and proxied `/_next` assets return `x-robots-tag: noindex`.
- Production check showed `https://blinkgroup.com.br/robots.txt` returns 404 because `blinksite` does not proxy or serve it.
- `https://blinkgroup.com.br/` itself does not return `x-robots-tag: noindex`, so the problem is specific to the `blink-press` rewrite surface.
- `vercel inspect` showed both `blinkgroup.com.br` (`blinksite`) and `blink-press-blinkgroup.vercel.app` (`blink-press`) point to production deployments, so the `noindex` symptom is not simply a Preview deployment being hit.
- Most likely root cause: the main domain rewrites to the `blink-press` `.vercel.app` alias, and the upstream `x-robots-tag: noindex` header from that origin is preserved on the `blinkgroup.com.br` response.
- The solution proposed by the other partner is directionally right only if the goal is a single long-term app/domain owner. It is not a small migration because `blinksite` is Vite/React SPA and `blink-press` is the app with the actual SEO stack.

## Organic SEO Diagnosis Review

- Verified local source state with `npm run verify:home-radar-research` (`55 checks`).
- Verified `blinksite` production build with `npm run build`; build passed with only the existing Vite chunk-size warning.
- Verified production headers with `curl -I` for `/`, `/radar`, `/research`, an article detail URL, `/sitemap.xml`, `/robots.txt`, `/api/radar/latest`, and a proxied `/_next` CSS asset.
- Recommended immediate fix path: keep `blink-press` as the content engine for now, but stop leaking `noindex`, proxy/serve `robots.txt`, include the home URL in sitemap, and add a production smoke test for SEO headers.
- Recommended long-term path: migrate to one Next.js-owned web surface only if Blink wants a larger architectural consolidation; do not port the content into the current Vite SPA as-is.

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
