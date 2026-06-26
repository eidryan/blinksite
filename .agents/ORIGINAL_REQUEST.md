# Original User Request

## Initial Request — 2026-06-26T02:53:49Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview

Redesign the Radar and Research section cards in the Blink homepage to be more compact by adopting a horizontal layout, and remove the large background text accents.

Working directory: /Users/luancarvalho/Documents/GitHub/blinksite
Integrity mode: development

## Requirements

### R1. Compact Horizontal Layout
Transform the Radar and Research cards into a smaller, more horizontal layout, rather than large square boxes. They must remain as two separate, stacked sections.

### R2. Remove Background Text Accents
Eliminate the oversized "RADAR" and "RESEARCH" background text elements from the cards.

### R3. Maintain Existing Functionalities
Preserve the existing GSAP scroll and hover animations, as well as the dark/light theme transitions (`data-theme`) associated with these sections.

## Acceptance Criteria

### Verification
- [ ] **Build Check**: Running `npm run build` succeeds without any errors or warnings.
- [ ] **Code Check (R2)**: The exact text nodes for the background accents (e.g., `<div className="... text-[5.5rem] ...">RADAR</div>`) are completely removed from `src/components/RadarResearchSections.jsx`.
- [ ] **Code Check (R1)**: The CSS classes applied to the cards are updated to reflect a more compact layout (e.g., removing `lg:aspect-square` and adjusting padding or height classes).
- [ ] **Code Check (R3)**: The `useEffect` block containing the `gsap` ScrollTrigger logic and the `data-theme` attributes on the `<section>` elements remain fully intact.
