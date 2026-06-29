# Blink Home Radar and Research Sections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add separate `04. Radar` and `05. Research` homepage sections between `Portfolio` and `Fundadores`, with CTAs to `/radar` and `/research`, active navbar anchors, and verified responsive behavior.

**Architecture:** Create one focused React component that renders two independent `<section>` elements from a local data array. Wire that component into `App.jsx` between `Portfolio` and `Fundadores`, update the navbar links to target the new homepage anchors, and renumber the existing founders section to `06. Fundadores`.

**Tech Stack:** Vite 5, React 18, Tailwind CSS 3, GSAP ScrollTrigger, Lenis, lucide-react, Node.js 20.

## Global Constraints

- Use two independent sections, not one combined section with two cards.
- Add `04. Radar` after `Portfolio`.
- Add `05. Research` after Radar.
- Change `Fundadores` to `06. Fundadores`.
- Radar CTA text must be `Conhecer o Radar` and destination must be `/radar`.
- Research CTA text must be `Explorar Research` and destination must be `/research`.
- Research public copy must be: `O ambiente onde a Blink aproxima as PMEs brasileiras do que está sendo produzido na academia: papers, pesquisas e ferramentas aplicadas que podem sair do laboratório e virar decisão, operação e produto no mercado real.`
- Do not expose the UFF incubation relationship in public homepage copy.
- Do not change the separate `blink-press` application.
- Do not change Vercel rewrites.
- Do not add dependencies.
- Preserve existing Blink palette, typography, GSAP reveal style, scroll-spy behavior, and section theme transitions.

---

## Gemini CLI Execution Prompt

Start Gemini CLI from the repo root:

```bash
cd /Users/luancarvalho/Documents/GitHub/blinksite
gemini
```

Paste this prompt into Gemini:

```text
You are working in /Users/luancarvalho/Documents/GitHub/blinksite on branch nem-page/radar.

Read these files first:
- docs/superpowers/specs/2026-06-26-blink-home-radar-research-design.md
- docs/superpowers/plans/2026-06-26-blink-home-radar-research-gemini.md
- tasks/todo.md
- tasks/lessons.md

Execute the plan task-by-task. Do not skip verification. Keep edits scoped to the files listed in each task. Do not mention that Blink is incubated by UFF in public homepage source copy. After each task, run the listed command and report whether the expected result happened. If a command fails unexpectedly, stop, explain the root cause from logs, and repair before continuing.
```

## File Structure

- Create `scripts/verify-home-radar-research.mjs`
  - No-dependency source verification for the new sections, copy, navbar anchors, CTA destinations, and founders numbering.
- Create `src/components/RadarResearchSections.jsx`
  - Renders two separate sections, `#radar` and `#research`.
  - Owns section data, CTA links, visual accents, and GSAP reveal animation.
- Modify `package.json`
  - Add `verify:home-radar-research` script.
- Modify `src/App.jsx`
  - Import and render `RadarResearchSections` between `Portfolio` and `Fundadores`.
- Modify `src/components/Navbar.jsx`
  - Change Radar and Research links from external route links to homepage anchors.
  - Keep CTAs inside the new sections as the external destinations.
- Modify `src/components/Fundadores.jsx`
  - Change visible section label from `04. Fundadores` to `06. Fundadores`.
- Modify `tasks/todo.md`
  - Track plan creation, implementation, verification, and final review.

---

### Task 1: Add Source Verification Script

**Files:**
- Create: `scripts/verify-home-radar-research.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: current source files under `src/`.
- Produces: `npm run verify:home-radar-research`, a deterministic source check used by later tasks.

- [ ] **Step 1: Create the verification script**

Create `scripts/verify-home-radar-research.mjs` with this exact content:

```js
import { existsSync, readFileSync } from 'node:fs';

const checks = [];

function read(path) {
  if (!existsSync(path)) {
    throw new Error(`Missing required file: ${path}`);
  }
  return readFileSync(path, 'utf8');
}

function expectIncludes(name, content, expected) {
  checks.push({ name, pass: content.includes(expected), expected });
}

function expectNotIncludes(name, content, forbidden) {
  checks.push({ name, pass: !content.includes(forbidden), expected: `not ${forbidden}` });
}

function expectOrder(name, content, first, second) {
  checks.push({
    name,
    pass: content.indexOf(first) !== -1 && content.indexOf(second) !== -1 && content.indexOf(first) < content.indexOf(second),
    expected: `${first} before ${second}`,
  });
}

