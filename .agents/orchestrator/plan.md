# Redesign Execution Plan

## Objectives
1. Make Radar and Research section cards compact and horizontal.
2. Remove large "RADAR" and "RESEARCH" background text elements.
3. Preserve all GSAP animations and theme transitions.
4. Update `Fundadores.jsx` to use the header label "06. Fundadores" instead of "04. Fundadores".
5. Keep Navbar references and App structure intact.
6. Verify everything by running the automated check scripts and build.

## Detailed Phase Plan

### Phase 1: Exploration
- Dispatch `teamwork_preview_explorer` to check `src/components/RadarResearchSections.jsx`, `src/components/Fundadores.jsx`, and current layout constraints.
- Formulate precise CSS class substitutions and code removal for the background elements.

### Phase 2: Implementation
- Dispatch `teamwork_preview_worker` to:
  - Modify `src/components/RadarResearchSections.jsx`: remove `lg:aspect-square`, adjust card padding/margins for horizontal layout, and delete the absolute-positioned text accent div.
  - Modify `src/components/Fundadores.jsx`: update header label from "04. Fundadores" to "06. Fundadores".
  - Run build command `npm run build` and verification script `npm run verify:home-radar-research` to verify compilation and basic compliance.

### Phase 3: Review & Verification
- Dispatch `teamwork_preview_reviewer` to check visual structure and code logic against requirements R1, R2, R3.
- Run builds and confirm there are no warnings or errors.

### Phase 4: Forensic Audit
- Dispatch `teamwork_preview_auditor` to check for code integrity, avoiding any hardcoded tests, facade implementations, or other violations.
