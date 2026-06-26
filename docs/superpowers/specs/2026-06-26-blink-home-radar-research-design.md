# Blink Home Radar and Research Sections Design

## Context

The Blink homepage is a Vite/React single-page site. The current homepage order is:

`Hero -> Sobre -> ComoAtuamos -> Portfolio -> Fundadores -> Footer`

`/radar` and `/research` already exist as public routes through Vercel rewrites to the separate `blink-press` project. The homepage now needs to actively introduce those destinations instead of only listing them in the navbar.

## Goal

Add two separate homepage sections after `Portfolio` and before `Fundadores`:

1. `04. Radar`
2. `05. Research`

`Fundadores` becomes `06. Fundadores`.

The sections should encourage visitors to open the Radar and Research areas while preserving the current Blink visual language, scroll behavior, and header animation.

## Content Requirements

### Radar

Radar copy is approved.

Section label: `04. Radar`

Core idea: `O que está mudando no mercado, antes de virar consenso.`

Body direction: Radar is a practical market-reading area for Brazilian PMEs. It curates news, signals, and shifts that matter, then explains why they matter and what small and medium businesses should watch.

CTA: `Conhecer o Radar`

Destination: `/radar`

### Research

Research copy is approved.

Section label: `05. Research`

Core idea: `Pesquisa aplicada para aproximar academia e mercado.`

Body copy:

`O ambiente onde a Blink aproxima as PMEs brasileiras do que está sendo produzido na academia: papers, pesquisas e ferramentas aplicadas que podem sair do laboratório e virar decisão, operação e produto no mercado real.`

CTA: `Explorar Research`

Destination: `/research`

Forbidden copy: Do not say that Blink is incubated by UFF. The page should describe the Research area as a bridge between academic production and Brazilian PMEs without naming the incubator relationship.

## Layout

Use two independent sections, not one combined section with two cards.

The sections should still read as a sequence:

1. Radar observes market signals.
2. Research translates academic production into applied business knowledge.
3. Fundadores follows after those two institutional/product-discovery sections.

Each section should use a large square-like feature panel inside a full-width section. The panel can be slightly wider than tall on desktop for responsive fit, but it should keep the requested "square" feeling through strong geometry, generous padding, and a single framed surface.

Recommended structure per section:

- Section wrapper with `id`, `data-theme`, vertical padding, and brand background.
- Section label pill.
- Large headline.
- Body paragraph.
- CTA button or link with existing cursor and hover behavior.
- Minimal visual accent tied to the section:
  - Radar: market signal / scan / feed language.
  - Research: paper / lab note / tool transfer language.

## Visual Direction

Preserve the existing Blink palette and typography:

- Dark: `#212121`
- Cream: `#FDFAF4`
- Orange: `#FF6A00`
- Gold: `#FFA52E`
- Red: `#F21A1A`
- Display: `MuseoModerno`
- Body: `Plus Jakarta Sans`
- Mono: `IBM Plex Mono`

Use the existing brand-gradient accents, section dividers, rounded panels, and GSAP reveal style so the new sections feel native to the homepage.

Radar can lean darker and signal-oriented. Research can contrast with a more paper-like or institutional surface while staying inside the Blink palette. Avoid introducing a new color system.

## Navigation and Header Behavior

The navbar must recognize both sections through their IDs:

- `#radar`
- `#research`

The header active underline should work as the user reaches each section. Existing external nav links to `/radar` and `/research` should still exist as destinations, but the homepage also needs section anchors so visitors can discover the explanation before leaving the page.

The body background transition must include both new sections through `data-theme`, matching the existing GSAP section theme logic.

## Component Design

Create a dedicated component for the two sections rather than expanding `App.jsx` with inline JSX. A single component can render both sections from a small local data array because both sections share the same structure and animation pattern while remaining separate `<section>` elements.

Expected component responsibility:

- Render `04. Radar` and `05. Research` as separate `<section>` elements.
- Apply GSAP reveal animation for each section panel.
- Provide stable IDs for scroll-spy and anchor navigation.
- Provide CTA links to `/radar` and `/research`.

`App.jsx` should only import the component and place it between `Portfolio` and `Fundadores`.

`Navbar.jsx` should add or adjust links so the user can reach the homepage explanation sections and still access the content destinations.

## Animation Requirements

Use existing animation conventions:

- Scroll-triggered reveal on each feature panel.
- Existing brand-gradient divider unfold behavior should work if dividers use `.brand-gradient-divider`.
- Header active-state animation must trigger when entering `Radar` and `Research`.
- Respect the existing mobile layout by avoiding desktop-only pinned horizontal scroll for these two sections.

The approved animation direction is subtle and brand-native: reveal, slight motion, gradient accents, and existing navbar active state. Do not add a new heavy animation system.

## Verification Requirements

Run these checks after implementation:

1. `npm run build`
2. Browser review of homepage at desktop width:
   - `04. Radar` appears after `Portfolio`.
   - `05. Research` appears after Radar.
   - `06. Fundadores` appears after Research.
   - CTAs navigate to `/radar` and `/research`.
   - Navbar active state reaches Radar and Research.
3. Browser review of homepage at mobile width:
   - Text does not overflow.
   - CTA buttons remain usable.
   - Sections stack without overlap.

## Scope Boundaries

Do not change the separate `blink-press` application.

Do not change the Vercel rewrites.

Do not add new dependencies.

Do not expose the UFF incubation relationship in public homepage copy.