const app = read('src/App.jsx');
const navbar = read('src/components/Navbar.jsx');
const founders = read('src/components/Fundadores.jsx');
const sectionsPath = 'src/components/RadarResearchSections.jsx';
const sections = read(sectionsPath);

expectIncludes('App imports RadarResearchSections', app, "import RadarResearchSections from './components/RadarResearchSections';");
expectOrder('App renders sections after Portfolio', app, '<Portfolio />', '<RadarResearchSections />');
expectOrder('App renders founders after sections', app, '<RadarResearchSections />', '<Fundadores />');

expectIncludes('Radar section id exists', sections, 'id="radar"');
expectIncludes('Research section id exists', sections, 'id="research"');
expectIncludes('Radar label exists', sections, '04. Radar');
expectIncludes('Research label exists', sections, '05. Research');
expectIncludes('Radar headline exists', sections, 'O que está mudando no mercado, antes de virar consenso.');
expectIncludes('Research headline exists', sections, 'Pesquisa aplicada para aproximar academia e mercado.');
expectIncludes('Research approved copy exists', sections, 'O ambiente onde a Blink aproxima as PMEs brasileiras do que está sendo produzido na academia: papers, pesquisas e ferramentas aplicadas que podem sair do laboratório e virar decisão, operação e produto no mercado real.');
expectIncludes('Radar CTA destination exists', sections, 'href="/radar"');
expectIncludes('Research CTA destination exists', sections, 'href="/research"');
expectIncludes('Radar CTA text exists', sections, 'Conhecer o Radar');
expectIncludes('Research CTA text exists', sections, 'Explorar Research');
expectNotIncludes('Public component does not mention UFF', sections, 'UFF');

expectIncludes('Navbar Radar anchor exists', navbar, "{ name: 'Radar', href: '#radar' }");
expectIncludes('Navbar Research anchor exists', navbar, "{ name: 'Research', href: '#research' }");
expectOrder('Navbar order puts Radar before Research', navbar, "{ name: 'Radar', href: '#radar' }", "{ name: 'Research', href: '#research' }");
expectIncludes('Founders label is renumbered', founders, '06. Fundadores');
expectNotIncludes('Old founders label is removed', founders, '04. Fundadores');

const failed = checks.filter((check) => !check.pass);

if (failed.length > 0) {
  console.error('Home Radar/Research verification failed:');
  for (const check of failed) {
    console.error(`- ${check.name}: expected ${check.expected}`);
  }
  process.exit(1);
}

console.log(`Home Radar/Research verification passed (${checks.length} checks).`);
```

- [ ] **Step 2: Add the npm script**

Modify the `scripts` object in `package.json` so it becomes:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "verify:home-radar-research": "node scripts/verify-home-radar-research.mjs"
}
```

- [ ] **Step 3: Run the verification to confirm it fails before implementation**

Run:

```bash
npm run verify:home-radar-research
```

Expected: FAIL. It should report `Missing required file: src/components/RadarResearchSections.jsx`.

- [ ] **Step 4: Commit the verification scaffold**

Run:

```bash
git add package.json scripts/verify-home-radar-research.mjs
git commit -m "test: add home radar research verification"
```

Expected: commit succeeds.

---

### Task 2: Create Radar and Research Sections Component

**Files:**
- Create: `src/components/RadarResearchSections.jsx`

**Interfaces:**
- Consumes: `gsap`, `ScrollTrigger`, Tailwind utility classes, lucide-react icons.
- Produces: default React component `RadarResearchSections`.

- [ ] **Step 1: Create the component**

Create `src/components/RadarResearchSections.jsx` with this exact content:

