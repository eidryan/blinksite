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

## Follow-up — 2026-06-26T03:21:00Z

# Teamwork Project Prompt

> Status: Launched
> Goal: Implement the Glassmorphism Card design and Sticky GSAP transition

Refactor the `src/components/RadarResearchSections.jsx` to adopt a premium "glass window" blog card aesthetic and a "Sticky Stacking" scroll transition between the Radar and Research sections.

Working directory: /Users/luancarvalho/Documents/GitHub/blinksite
Integrity mode: development

## Requirements

### R1. Glassmorphism Card UI ("The Window")
Rebuild the Radar and Research cards using the glassmorphism aesthetic analyzed from 21st.dev.
- Use a semi-transparent container with backdrop blur (`bg-white/10 backdrop-blur-md` or similar for dark/light themes).
- Add a representative placeholder image (`aspect-[16/9] overflow-hidden`) that scales up slowly on hover (`transition-transform duration-500 group-hover:scale-110`).
- Implement the "Hover Overlay Action": position the CTA button over the image, hidden by default (`opacity-0`), and revealed on hover (`group-hover:opacity-100`).
- Apply `line-clamp-2` or `line-clamp-3` to the body excerpt to encourage clicking.

### R2. Sticky Stacking Transition
Implement a overlapping card scroll effect.
- The first section (Radar) should remain fixed in the viewport (e.g. using `position: sticky; top: 0` or GSAP `pin: true`) when the user reaches it.
- As the user scrolls further, the second section (Research) slides up and overlays the Radar section.
- This overlapping motion hides the abrupt background color transition previously caused by adjacent opaque sections.

## Acceptance Criteria

### Verification
- [ ] **Build Check**: Running `npm run build` succeeds without errors.
- [ ] **Verification Script**: Running `npm run verify:home-radar-research` passes successfully.
- [ ] **Tailwind Structure**: The `.jsx` code explicitly uses Tailwind group hover classes (`group-hover:scale-110`, `group-hover:opacity-100`) for the interactive image zoom and CTA overlay.
- [ ] **Scroll Mechanism**: The code implements a sticky or pinned scroll behavior for the sections so they overlap each other on scroll.
