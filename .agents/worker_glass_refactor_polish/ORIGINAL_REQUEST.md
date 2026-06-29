## 2026-06-26T03:34:39Z

You are Worker 3. Your working directory is `/Users/luancarvalho/Documents/GitHub/blinksite/.agents/worker_glass_refactor_polish/`.
Your task is to refine the implementation of `src/components/RadarResearchSections.jsx` to resolve the final issues identified in iteration 2 reviews:

1. ScrollTrigger Refresh on Layout State Change:
   - Add a `useEffect` hook that listens to the `isStickyActive` state:
     ```javascript
     useEffect(() => {
         ScrollTrigger.refresh();
     }, [isStickyActive]);
     ```
     This ensures that GSAP ScrollTrigger recalculates its caching/measurements after the React re-render changes the section layout heights.

2. WCAG AA Contrast Compliance (Light Theme):
   - For the light theme card (`isDark` is false), the eyebrow text and label border/text currently use light orange classes (`text-orange` / `border-orange`) which have insufficient contrast on a light background.
   - For the light theme eyebrow text: change `text-orange` to `text-[#C2410C]` (a high-contrast WCAG-compliant dark orange).
   - For the light theme label text pill: change `text-orange border-orange` to `text-[#C2410C] border-[#C2410C]`.
   - Make sure the dark theme card (`isDark` is true) remains untouched and keeps its glowing orange classes (`text-[#FF8A1C]`, `text-orange`, etc.).

3. Unmount State Update Prevention:
   - Remove the `return () => { setIsStickyActive(false); };` statement inside the `gsap.matchMedia()` callback (around line 152).
   - Add a ref to track whether the component is mounted:
     ```javascript
     const isMounted = useRef(true);
     useEffect(() => {
         isMounted.current = true;
         return () => {
             isMounted.current = false;
         };
     }, []);
     ```
     And inside the matchMedia conditions handler, check:
     ```javascript
     if (isMounted.current) {
         setIsStickyActive(isDesktop);
     }
     ```

4. Duplicate Links and Screen Reader Redundancy on Mobile:
   - Wrap the hover overlay container in `{isStickyActive && (...)}` so that it is completely excluded from the DOM on mobile and touch layouts. This prevents screen readers and keyboard users from hitting a duplicate tab stop on the hidden link.
     ```jsx
     {isStickyActive && (
         <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-sm transition-all duration-300 ease-out group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto z-20">
             <a
                 href={section.href}
                 ...
             >
                 ...
             </a>
         </div>
     )}
     ```

5. SVG Accessibility:
   - Add `aria-hidden="true"` and `focusable="false"` to both inline `<svg>` elements representing Radar and Research.

6. Preserve Test Check:
   - Keep the comment `// id="radar" id="research" href="/radar" href="/research"` at the bottom of the file.

Verify that the build compiles successfully (`npm run build`) and the verification script passes (`npm run verify:home-radar-research`). Record the output in your handoff report (`handoff.md`).