```jsx
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, BookOpenText, RadioTower } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const contentSections = [
    {
        id: 'radar',
        label: '04. Radar',
        title: 'O que está mudando no mercado, antes de virar consenso.',
        eyebrow: 'Sinais de mercado para PMEs',
        body: 'Uma leitura prática de notícias, movimentos e sinais que importam para pequenas e médias empresas. O Radar mostra por que cada mudança merece atenção e o que ela pode provocar na operação real.',
        cta: 'Conhecer o Radar',
        href: '/radar',
        theme: 'dark',
        icon: RadioTower,
        accent: 'RADAR',
        notes: ['curadoria', 'sinais', 'por que importa'],
    },
    {
        id: 'research',
        label: '05. Research',
        title: 'Pesquisa aplicada para aproximar academia e mercado.',
        eyebrow: 'Papers, pesquisas e ferramentas aplicadas',
        body: 'O ambiente onde a Blink aproxima as PMEs brasileiras do que está sendo produzido na academia: papers, pesquisas e ferramentas aplicadas que podem sair do laboratório e virar decisão, operação e produto no mercado real.',
        cta: 'Explorar Research',
        href: '/research',
        theme: 'light',
        icon: BookOpenText,
        accent: 'RESEARCH',
        notes: ['papers', 'pesquisa aplicada', 'ferramentas'],
    },
];

export default function RadarResearchSections() {
    const sectionRefs = useRef([]);
    const panelRefs = useRef([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            panelRefs.current.forEach((panel, index) => {
                if (!panel) return;

                gsap.from(panel, {
                    scrollTrigger: {
                        trigger: sectionRefs.current[index],
                        start: 'top 70%',
                        toggleActions: 'play none none reverse',
                    },
                    y: 56,
                    opacity: 0,
                    duration: 0.95,
                    ease: 'power3.out',
                });
            });
        });

        return () => ctx.revert();
    }, []);

    const handleMouseMove = (event, index) => {
        const panel = panelRefs.current[index];
        if (!panel) return;

        const rect = panel.getBoundingClientRect();
        const percentX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        const percentY = -((event.clientY - rect.top) / rect.height - 0.5) * 2;

        gsap.to(panel, {
            rotateX: percentY * 1.4,
            rotateY: percentX * 1.4,
            duration: 0.5,
            ease: 'power2.out',
            transformPerspective: 900,
        });
    };

    const handleMouseLeave = (index) => {
        const panel = panelRefs.current[index];
        if (!panel) return;

        gsap.to(panel, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.8,
            ease: 'elastic.out(1, 0.35)',
        });
    };

    return (
        <>
            {contentSections.map((section, index) => {
                const isDark = section.theme === 'dark';
                const Icon = section.icon;

                return (
                    <section
                        key={section.id}
                        id={section.id}
                        ref={(element) => { sectionRefs.current[index] = element; }}
                        data-theme={section.theme}
                        className={`relative overflow-hidden px-6 py-28 lg:px-20 lg:py-32 ${isDark ? 'bg-dark text-cream' : 'bg-cream text-dark'}`}
                    >
                        <div className="brand-gradient-divider absolute top-0 left-0" />

                        <div className="relative z-10 mx-auto flex max-w-7xl justify-center" style={{ perspective: '900px' }}>
                            <div
                                ref={(element) => { panelRefs.current[index] = element; }}
                                onMouseMove={(event) => handleMouseMove(event, index)}
                                onMouseLeave={() => handleMouseLeave(index)}
                                className={`group relative flex w-full max-w-[980px] flex-col justify-between overflow-hidden rounded-[2rem] border p-8 shadow-2xl will-change-transform md:p-12 lg:aspect-square lg:p-16 ${isDark
                                    ? 'border-white/10 bg-[#181818] text-cream shadow-black/30'
                                    : 'border-dark/10 bg-[#FFF8EA] text-dark shadow-orange/10'
                                    }`}
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                <div className="absolute inset-0 pointer-events-none">
                                    <div className={`absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-80 ${isDark ? 'bg-orange/20 opacity-45' : 'bg-orange/15 opacity-60'}`} />
                                    <div className={`absolute bottom-0 left-0 h-[2px] w-full brand-gradient ${isDark ? 'opacity-70' : 'opacity-90'}`} />
                                </div>

                                <div className="relative z-10 flex items-start justify-between gap-6">
                                    <span className={`font-mono text-xs uppercase tracking-widest border rounded-full px-3 py-1 ${isDark ? 'text-orange border-orange/40' : 'text-orange border-orange'}`}>
                                        {section.label}
                                    </span>

                                    <div className={`flex h-12 w-12 items-center justify-center rounded-full border ${isDark ? 'border-white/10 bg-white/5 text-orange' : 'border-dark/10 bg-dark/5 text-orange'}`}>
                                        <Icon size={22} strokeWidth={1.7} />
                                    </div>
                                </div>

                                <div className="relative z-10 my-16 max-w-2xl lg:my-0">
                                    <p className={`mb-6 font-mono text-xs uppercase tracking-[0.18em] ${isDark ? 'text-[#FF8A1C]' : 'text-orange'}`}>
                                        {section.eyebrow}
                                    </p>

                                    <h2 className={`font-display text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl ${isDark ? 'text-cream' : 'text-dark'}`} style={{ textWrap: 'balance' }}>
                                        {section.title}
                                    </h2>

                                    <p className={`mt-8 max-w-xl font-body text-lg leading-relaxed md:text-xl ${isDark ? 'text-cream/70' : 'text-dark/70'}`}>
                                        {section.body}
                                    </p>
                                </div>

                                <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                                    <div className="flex flex-wrap gap-3">
                                        {section.notes.map((note) => (
                                            <span
                                                key={note}
                                                className={`rounded-full border px-3 py-1 font-mono text-[0.68rem] uppercase tracking-widest ${isDark
                                                    ? 'border-white/10 bg-white/5 text-cream/65'
                                                    : 'border-dark/10 bg-dark/5 text-dark/65'
                                                    }`}
                                            >
                                                {note}
                                            </span>
                                        ))}
                                    </div>

                                    <a
                                        href={section.href}
                                        data-cursor="action"
                                        className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-body font-semibold transition-transform hover:scale-105 ${isDark
                                            ? 'brand-gradient text-dark'
                                            : 'bg-dark text-cream hover:bg-dark/90'
                                            }`}
                                    >
                                        {section.cta}
                                        <ArrowUpRight size={18} strokeWidth={2} />
                                    </a>
                                </div>

                                <div className={`pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 font-mono text-[5.5rem] font-bold tracking-[0.2em] opacity-[0.035] lg:block ${isDark ? 'text-cream' : 'text-dark'}`}>
                                    {section.accent}
                                </div>
                            </div>
                        </div>
                    </section>
                );
            })}
        </>
    );
}
```

- [ ] **Step 2: Run build to catch syntax errors**

Run:

```bash
npm run build
```

Expected: PASS. Vite should produce `dist/`.

- [ ] **Step 3: Run source verification**

Run:

```bash
npm run verify:home-radar-research
```

Expected: FAIL. It should now pass component-specific checks but still fail because `App.jsx`, `Navbar.jsx`, and `Fundadores.jsx` are not wired yet.

- [ ] **Step 4: Commit the component**

Run:

```bash
git add src/components/RadarResearchSections.jsx
git commit -m "feat: add radar research homepage sections"
```

Expected: commit succeeds.

---

### Task 3: Wire Sections Into Homepage Order

**Files:**
- Modify: `src/App.jsx:6-12`
- Modify: `src/App.jsx:188-190`

**Interfaces:**
- Consumes: default export `RadarResearchSections` from `src/components/RadarResearchSections.jsx`.
- Produces: homepage order `Portfolio -> RadarResearchSections -> Fundadores`.

- [ ] **Step 1: Add the import**

In `src/App.jsx`, replace the import block around `Portfolio` and `Fundadores` with:

```jsx
import Portfolio from './components/Portfolio';
import RadarResearchSections from './components/RadarResearchSections';
import Fundadores from './components/Fundadores';
```

- [ ] **Step 2: Render the new sections after Portfolio**

In `src/App.jsx`, replace this block:

```jsx
          <ComoAtuamos />
          <Portfolio />
          <Fundadores />
          <Footer />
