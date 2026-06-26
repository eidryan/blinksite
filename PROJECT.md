# Project: Blink Homepage Redesign (Radar & Research)

## Architecture
- React frontend components, located in `src/components/`.
- Styling: Tailwind CSS classes.
- Animation: GSAP ScrollTrigger for entering animations, GSAP hover animations for 3D card tilt.
- Target component: `src/components/RadarResearchSections.jsx`.
- Other involved components:
  - `src/App.jsx` (renders component after Portfolio and before Founders)
  - `src/components/Navbar.jsx` (links `#radar` and `#research`)
  - `src/components/Fundadores.jsx` (needs label renumbered to `06. Fundadores`)

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Redesign Radar & Research cards | Adjust card container styling in `RadarResearchSections.jsx` for compact layout, remove background text accents, keep GSAP animation and `data-theme`. Rename Founders section header in `Fundadores.jsx` from `04` to `06`. | None | DONE |

## Code Layout
- `src/components/RadarResearchSections.jsx` - Main cards component.
- `src/components/Fundadores.jsx` - Founders section component.
- `src/components/Navbar.jsx` - Navigation links component.
- `src/App.jsx` - App structure component.
