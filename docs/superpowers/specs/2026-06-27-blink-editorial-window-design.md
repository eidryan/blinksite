# Blink Editorial Window Design

## Context

The current `nem-page/radar` branch includes Radar and Research homepage sections, but the visual direction drifted into a large pinned glass-stacking interaction. The restart direction is to present Radar and Research as two editorial destinations from Blink in a stimulating but sober way.

The homepage order remains:

`Hero -> Sobre -> ComoAtuamos -> Portfolio -> Radar -> Research -> Fundadores -> Footer`

`/radar` and `/research` remain external editorial destinations. The homepage sections are discovery windows that should make visitors want to click through.

## Goal

Redesign the Radar and Research homepage sections around the approved **Janela Editorial Blink** concept:

- `04. Radar` introduces the Radar editorial destination.
- `05. Research` introduces the Research editorial destination.
- `06. Fundadores` remains after Research.

The sections must feel like Blink editorial previews, not a game, abstract spectacle, or full-screen pinned animation.

## Product Tone

Radar combines editorial curiosity with market urgency. It should feel like a useful signal feed: a place to notice movements before they become obvious.

Research combines editorial curiosity with applied authority. It should feel like a serious bridge between academic production and practical decisions for Brazilian PMEs.

Both sections should communicate "clique para conhecer" through a clear interactive card and CTA, without using explanatory in-app text about how to interact.

## Required Content

### Radar

Section label: `04. Radar`

Headline: `O que está mudando no mercado, antes de virar consenso.`

Body:

`Uma leitura prática de notícias, movimentos e sinais que importam para pequenas e médias empresas. O Radar mostra por que cada mudança merece atenção e o que ela pode provocar na operação real.`

CTA: `Conhecer o Radar`

Destination: `/radar`

Editorial card should preview a market-signal article with tags such as `Mercado`, `Sinais`, and `PMEs`.

### Research

Section label: `05. Research`

Headline: `Pesquisa aplicada para aproximar academia e mercado.`

Body:

`O ambiente onde a Blink aproxima as PMEs brasileiras do que está sendo produzido na academia: papers, pesquisas e ferramentas aplicadas que podem sair do laboratório e virar decisão, operação e produto no mercado real.`

CTA: `Explorar Research`

Destination: `/research`

Editorial card should preview an applied-research article with tags such as `Papers`, `Ferramentas`, and `Aplicação`.

Forbidden copy: do not mention the UFF incubation relationship in public homepage copy.

## Layout

Render two independent `<section>` elements:

- `section#radar[data-theme="dark"]`
- `section#research[data-theme="light"]`

Each section uses a two-column desktop composition:

- Left or primary content column: numbered label, headline, body, and CTA.
- Right or supporting visual column: one large editorial window card.

On mobile, each section stacks as:

1. Numbered label
2. Headline
3. Body
4. Editorial card
5. CTA if the card CTA is not always visible

The editorial card should be visually large enough to invite inspection, but not so large that it takes over the section. Avoid `h-screen`, sticky pinning, or clipping-prone layouts.

## Editorial Card Anatomy

Each card should behave like a Blink-native version of a glass blog preview:

- 16:9 visual cover using Blink palette and abstract-but-meaningful graphics.
- Tag chips over or under the cover.
- Article-style title.
- Short excerpt.
- Footer metadata, such as `Blink Radar`, `4 min de leitura`, or `Blink Research`, `6 min de leitura`.
- One primary click path to the destination.

The full card may be clickable if focus styles are clear. Hover may reveal a subtle overlay CTA, but the card must remain understandable without hover.

## Visual Language

Use the existing Blink identity:

- Dark: `#212121`
- Cream: `#FDFAF4`
- Orange: `#FF6A00`
- Gold: `#FFA52E`
- Red: `#F21A1A`
- Display font: `MuseoModerno`
- Body font: `Plus Jakarta Sans`
- Utility font: `IBM Plex Mono`

Use existing `brand-gradient`, rounded panels, border/glass styling, and `data-cursor` hooks. Do not add new dependencies.

Avoid one-note purple/blue, generic stock-card styling, or playful illustration language. The card can feel premium and tactile, but should stay editorial and sober.

## Motion

Motion should support the click, not become the feature.

Allowed:

- GSAP reveal on section content and card.
- Subtle card tilt on pointer movement.
- Cover image/graphic scale on hover.
- CTA opacity/translate hover treatment.

Not allowed:

- Sticky pinning between Radar and Research.
- Blur stacking where one section covers the other.
- Large full-screen choreography that merges the two sections.
- Motion that makes the section feel like a game.

Respect mobile and short desktop viewports by avoiding fixed full-screen card heights.

## Implementation Scope

Primary files:

- `src/components/RadarResearchSections.jsx`
- `scripts/verify-home-radar-research.mjs`

Likely unchanged files:

- `src/App.jsx`
- `src/components/Navbar.jsx`
- `src/components/Fundadores.jsx`

The current app wiring already places the sections between `Portfolio` and `Fundadores`, navbar anchors already target `#radar` and `#research`, and founders already shows `06. Fundadores`.

## Verification Requirements

Source verification must prove:

- `04. Radar` is present in the Radar section content.
- `05. Research` is present in the Research section content.
- `06. Fundadores` remains in the founders component.
- `/radar` and `/research` destinations remain present.
- Public homepage copy does not mention `UFF`.
- The component does not rely on static comment strings to satisfy verification.

Runtime verification must include:

- `npm run verify:home-radar-research`
- `npm run build`
- Browser review at desktop width.
- Browser review at mobile width.

Browser review acceptance criteria:

- Radar appears after Portfolio.
- Research appears after Radar.
- Fundadores appears after Research.
- The navbar active state reaches Radar and Research.
- Cards are visible without clipping.
- Text does not overflow on mobile.
- Each destination has one clear primary click path.