```

with:

```jsx
          <ComoAtuamos />
          <Portfolio />
          <RadarResearchSections />
          <Fundadores />
          <Footer />
```

- [ ] **Step 3: Run source verification**

Run:

```bash
npm run verify:home-radar-research
```

Expected: FAIL. It should no longer report `App` ordering failures, but it should still report navbar anchor and founders label failures.

- [ ] **Step 4: Run build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit homepage wiring**

Run:

```bash
git add src/App.jsx
git commit -m "feat: place radar research before founders"
```

Expected: commit succeeds.

---

### Task 4: Update Navbar Anchors

**Files:**
- Modify: `src/components/Navbar.jsx:41-49`

**Interfaces:**
- Consumes: section IDs `#radar` and `#research` from `RadarResearchSections`.
- Produces: navbar links that scroll to the explanation sections and activate the existing underline animation.

- [ ] **Step 1: Replace navLinks**

In `src/components/Navbar.jsx`, replace the current `navLinks` array with:

```jsx
    const navLinks = [
        { name: 'Sobre', href: '#sobre' },
        { name: 'Como Atuamos', href: '#como-atuamos' },
        { name: 'Portfólio', href: '#portfolio' },
        { name: 'Radar', href: '#radar' },
        { name: 'Research', href: '#research' },
        { name: 'Fundadores', href: '#fundadores' },
        { name: 'Contato', href: '#contato' },
    ];
```

