## 2026-06-26T03:29:03Z

<USER_REQUEST>
You are Worker 2. Your working directory is `/Users/luancarvalho/Documents/GitHub/blinksite/.agents/worker_glass_refactor_fix/`.
Your task is to refine the implementation of `src/components/RadarResearchSections.jsx` based on feedback from code review and quality checks to address critical layout, accessibility, and architectural issues:

1. Viewport Height Mismatch Fix:
   - Introduce a React state variable in the component: `const [isStickyActive, setIsStickyActive] = useState(false);` (make sure to import `useState` from 'react').
   - In `gsap.matchMedia()`, inside the callback for the desktop condition `isDesktop` (min-width: 1024px and min-height: 750px), set `setIsStickyActive(true)`. In the mobile/fallback callback (or when desktop query does not match), set `setIsStickyActive(false)`. Ensure the cleanup returns it to `false`.
   - Update the `<section>` elements to conditionally apply desktop styling based on `isStickyActive`:
     ```jsx
     className={`relative overflow-hidden px-6 py-28 lg:px-20 ${
         isStickyActive
             ? 'lg:h-screen lg:py-0 lg:flex lg:items-center lg:justify-center'
             : 'lg:py-36'
     } ${zIndexClass} ${isDark ? 'bg-dark text-cream' : 'bg-cream text-dark'}`}
     ```

2. Mouse Selection & Hover Overlay Event Blockage:
   - Add `pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto` to the hover overlay container class list (line 327) so that the invisible overlay does not intercept mouse clicks/selection.

3. Keyboard Focus Accessibility:
   - Add `group-focus-within:opacity-100` to the hover overlay container class list so that the overlay becomes visible when the inner button is focused via Tab.

4. Mobile / Touch Accessibility (Mobile CTA):
   - When sticky mode is inactive (`!isStickyActive`), render the CTA button inline at the bottom of the card content (below the notes tag list) so that mobile/touch users can see and click the CTA:
     ```jsx
     {!isStickyActive && (
         <div className="mt-8 flex justify-start">
             <a
                 href={section.href}
                 data-cursor="action"
                 className={`inline-flex items-center justify-center gap-3 rounded-full px-8 py-4 font-body font-semibold ${isDark
                     ? 'brand-gradient text-dark'
                     : 'bg-dark text-cream hover:bg-dark/90'
                     }`}
             >
                 {section.cta}
                 <ArrowUpRight size={20} strokeWidth={2} />
             </a>
         </div>
     )}
     ```

5. React Encapsulation in GSAP Triggers:
   - Refactor the GSAP ScrollTrigger configuration to use React ref references (`sectionRefs.current[0]` and `sectionRefs.current[1]`) instead of hardcoded DOM query selector strings (`#radar` and `#research`).

6. GSAP Context Cleanup:
   - Remove the redundant outer `gsap.context()` wrapper inside `useEffect`. Use `gsap.matchMedia()` directly as the root container and return `mm.revert()` in the cleanup.

7. Responsive Line-Clamping:
   - Change `line-clamp-3` on the description body to `line-clamp-none lg:line-clamp-3` to prevent truncation on mobile screen sizes.

8. SVG Scale Controls:
   - Add `preserveAspectRatio="xMidYMid slice"` to the SVG tags for Radar and Research layout images.

9. Preservation:
   - Retain the critical check comment at the bottom of the file:
     `// id="radar" id="research" href="/radar" href="/research"`

After completing these changes, verify that the build compiles successfully (`npm run build`) and the verification checks pass (`npm run verify:home-radar-research`). Record the commands and results in your handoff report (`handoff.md`).

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
</USER_REQUEST>
