# Project Plan: Glassmorphism UI & Sticky Scroll Stacking Transition

This plan outlines the steps to refactor `src/components/RadarResearchSections.jsx` to adopt the premium "glass window" blog card aesthetic and the "Sticky Stacking" transition.

## Decomposed Steps

### Phase 1: Exploration and Analysis
- **Goal**: Analyze the current file structure of `RadarResearchSections.jsx`, how GSAP handles scroll triggers and animations, and how Tailwind CSS can be leveraged for Glassmorphism.
- **Verification**: Explorer produces `analysis.md` summarizing the exact changes needed, classes to use, and how GSAP pinning/sticky css can be set up.

### Phase 2: Implementation
- **Goal**: Implement the Glassmorphism Card UI and the Sticky Stacking Scroll Transition in `src/components/RadarResearchSections.jsx`.
- **Requirements**:
  - Semi-transparent background with backdrop blur (`bg-white/10 backdrop-blur-md` or similar, tailored for light and dark themes).
  - A responsive placeholder image (`aspect-[16/9] overflow-hidden`) that scales up slowly on hover (`transition-transform duration-500 group-hover:scale-110`).
  - Hover Overlay Action: position the CTA button over the image, hidden by default (`opacity-0`), and revealed on hover (`group-hover:opacity-100`).
  - Apply `line-clamp-2` or `line-clamp-3` to body excerpt.
  - Sticky stacking: first section pins/sticks (`position: sticky` or GSAP `pin: true`), and the second section slides up over it.
- **Verification**: Run `npm run build` and `npm run verify:home-radar-research`.

### Phase 3: Verification & Review
- **Goal**: Verify UI and layout, class presence, hover behaviors, and GSAP sticky functionality.
- **Subagents**: Spawn 2 Reviewers to review code correctness, robustness, and layout. Spawn 2 Challengers to write/run scripts validating the sticky stacking transition and class presence. Spawn Forensic Auditor to verify integrity and ensure no cheats/bypasses are present.
- **Verification**: Reviewer reports, Challenger reports, and Auditor verdict must all pass.

## Schedule
1. **Explore & Analyze**: Spawn explorer (Task 1).
2. **Implement**: Spawn worker to apply changes (Task 2).
3. **Review**: Spawn reviewers (Task 3).
4. **Challenge**: Spawn challengers to verify functionality (Task 4).
5. **Audit**: Spawn auditor to check integrity (Task 5).
6. **Wrap up**: Write handoff and report status (Task 6).