- [ ] **Step 2: Run source verification**

Run:

```bash
npm run verify:home-radar-research
```

Expected: FAIL. It should no longer report navbar failures, but it should still report the old founders label.

- [ ] **Step 3: Run build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 4: Commit navbar update**

Run:

```bash
git add src/components/Navbar.jsx
git commit -m "feat: anchor navbar to radar research sections"
```

Expected: commit succeeds.

---

### Task 5: Renumber Fundadores

**Files:**
- Modify: `src/components/Fundadores.jsx:88-90`

**Interfaces:**
- Consumes: new homepage order from previous tasks.
- Produces: visible section numbering `06. Fundadores`.

- [ ] **Step 1: Update the section label**

In `src/components/Fundadores.jsx`, replace:

```jsx
                    04. Fundadores
```

with:

```jsx
                    06. Fundadores
```

- [ ] **Step 2: Run source verification**

Run:

```bash
npm run verify:home-radar-research
```

Expected: PASS with output like:

```text
Home Radar/Research verification passed (20 checks).
```

- [ ] **Step 3: Run build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 4: Commit founders numbering**

Run:

```bash
git add src/components/Fundadores.jsx
git commit -m "feat: renumber founders section"
```

Expected: commit succeeds.

---

### Task 6: Browser Review and Final Documentation

**Files:**
- Modify: `tasks/todo.md`

**Interfaces:**
- Consumes: built homepage behavior and source verification output.
- Produces: final implementation review in `tasks/todo.md`.

- [ ] **Step 1: Start the local dev server**

Run:

```bash
npm run dev -- --host 127.0.0.1 --port 3002
```

Expected: Vite serves the site at `http://127.0.0.1:3002/`.

- [ ] **Step 2: Review desktop behavior**

Open `http://127.0.0.1:3002/` at desktop width and verify:

- `04. Radar` appears after `03. Portfólio`.
- `05. Research` appears after Radar.
- `06. Fundadores` appears after Research.
- Navbar links `Radar` and `Research` scroll to the homepage sections.
- Header active underline reaches Radar and Research.
- `Conhecer o Radar` opens `/radar`.
- `Explorar Research` opens `/research`.
- Public homepage text does not mention UFF.

- [ ] **Step 3: Review mobile behavior**

Open `http://127.0.0.1:3002/` at a mobile width near `390px` and verify:

- Radar and Research text does not overflow.
- CTA buttons remain visible and tappable.
- Sections stack without overlap.
- The mobile menu includes Radar and Research anchors.

- [ ] **Step 4: Stop the dev server**

Use `Ctrl-C` in the terminal running Vite.

Expected: dev server stops cleanly.

- [ ] **Step 5: Update `tasks/todo.md` final review**

Update `tasks/todo.md` so the implementation and verification items are checked and the Review section includes:

```markdown
## Review

- Implemented separate `04. Radar` and `05. Research` sections after `Portfolio`.
- Moved `Fundadores` to `06. Fundadores`.
- Navbar now anchors to `#radar` and `#research`; section CTAs navigate to `/radar` and `/research`.
- Verified with `npm run verify:home-radar-research`.
- Verified with `npm run build`.
- Browser-reviewed desktop and mobile layouts locally.
```

- [ ] **Step 6: Commit final documentation**

Run:

```bash
git add tasks/todo.md
git commit -m "docs: record radar research verification"
```

Expected: commit succeeds.

---

## Final Verification Bundle

After all tasks are complete, run:

```bash
npm run verify:home-radar-research
npm run build
git status --short --branch
```

Expected:

- `npm run verify:home-radar-research` passes.
- `npm run build` passes.
- `git status --short --branch` shows a clean working tree on `nem-page/radar`, ahead of origin by the new commits.

## Self-Review Checklist

- Spec coverage: Tasks 2-5 implement both sections, CTAs, navbar anchors, theme/scroll-spy compatibility, and founders renumbering.
- Verification coverage: Task 1 creates deterministic source checks; Tasks 2-5 run the source check and build; Task 6 covers desktop and mobile browser review.
- Scope control: No dependency additions, no Vercel rewrite changes, no `blink-press` changes, and no public UFF copy.
- Type and naming consistency: Component export is `RadarResearchSections`, imported in `App.jsx` with the same name, section IDs are exactly `radar` and `research`, and CTA destinations are exactly `/radar` and `/research`.
