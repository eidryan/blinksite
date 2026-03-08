# Blink Institutional Site — Prompt 1: Foundation

## Role

You are a senior front-end engineer building the structural foundation of an institutional website for a Brazilian tech holding company. Your job is to build a **pixel-perfect, fully responsive, content-complete site** with professional GSAP scroll animations and buttery Lenis smooth scrolling. This foundation must be so clean and well-architected that a second pass can layer on WebGL shaders, custom cursors, and advanced interaction effects without refactoring anything.

This is a trust-building site for **Blink** — a holding company that builds vertical SaaS products for underserved industries. The site must communicate: competent, ambitious, young, Brazilian, and building something real. Think Constellation Software's holding page with the visual warmth of a São Paulo design studio.

The site language is **Brazilian Portuguese**. All copy is provided below — do not invent, translate, or use Lorem ipsum.

**What this prompt builds:** Complete site with all sections, all copy, full responsive layout, Lenis smooth scroll, GSAP ScrollTrigger animations (clip-path text reveals, scroll-triggered entrances, section color transitions), the origami star logo SVG, noise texture overlay, and all CSS micro-interactions.

**What this prompt does NOT build (saved for Prompt 2):** Custom cursor system, Three.js/WebGL hero canvas, image hover shaders, scroll velocity-reactive effects, horizontal scroll-pinned sections, origami fold/unfold CSS 3D animations. The architecture must accommodate all of these without restructuring.

---

## Architecture Hooks for Prompt 2

Build these into the foundation now. They do nothing in Prompt 1 but are critical later:

1. **Canvas mount points:** Sections receiving WebGL later must have `<div data-canvas="hero">` / `data-canvas="founders"` / `data-canvas="image"` divs positioned absolutely behind content. Empty for now.

2. **Scroll velocity exposure:** Lenis exposes velocity to `--scroll-velocity` CSS custom property and `body[data-scroll-velocity]`. Set but unused in Prompt 1.

3. **Cursor-aware attributes:** All interactive elements get `data-cursor="link"` / `"action"` / `"image"`. Inert in Prompt 1.

4. **Section metadata:** Every section gets `id`, `data-theme="dark"|"light"`, used by body background transition system.

5. **Image wrappers:** Every `<img>` lives inside `<div class="image-canvas-wrapper" data-canvas="image">` for future shader overlay.

---

## Brand Identity — LOCKED DESIGN SYSTEM

**You will also receive the Blink slide guide (PNG images) and the origami star logo as reference files. Study them to match the exact visual language.**

### Color Palette
| Token | Hex | Usage |
|---|---|---|
| `--cream` | `#FDFAF4` | Primary background, light surfaces |
| `--dark` | `#212121` | Primary text, dark sections |
| `--orange` | `#FF6A00` | Primary accent, CTAs, highlights |
| `--gold` | `#FFA52E` | Gradient start, secondary accent |
| `--red` | `#F21A1A` | Gradient end, emphasis moments |
| `--dark-red` | `#C81010` | Deep accent for hover states |
| `--mid-orange` | `#FF8A1C` | Gradient midpoint |

**Brand gradient:**
```css
background: linear-gradient(135deg, #FFA52E 0%, #FF6A00 50%, #F21A1A 100%);
```

### Typography
- **Display / Headings:** `"MuseoModerno"` — weights 200, 400, 600, 800. `letter-spacing: -0.03em`.
- **Body:** `"Plus Jakarta Sans"` — weights 400, 500, 600.
- **Labels:** `"IBM Plex Mono"` — weight 400. Uppercase, `letter-spacing: 0.1em`.

Load all via Google Fonts `<link>` tags.

**Hierarchy:**
- Hero headline: MuseoModerno 800, 5–8rem desktop, 2.5–3.5rem mobile
- Section titles: MuseoModerno 600, 3–4rem desktop
- Subtitle: Plus Jakarta Sans 500, 1.25–1.5rem
- Body: Plus Jakarta Sans 400, 1–1.125rem, line-height 1.6
- Labels: IBM Plex Mono 400, 0.75–0.875rem

### Logo — The Origami Star

The Blink logo is a **4-pointed asymmetric star** inspired by origami — folded paper transforming something flat into something dimensional. This is the brand metaphor: Blink takes flat operations and folds them into structured systems.

