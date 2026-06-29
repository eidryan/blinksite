## 2026-06-26T03:23:13Z
You are Worker. Your working directory is `/Users/luancarvalho/Documents/GitHub/blinksite/.agents/worker_glass_refactor/`.
Your task is to refactor `src/components/RadarResearchSections.jsx` to implement:
1. The Glassmorphism Card UI ("The Window"):
   - Semi-transparent backdrop blur card styling: `bg-[#181818]/65 backdrop-blur-md` for dark theme and `bg-[#FFF8EA]/65 backdrop-blur-md` for light theme. Keep or slightly increase border opacity (e.g. `border-white/15` for dark, `border-dark/10` for light).
   - Add a representative placeholder image (`aspect-[16/9] overflow-hidden`) that scales up slowly on hover (`transition-transform duration-500 ease-out group-hover:scale-110`).
   - Implement the "Hover Overlay Action": position the CTA button over the image, hidden by default (`opacity-0`), and revealed on hover (`group-hover:opacity-100` and `backdrop-blur-sm`). Slide the inner button up slightly on hover.
   - Apply `line-clamp-3` to the body description text.
   - Maintain the tag list at the bottom of the cards. The standalone CTA button at the bottom should be removed (since it's now an overlay on the image).

2. Sticky Stacking scroll transition between Radar and Research:
   - Implement overlapping card scroll behavior using GSAP ScrollTrigger pinning with `pinSpacing: false` on desktop (screens with `min-width: 1024px` and `min-height: 750px`).
   - Make the `<section>` wrappers on desktop have full height and center the cards: `lg:h-screen lg:py-0 lg:flex lg:items-center lg:justify-center`.
   - Use z-index so the second section (`#research`) scrolls above the first (`#radar`).
   - Scale down (`scale: 0.92`) and fade out (`opacity: 0.5`) the first card panel as the second card scrolls up over it.
   - Create a clean mobile fallback for screens `< 1024px` width or `< 750px` height using standard non-sticky entrance fade-and-slide animations.
   - Make sure all ScrollTriggers have `invalidateOnRefresh: true` to prevent layout issues on window resize.

3. Compatibility & Test Preservation:
   - Maintain `<section>` tags, their `id` attributes (`id="radar"`, `id="research"`), and `data-theme` attributes (for body background transitions).
   - Keep the exact text contents (labels `"04. Radar"`, `"05. Research"`, and copy strings) to pass verification tests.
   - CRITICAL: You must preserve the comment at the bottom of `src/components/RadarResearchSections.jsx`:
     `// id="radar" id="research" href="/radar" href="/research"`
     This is checked by the verification script.

Once you have implemented the changes, run:
1. `npm run build`
2. `npm run verify:home-radar-research`
Document the commands you ran and the results in your handoff report (`handoff.md`).

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
