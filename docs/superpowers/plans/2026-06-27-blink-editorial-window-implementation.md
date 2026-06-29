# Blink Editorial Window Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current pinned glass-stacking Radar/Research implementation with the approved **Janela Editorial Blink** sections.

**Architecture:** Keep `RadarResearchSections.jsx` as the single focused component for both homepage sections. Render two independent sections from a typed local data array, each with a section text column and a Blink-native editorial window card. Tighten the existing source verifier first so the current branch fails until visible `04. Radar` and `05. Research` labels are restored.

**Tech Stack:** Vite, React 18, Tailwind CSS, GSAP ScrollTrigger, Lenis integration already in `App.jsx`, lucide-react icons, existing Blink CSS utilities from `src/index.css`.

## Global Constraints

- Use approved spec: `docs/superpowers/specs/2026-06-27-blink-editorial-window-design.md`.
- Preserve homepage order: `Hero -> Sobre -> ComoAtuamos -> Portfolio -> Radar -> Research -> Fundadores -> Footer`.
- Preserve two independent sections: `section#radar[data-theme="dark"]` and `section#research[data-theme="light"]`.
- Render visible labels exactly: `04. Radar`, `05. Research`, and keep `06. Fundadores`.
- Keep public homepage copy free of `UFF`.
- Do not add new dependencies.
- Do not add sticky pinning, blur stacking, `h-screen` section behavior, or full-screen choreography.
- Use existing Blink identity: `#212121`, `#FDFAF4`, `#FF6A00`, `#FFA52E`, `#F21A1A`, `MuseoModerno`, `Plus Jakarta Sans`, `IBM Plex Mono`.
- Motion must support the click: GSAP reveal, subtle card tilt, cover scale, and CTA hover only.

---

## File Structure

- Modify `scripts/verify-home-radar-research.mjs`
  - Responsibility: source-level guardrail for approved structure, labels, copy, destinations, and banned drift patterns.

- Replace `src/components/RadarResearchSections.jsx`
  - Responsibility: render both Radar and Research editorial windows, their reveal animation, card tilt, section copy, and CTAs.

- Do not modify `src/App.jsx`
  - Current responsibility already correct: imports and renders `RadarResearchSections` between `Portfolio` and `Fundadores`.

- Do not modify `src/components/Navbar.jsx`
  - Current responsibility already correct: anchors `#radar` and `#research`.

- Do not modify `src/components/Fundadores.jsx`
  - Current responsibility already correct: label `06. Fundadores`.

### Task 1: Tighten Source Verification

**Files:**
- Modify: `scripts/verify-home-radar-research.mjs`
- Reads: `src/App.jsx`
- Reads: `src/components/Navbar.jsx`
- Reads: `src/components/Fundadores.jsx`
- Reads: `src/components/RadarResearchSections.jsx`

**Interfaces:**
- Consumes: existing npm script `verify:home-radar-research`.
- Produces: stricter CLI verifier that fails against the current branch and passes only when the approved labels, destinations, copy, and no-pinning rules are present.

- [ ] **Step 1: Replace verifier with stricter implementation**

Replace the entire file `scripts/verify-home-radar-research.mjs` with:

```js
import { existsSync, readFileSync } from 'node:fs';

const checks = [];

function read(path) {
  if (!existsSync(path)) {
    throw new Error(`Missing required file: ${path}`);
  }
  return readFileSync(path, 'utf8');
}

function stripComments(content) {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
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

const app = stripComments(read('src/App.jsx'));
const navbar = stripComments(read('src/components/Navbar.jsx'));
const founders = stripComments(read('src/components/Fundadores.jsx'));
const sectionsPath = 'src/components/RadarResearchSections.jsx';
const rawSections = read(sectionsPath);
const sections = stripComments(rawSections);

expectIncludes('App imports RadarResearchSections', app, "import RadarResearchSections from './components/RadarResearchSections';");
expectOrder('App renders sections after Portfolio', app, '<Portfolio />', '<RadarResearchSections />');
expectOrder('App renders founders after sections', app, '<RadarResearchSections />', '<Fundadores />');

expectIncludes('Radar section id exists', sections, "id: 'radar'");
expectIncludes('Research section id exists', sections, "id: 'research'");
expectIncludes('Radar section label exists', sections, "label: '04. Radar'");
expectIncludes('Research section label exists', sections, "label: '05. Research'");
expectIncludes('Radar headline exists', sections, 'O que está mudando no mercado, antes de virar consenso.');
expectIncludes('Research headline exists', sections, 'Pesquisa aplicada para aproximar academia e mercado.');
expectIncludes('Radar approved copy exists', sections, 'Uma leitura prática de notícias, movimentos e sinais que importam para pequenas e médias empresas. O Radar mostra por que cada mudança merece atenção e o que ela pode provocar na operação real.');
expectIncludes('Research approved copy exists', sections, 'O ambiente onde a Blink aproxima as PMEs brasileiras do que está sendo produzido na academia: papers, pesquisas e ferramentas aplicadas que podem sair do laboratório e virar decisão, operação e produto no mercado real.');
expectIncludes('Radar CTA destination exists', sections, "href: '/radar'");
expectIncludes('Research CTA destination exists', sections, "href: '/research'");
expectIncludes('Radar CTA text exists', sections, 'Conhecer o Radar');
expectIncludes('Research CTA text exists', sections, 'Explorar Research');
expectIncludes('Radar editorial card title exists', sections, 'Sinais que mudam a operação antes da manchete');
expectIncludes('Research editorial card title exists', sections, 'Da academia para decisões de produto, operação e mercado');

expectNotIncludes('Public component does not mention UFF', sections, 'UFF');
expectNotIncludes('Component does not keep static source-check comments', rawSections, '// id="radar"');
expectNotIncludes('Component removes old overlay CTA copy', sections, 'overlayCta');
expectNotIncludes('Component avoids sticky pinning', sections, 'pin: true');
expectNotIncludes('Component avoids h-screen sections', sections, 'h-screen');
expectNotIncludes('Component avoids blur stacking filter', sections, "filter: 'blur");

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

- [ ] **Step 2: Run verifier and confirm it fails before component work**

Run:

```bash
npm run verify:home-radar-research
```

Expected: FAIL. It should report at least missing `label: '04. Radar'`, missing `label: '05. Research'`, old `overlayCta`, sticky pinning, `h-screen`, or static source-check comment failures.

- [ ] **Step 3: Commit verifier guardrail**

Run:

```bash
/usr/bin/git add scripts/verify-home-radar-research.mjs
/usr/bin/git commit -m "test: tighten radar research verifier"
```

Expected: commit succeeds.

### Task 2: Replace Radar/Research With Editorial Windows

**Files:**
- Modify: `src/components/RadarResearchSections.jsx`
- Uses existing: `src/components/illustrations/RadarIllustration.jsx`
- Uses existing: `src/components/illustrations/ResearchIllustration.jsx`

**Interfaces:**
- Consumes: stricter verifier from Task 1.
- Produces: `RadarResearchSections` default React component that renders `#radar` and `#research` sections with approved labels, copy, editorial cards, one sober motion system, and no sticky stacking.

- [ ] **Step 1: Replace component implementation**

Replace the entire file `src/components/RadarResearchSections.jsx` with:

```jsx
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, BookOpenText, Clock, RadioTower } from 'lucide-react';
import RadarIllustration from './illustrations/RadarIllustration';
import ResearchIllustration from './illustrations/ResearchIllustration';

gsap.registerPlugin(ScrollTrigger);

const contentSections = [
    {
        id: 'radar',
        label: '04. Radar',
        eyebrow: 'Destino editorial da Blink',
        title: 'O que está mudando no mercado, antes de virar consenso.',
        body: 'Uma leitura prática de notícias, movimentos e sinais que importam para pequenas e médias empresas. O Radar mostra por que cada mudança merece atenção e o que ela pode provocar na operação real.',
        cta: 'Conhecer o Radar',
        href: '/radar',
        theme: 'dark',
        icon: RadioTower,
        card: {
            title: 'Sinais que mudam a operação antes da manchete',
            excerpt: 'Um recorte do que merece atenção agora, traduzido para quem decide dentro de uma PME.',
            source: 'Blink Radar',
            readTime: '4 min de leitura',
            tags: ['Mercado', 'Sinais', 'PMEs'],
            Cover: RadarIllustration,
        },
    },
    {
        id: 'research',
        label: '05. Research',
        eyebrow: 'Papers, pesquisas e ferramentas aplicadas',
        title: 'Pesquisa aplicada para aproximar academia e mercado.',
        body: 'O ambiente onde a Blink aproxima as PMEs brasileiras do que está sendo produzido na academia: papers, pesquisas e ferramentas aplicadas que podem sair do laboratório e virar decisão, operação e produto no mercado real.',
        cta: 'Explorar Research',
        href: '/research',
        theme: 'light',
        icon: BookOpenText,
        card: {
            title: 'Da academia para decisões de produto, operação e mercado',
            excerpt: 'Papers, métodos e ferramentas apresentados em linguagem prática para negócios brasileiros.',
            source: 'Blink Research',
            readTime: '6 min de leitura',
            tags: ['Papers', 'Ferramentas', 'Aplicação'],
            Cover: ResearchIllustration,
        },
    },
];

export default function RadarResearchSections() {
    const sectionRefs = useRef([]);
    const cardRefs = useRef([]);

    useEffect(() => {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (reduceMotion) {
            return;
        }

        const ctx = gsap.context(() => {
            sectionRefs.current.forEach((section) => {
                if (!section) return;

                const revealItems = section.querySelectorAll('[data-editorial-reveal]');

                gsap.fromTo(
                    revealItems,
                    { y: 34, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.85,
                        stagger: 0.1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: section,
                            start: 'top 72%',
                            toggleActions: 'play none none reverse',
                        },
                    }
                );
            });
        });

        return () => ctx.revert();
    }, []);

    const handleMouseMove = (event, index) => {
        if (!window.matchMedia('(pointer: fine)').matches) return;

        const card = cardRefs.current[index];
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const percentX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        const percentY = -((event.clientY - rect.top) / rect.height - 0.5) * 2;

        gsap.to(card, {
            rotateX: percentY * 1.8,
            rotateY: percentX * 1.8,
            duration: 0.45,
            ease: 'power2.out',
            transformPerspective: 900,
            transformOrigin: 'center',
        });
    };

    const handleMouseLeave = (index) => {
        const card = cardRefs.current[index];
        if (!card) return;

        gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.7,
            ease: 'elastic.out(1, 0.35)',
        });
    };

    return (
        <>
            {contentSections.map((section, index) => {
                const isDark = section.theme === 'dark';
                const isReversed = section.id === 'research';
                const Icon = section.icon;
                const Cover = section.card.Cover;

                return (
                    <section
                        key={section.id}
                        id={section.id}
                        ref={(element) => { sectionRefs.current[index] = element; }}
                        data-theme={section.theme}
                        className={`relative overflow-hidden px-6 py-28 lg:px-20 lg:py-36 ${isDark ? 'bg-dark text-cream' : 'bg-cream text-dark'}`}
                    >
                        <div className="brand-gradient-divider absolute left-0 top-0" />

                        <div className={`relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[minmax(0,0.88fr)_minmax(380px,0.72fr)] lg:gap-20 ${isReversed ? 'lg:grid-flow-col-dense' : ''}`}>
                            <div className={`${isReversed ? 'lg:col-start-2' : ''}`}>
                                <span
                                    data-editorial-reveal
                                    className={`mb-8 inline-flex rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-widest ${isDark ? 'border-orange/40 text-orange' : 'border-orange text-orange'}`}
                                >
                                    {section.label}
                                </span>

                                <p
                                    data-editorial-reveal
                                    className={`mb-5 font-mono text-xs uppercase tracking-[0.18em] ${isDark ? 'text-[#FF8A1C]' : 'text-[#C2410C]'}`}
                                >
                                    {section.eyebrow}
                                </p>

                                <h2
                                    data-editorial-reveal
                                    data-no-stretch
                                    className={`max-w-3xl font-display text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl ${isDark ? 'text-cream' : 'text-dark'}`}
                                    style={{ textWrap: 'balance' }}
                                >
                                    {section.title}
                                </h2>

                                <p
                                    data-editorial-reveal
                                    className={`mt-8 max-w-2xl font-body text-lg leading-relaxed md:text-xl ${isDark ? 'text-cream/70' : 'text-dark/70'}`}
                                >
                                    {section.body}
                                </p>

                                <a
                                    data-editorial-reveal
                                    href={section.href}
                                    data-cursor="action"
                                    className={`mt-10 inline-flex items-center justify-center gap-3 rounded-full px-7 py-3.5 font-body font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 ${isDark
                                        ? 'brand-gradient text-dark hover:scale-[1.02] focus-visible:ring-offset-dark'
                                        : 'bg-dark text-cream hover:bg-dark/90 focus-visible:ring-offset-cream'
                                        }`}
                                >
                                    {section.cta}
                                    <ArrowUpRight size={18} strokeWidth={2} />
                                </a>
                            </div>

                            <a
                                ref={(element) => { cardRefs.current[index] = element; }}
                                data-editorial-reveal
                                href={section.href}
                                data-cursor="action"
                                onMouseMove={(event) => handleMouseMove(event, index)}
                                onMouseLeave={() => handleMouseLeave(index)}
                                className={`group relative block overflow-hidden rounded-[1.75rem] border shadow-2xl transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 ${isReversed ? 'lg:col-start-1 lg:row-start-1' : ''} ${isDark
                                    ? 'border-white/12 bg-[#181818]/72 text-cream shadow-black/30 focus-visible:ring-offset-dark'
                                    : 'border-dark/10 bg-[#FFF8EA]/80 text-dark shadow-orange/10 focus-visible:ring-offset-cream'
                                    }`}
                                style={{ transformStyle: 'preserve-3d' }}
                                aria-label={section.cta}
                            >
                                <div className="relative aspect-[16/9] overflow-hidden">
                                    <Cover className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-105" />
                                    <div className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-300 group-hover:opacity-50 ${isDark ? 'from-dark/88 via-dark/20 to-transparent opacity-70' : 'from-cream/88 via-cream/20 to-transparent opacity-75'}`} />

                                    <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 pr-4">
                                        {section.card.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className={`rounded-full border px-3 py-1 font-mono text-[0.65rem] uppercase tracking-widest backdrop-blur-sm ${isDark
                                                    ? 'border-white/15 bg-dark/40 text-cream/80'
                                                    : 'border-dark/10 bg-cream/60 text-dark/70'
                                                    }`}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="absolute inset-0 flex items-center justify-center bg-dark/30 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                                        <span className="inline-flex translate-y-3 items-center gap-2 rounded-full brand-gradient px-6 py-3 font-body text-sm font-semibold text-dark shadow-lg shadow-orange/20 transition-transform duration-300 group-hover:translate-y-0 group-focus-visible:translate-y-0">
                                            {section.cta}
                                            <ArrowUpRight size={16} strokeWidth={2} />
                                        </span>
                                    </div>
                                </div>

                                <div className="relative p-6 md:p-7">
                                    <div className="mb-4 flex items-center gap-3">
                                        <span className={`flex h-10 w-10 items-center justify-center rounded-full border ${isDark ? 'border-white/10 bg-white/5 text-orange' : 'border-dark/10 bg-dark/5 text-orange'}`}>
                                            <Icon size={20} strokeWidth={1.7} />
                                        </span>
                                        <span className={`font-mono text-[0.68rem] uppercase tracking-[0.18em] ${isDark ? 'text-cream/55' : 'text-dark/55'}`}>
                                            {section.eyebrow}
                                        </span>
                                    </div>

                                    <h3 className={`font-display text-2xl font-semibold leading-tight transition-colors duration-200 md:text-3xl ${isDark ? 'text-cream group-hover:text-orange' : 'text-dark group-hover:text-orange'}`}>
                                        {section.card.title}
                                    </h3>

                                    <p className={`mt-4 font-body text-sm leading-relaxed md:text-base ${isDark ? 'text-cream/66' : 'text-dark/66'}`}>
                                        {section.card.excerpt}
                                    </p>

                                    <div className={`mt-6 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between ${isDark ? 'border-white/10' : 'border-dark/10'}`}>
                                        <span className="font-mono text-xs uppercase tracking-widest text-orange">
                                            {section.card.source}
                                        </span>
                                        <span className={`inline-flex items-center gap-1.5 font-mono text-xs ${isDark ? 'text-cream/55' : 'text-dark/55'}`}>
                                            <Clock size={14} strokeWidth={1.8} />
                                            {section.card.readTime}
                                        </span>
                                    </div>
                                </div>
                            </a>
                        </div>
                    </section>
                );
            })}
        </>
    );
}
```

- [ ] **Step 2: Run stricter verifier and confirm it passes**

Run:

```bash
npm run verify:home-radar-research
```

Expected: PASS with `Home Radar/Research verification passed (31 checks).`

- [ ] **Step 3: Run lint for the changed component**

Run:

```bash
npx eslint src/components/RadarResearchSections.jsx scripts/verify-home-radar-research.mjs
```

Expected: exit code 0 with no errors.

- [ ] **Step 4: Commit component redesign**

Run:

```bash
/usr/bin/git add src/components/RadarResearchSections.jsx scripts/verify-home-radar-research.mjs
/usr/bin/git commit -m "feat: redesign radar research editorial windows"
```

Expected: commit succeeds.

### Task 3: Browser and Build Verification

**Files:**
- Modify: `tasks/todo.md`

**Interfaces:**
- Consumes: completed component and verifier from Tasks 1-2.
- Produces: verified local implementation and updated task review notes.

- [ ] **Step 1: Run production build**

Run:

```bash
npm run build
```

Expected: Vite production build exits 0 and prints `built in`.

- [ ] **Step 2: Start local dev server for browser QA**

Run:

```bash
npm run dev -- --host 127.0.0.1 --port 5175
```

Expected: Vite serves `http://127.0.0.1:5175/`.