**SVG construction (study the provided reference files):**
- NOT a regular star — top-left point elongates upward-left, bottom-right extends down-right (dynamic diagonal axis)
- Each face has a different shade creating 3D folded-paper depth: lighter face = gold `#FFA52E`, main face = orange `#FF6A00`, shadow face = red `#F21A1A`, deep fold = `#C81010`
- Build with `<polygon>` elements and `<linearGradient>` defs. Minimum 4 polygon faces for the origami fold effect.

**Wordmark:** "blink" in MuseoModerno 600 lowercase, to the right of the star. Cream on dark, dark on light.

### Visual Texture

1. **Noise overlay:** Global SVG `<feTurbulence>` at 0.03 opacity. Covers entire page.
2. **Star watermark:** Large (50–70vw), 3–5% opacity origami star as background motif on hero and one other section.
3. **Gradient dividers:** 2px horizontal lines with brand gradient between sections.
4. **Origami accents — EXACTLY 2, EXTREMELY RESTRAINED:**
   - One tiny (24–32px) folded-paper diamond near the "01 — SOBRE" label. SVG with 2–3 polygon faces in gold/orange. Gentle CSS `perspective` + `rotateX` breathing animation, 6s loop. Nearly invisible.
   - One tiny origami arrow near the "05 — CONTATO" label. Same treatment, orange/red tones.
   - These should feel like Easter eggs. If someone doesn't notice them, that's fine.
5. **Sparkle clusters:** 2–3 small ✦ SVGs with brand gradient fill, subtle scale-pulse (0.95→1.05, 3s infinite). Near section headers.

---

## Page Structure — ALL SECTIONS

### 1. NAVBAR — "Floating Pill"
`position: fixed`, pill-shaped, centered, `backdrop-blur`.

- Hero visible: transparent bg, white text
- Past hero: `#FDFAF4/80`, `backdrop-blur(16px)`, dark text, thin `#FF6A00/15` border
- Transition: 0.4s ease

Contents: Logo left · `Sobre · Como Atuamos · Portfólio · Fundadores · Contato` center · `Fale Conosco` gradient CTA right

Mobile: Logo + hamburger → full-screen dark overlay with staggered clip-path link reveals.

All links: `data-cursor="link"`. CTA: `data-cursor="action"`.

### 2. HERO
`100dvh`, `#212121`, `id="hero"`, `data-theme="dark"`.

Mount point: `<div data-canvas="hero" class="absolute inset-0 z-0"></div>`

```
[IBM Plex Mono, orange, uppercase, 0.75rem] RIO DE JANEIRO, BRASIL
[MuseoModerno 800, cream, massive] Decida em um\npiscar de olhos.
[Plus Jakarta Sans 400, cream/70%, max-w 480px] Ferramentas que eliminam o que não deveria existir.
[CTA, gradient bg, dark text, rounded-full] Conheça a Blink ↓
```

GSAP timeline: Label clip-path reveal → Headline word-by-word clip-path + rotateX(6°→0°), stagger 0.08s → Subtitle fade → CTA scale-in.

Star watermark bottom-left, 3% opacity, rotating 360° over 180s.

### 3. SOBRE
Cream, `id="sobre"`, `data-theme="light"`. Two-column (40/60).

Left:
```
01 — SOBRE
Tecnologia que nasce da operação real.
```

Right:
```
Pequenas empresas no Brasil resolvem problemas complexos com ferramentas genéricas — ou sem ferramenta nenhuma. A Blink existe porque acreditamos que cada nicho de mercado merece algo construído para ele.

Entramos na operação, entendemos como o negócio funciona de verdade, e criamos a ferramenta que deveria ter existido desde o início. Depois, escalamos para todo o mercado.

Cada produto é uma marca independente. A Blink é a estrutura por trás.
```

No stat cards. GSAP: columns slide in from sides with word-level clip-path on title.

### 4. COMO ATUAMOS
Dark, `id="como-atuamos"`, `data-theme="dark"`.

```
02 — COMO ATUAMOS
Construímos junto. Escalamos depois.
```

3 cards (no numbers, no durations):

Card 1: `Primeiro, a operação.` — Não construímos ferramentas a partir de suposições. Entramos no negócio, mapeamos cada processo, e encontramos a dor que realmente importa. A ferramenta nasce dessa verdade — não de um briefing.

Card 2: `Depois, lado a lado.` — O cliente não recebe um produto pronto. Ele participa da construção, semana a semana, até que a ferramenta funcione na realidade dele. Não prometemos — entregamos.

