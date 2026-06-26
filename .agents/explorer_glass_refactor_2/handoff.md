# Handoff Report - Sticky Stacking Transition Analysis

## 1. Observation
* **File paths and structure**:
  * `src/components/RadarResearchSections.jsx` defines separate section tags (lines 105-110):
    ```jsx
    <section
        key={section.id}
        id={section.id}
        ref={(element) => { sectionRefs.current[index] = element; }}
        data-theme={section.theme}
        className={`relative overflow-hidden px-6 py-28 lg:px-20 lg:py-36 ${isDark ? 'bg-dark text-cream' : 'bg-cream text-dark'}`}
    >
    ```
  * `src/App.jsx` triggers body background transitions based on these sections (lines 94-106):
    ```javascript
    const sections = gsap.utils.toArray('section[data-theme], footer[data-theme]');
    sections.forEach((section, i) => {
      const theme = section.getAttribute('data-theme');
      const targetBg = theme === 'dark' ? '#212121' : '#FDFAF4';
      ScrollTrigger.create({
        trigger: section,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () => gsap.to(document.body, { backgroundColor: targetBg, duration: 0.5, overwrite: "auto" }),
        onEnterBack: () => gsap.to(document.body, { backgroundColor: targetBg, duration: 0.5, overwrite: "auto" })
      });
    });
    ```
  * `npm run verify:home-radar-research` runs successfully:
    ```
    Home Radar/Research verification passed (20 checks).
    ```

## 2. Logic Chain
1. **Theme Transitions**: `App.jsx` listens for individual `section[data-theme]` triggers. To maintain body background transitions, the cards in `RadarResearchSections.jsx` must remain separate sibling `<section>` elements in the main DOM flow.
2. **Overlay Mechanism**: By setting `lg:h-screen` and `lg:flex lg:items-center lg:justify-center` on both sections, we align their card panels vertically in the viewport on desktop.
3. **GSAP Pinning**: Using GSAP ScrollTrigger to pin Section 1 (`radar`) with `pinSpacing: false` allows Section 2 (`research`) to scroll naturally on top of it.
4. **Depth / Scaling Animation**: Scrubbing Section 1's scale (to `0.92`) and opacity (to `0.5`) in response to Section 2's entrance creates a card-stack depth effect.
5. **No Regressions**: Because this configuration retains all IDs and labels, the verification script `scripts/verify-home-radar-research.mjs` remains fully compliant.

## 3. Caveats
* We assumed a viewport height of `750px` as the cutoff threshold in `gsap.matchMedia()`. If the card height changes, this threshold must be adjusted.
* We assume the user has standard browser support that aligns with GSAP and Lenis scroll behavior.

## 4. Conclusion
We recommend using **GSAP ScrollTrigger pinning with `pinSpacing: false`** to implement the overlapping card transition in `RadarResearchSections.jsx`. This approach maintains separate DOM sibling structures, thereby preserving the body background color transitions in `App.jsx` while providing dynamic depth animations (scale and fade) on desktop and a clean vertical flow fallback on mobile. Detailed recommendations and code structures are documented in `/Users/luancarvalho/Documents/GitHub/blinksite/.agents/explorer_glass_refactor_2/analysis.md`.

## 5. Verification Method
* Run the verification test script:
  ```sh
  npm run verify:home-radar-research
  ```
* Ensure no build/lint errors are introduced after implementation.
* Manually inspect styling transitions on desktop vs mobile screen heights.