If sandbox blocks local bind with `EPERM`, rerun with escalation because browser QA requires a local server.

- [ ] **Step 3: Desktop browser review**

Open `http://127.0.0.1:5175/` at a desktop viewport.

Check:

- `04. Radar` appears after `03. Portfólio`.
- `05. Research` appears after Radar.
- `06. Fundadores` appears after Research.
- Radar card displays title `Sinais que mudam a operação antes da manchete`.
- Research card displays title `Da academia para decisões de produto, operação e mercado`.
- No section is pinned over another section.
- Cards are visible without top/bottom clipping.
- Navbar active underline reaches Radar and Research while scrolling.
- Each card and text CTA navigates to the matching destination.

- [ ] **Step 4: Mobile browser review**

Set a mobile viewport.

Check:

- Section labels, headings, bodies, cards, and CTAs stack without overlap.
- Card tags wrap cleanly.
- Text remains readable and does not overflow.
- Hover-only overlay is not required to understand or use the section.

- [ ] **Step 5: Update task review notes**

Append to `tasks/todo.md` under `## Review`:

```markdown
- Restarted Radar/Research around the approved `Janela Editorial Blink` direction.
- Tightened `npm run verify:home-radar-research` so it protects visible `04. Radar` and `05. Research` labels and rejects sticky/blur-stacking drift.
- Replaced pinned glass-stacking sections with sober editorial preview windows for Radar and Research.
- Verified with `npm run verify:home-radar-research`.
- Verified with `npx eslint src/components/RadarResearchSections.jsx scripts/verify-home-radar-research.mjs`.
- Verified with `npm run build`.
- Browser-reviewed desktop and mobile layouts locally.
```

- [ ] **Step 6: Commit verification notes**

Run:

```bash
/usr/bin/git add tasks/todo.md
/usr/bin/git commit -m "docs: record editorial window verification"
```

Expected: commit succeeds.

## Self-Review Checklist

- Spec coverage: every requirement in `docs/superpowers/specs/2026-06-27-blink-editorial-window-design.md` maps to Task 1, Task 2, or Task 3.
- Completeness scan: this plan contains no incomplete markers or incomplete implementation references.
- Type consistency: `contentSections`, `section.card.Cover`, `section.card.tags`, `section.card.source`, and `section.card.readTime` are defined before use in the component.
- Verification: Task 1 intentionally fails before implementation; Task 2 must pass source checks after implementation; Task 3 proves build and browser-visible behavior.