Card 3: `Aí, o nicho inteiro.` — O produto se torna independente — marca própria, operação própria — e atende centenas de negócios do mesmo mercado. A consultoria fica sob medida. O software é **padrão**. ← Style "padrão" with orange gradient text.

Cards: `rgba(255,255,255,0.04)` bg, `rgba(255,255,255,0.08)` border, `rounded-2xl`. Gradient connecting lines between cards.

SVG micro-animations per card: radar pulse, merging circles, expanding dot grid.

GSAP: stagger from `y: 40`, `opacity: 0`, 0.15s stagger.

### 5. PORTFÓLIO
Cream, `id="portfolio"`, `data-theme="light"`.

```
03 — PORTFÓLIO
Cada nicho, uma ferramenta.
```

Cadencio card (70% desktop, centered): `#212121` bg, cream text, `rounded-3xl`.
```
[Badge] ATIVO (green dot)
[Title] Cadencio
[Tag] GESTÃO PARA ESTÚDIOS E ACADEMIAS
[Desc] Presença, turmas e operação para quem ensina movimento.
[Link] cadencio.app →
```

Ghost cards: 1–2, 30% opacity, dashed border, "Em desenvolvimento", shimmer animation.

### 6. FUNDADORES
Dark, `id="fundadores"`, `data-theme="dark"`.

```
04 — FUNDADORES
Quem está por trás.
```

Two-column: photo stack left, bios right.

Photos: 4–5 Unsplash images in `image-canvas-wrapper` divs. Polaroid styling (cream border, random rotation, stacked). Auto-advance 4s with GSAP spring animation.

Bios crossfade in sync:
- Luan Carvalho — CO-FUNDADOR, DESENVOLVIMENTO — Full-stack, arquitetura, automação.
- Adrian Villela — CO-FUNDADOR, OPERAÇÕES & ESTRATÉGIA — Eng. produção, processos, estratégia.

Quote:
```
"Pode haver tanto valor em um piscar de olhos quanto em meses de análise racional."
— MALCOLM GLADWELL, BLINK
```

### 7. FOOTER
`#1A1A1A`, `border-radius: 3rem 3rem 0 0`, `id="contato"`, `data-theme="dark"`.

```
05 — CONTATO
Vamos conversar.
Uma conversa sem compromisso. Se fizer sentido, a gente constrói junto.
```

Contacts: WhatsApp · contato@blinkgroup.com.br · LinkedIn

Bottom: `© 2026 Blink Tecnologia. Rio de Janeiro, Brasil.` left · `Feito com obsessão por detalhes.` right

---

## Animation Standards

### Smooth Scroll (Lenis + GSAP)
```js
const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// Velocity hook for Prompt 2
lenis.on('scroll', ({ velocity }) => {
  document.documentElement.style.setProperty('--scroll-velocity', Math.abs(velocity).toFixed(2));
  document.body.dataset.scrollVelocity = Math.abs(velocity).toFixed(2);
});
```

### Text Reveals (clip-path masking)
Split into `<span>` per word. Each in `overflow: hidden` wrapper.
- Start: `clipPath: "inset(0 0 100% 0)"`, `y: 30`
- End: `clipPath: "inset(0)"`, `y: 0`
- Easing: `power4.out`, stagger 0.06–0.08s

### Section Color Transitions
`<body>` background tweens between section colors via ScrollTrigger `scrub: 1` at each boundary. Hero→Sobre: `#212121`→`#FDFAF4`. And so on alternating.

### Page Load Sequence
1. `#212121` screen, centered origami star SVG (40px), brand gradient
2. Star: scale 0.5→1, opacity 0→1, 0.6s
3. Star translates to navbar position while scaling down, 0.8s
4. Hero text animations begin simultaneously
5. ~1.5s total, navbar visible, page scrollable

---

## Technical Stack

- React 19, Tailwind CSS 3.4+, GSAP 3 + ScrollTrigger, Lenis, Lucide React
- Google Fonts: MuseoModerno (200,400,600,800), Plus Jakarta Sans (400,500,600), IBM Plex Mono (400)
- Single `App.jsx`, single `index.css`
- Mobile-first: 375px, 768px, 1024px, 1440px

---

## Anti-Patterns

- Never use colors outside palette
- Never use MuseoModerno for body text
- Never use sharp corners (min `rounded-xl`)
- Never include English text
- Never use Lorem ipsum
- Never add pricing/features/comparisons
- Never auto-play media
- Never forget `data-cursor`, `data-canvas`, `data-theme` attributes
- Never use simple opacity fades for headlines — clip-path masking only
