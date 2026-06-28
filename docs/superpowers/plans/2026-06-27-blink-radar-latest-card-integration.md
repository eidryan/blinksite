# Blink Radar Latest Card Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Radar editorial window on the Blink homepage show the latest published Radar article instead of only static placeholder editorial copy.

**Architecture:** The source of truth remains the separate `blink-press` app in `/Users/luancarvalho/Documents/GitHub/blink-hub`. Add a small public JSON contract there, expose it through a same-origin rewrite in `blinksite`, and let the homepage card progressively enhance itself from that endpoint while preserving the current static fallback.

**Tech Stack:** Next.js 16 App Router route handler in `blink-hub`, Vite React 18 in `blinksite`, existing Vercel rewrites, existing Vitest tests in `blink-hub`, existing static verifier in `blinksite`.

## Global Constraints

- Keep Radar and Research as separate numbered homepage sections: `04. Radar`, `05. Research`, `06. Fundadores`, `07. Contato`.
- Do not mention UFF in public homepage copy.
- Do not scrape HTML from `/radar`; expose structured JSON from `blink-press`.
- Do not show draft Radar posts. Only `status: published` content can appear in the homepage card.
- Do not add new runtime dependencies to either repository.
- Main Radar CTA stays `/radar`; only the editorial card link can point to the latest article detail.
- If the latest-post request fails, returns invalid JSON, or returns no post, keep the existing static Radar card fallback.
- Keep the no-pinning/no-h-screen/no-blur-stacking direction already enforced in `scripts/verify-home-radar-research.mjs`.
- Local implementation touches two checkouts:
  - `/Users/luancarvalho/Documents/GitHub/blink-hub`
  - `/Users/luancarvalho/Documents/GitHub/blinksite`

---

## File Structure

### `/Users/luancarvalho/Documents/GitHub/blink-hub`

- Create `lib/latest-radar.ts`
  - Owns the public latest-Radar JSON shape.
  - Reads from existing `getNoticias()`.
  - Normalizes date, tags, href, and fallback-free latest article payload.
- Create `app/api/radar/latest/route.ts`
  - Next.js App Router route handler.
  - Exports `GET`.
  - Returns `Response.json({ post })`.
- Create `tests/latest-radar.test.ts`
  - Tests published-only behavior, draft exclusion, newest-first selection, and public payload shape.

### `/Users/luancarvalho/Documents/GitHub/blinksite`

- Modify `vercel.json`
  - Add same-origin rewrite from `/api/radar/latest` to `https://blink-press-blinkgroup.vercel.app/api/radar/latest`.
- Create `src/lib/latestRadarPost.js`
  - Browser-side fetch/normalization helper.
  - Uses `import.meta.env.VITE_RADAR_LATEST_URL` for local QA override.
  - Defaults to `/api/radar/latest` for production.
- Modify `src/components/RadarResearchSections.jsx`
  - Fetches latest Radar post once on mount.
  - Uses latest post only for the Radar card.
  - Keeps Research card static.
- Modify `scripts/verify-home-radar-research.mjs`
  - Adds source-level checks for the endpoint rewrite, fetch helper, fallback, and card link behavior.
- Modify `tasks/todo.md`
  - Records this plan and final verification results during execution.

---

### Task 1: Add Latest Radar JSON Contract To `blink-press`

**Files:**
- Create: `/Users/luancarvalho/Documents/GitHub/blink-hub/lib/latest-radar.ts`
- Create: `/Users/luancarvalho/Documents/GitHub/blink-hub/app/api/radar/latest/route.ts`
- Create: `/Users/luancarvalho/Documents/GitHub/blink-hub/tests/latest-radar.test.ts`

**Interfaces:**
- Consumes: `getNoticias(opts?: { includeDrafts?: boolean; baseDir?: string })` from `/Users/luancarvalho/Documents/GitHub/blink-hub/lib/content.ts`.
- Produces:
  - `type LatestRadarPost`
  - `function getLatestRadarPost(opts?: { baseDir?: string }): LatestRadarPost | null`
  - `GET()` route response: `{ post: LatestRadarPost | null }`

- [ ] **Step 1: Create a failing test for the latest-post helper**

Create `/Users/luancarvalho/Documents/GitHub/blink-hub/tests/latest-radar.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { getLatestRadarPost } from '../lib/latest-radar';

const FIXTURES = path.join(import.meta.dirname, 'fixtures');

describe('getLatestRadarPost', () => {
  it('returns the newest published Radar post and excludes drafts', () => {
    const post = getLatestRadarPost({ baseDir: FIXTURES });

    expect(post).toEqual({
      slug: '2026-06-01-noticia-publicada',
      href: '/radar/2026-06-01-noticia-publicada',
      title: 'Notícia publicada',
      summary: 'Resumo da notícia publicada',
      category: 'Brasil',
      date: '2026-06-01T00:00:00.000Z',
      dateLabel: '01 jun. 2026',
      source: 'Blink Radar',
      readTime: '4 min de leitura',
      tags: ['Brasil', 'Último post', 'PMEs'],
    });
  });

  it('returns null when there is no published Radar post', () => {
    const post = getLatestRadarPost({ baseDir: path.join(FIXTURES, 'nao-existe') });

    expect(post).toBeNull();
  });
});
```

- [ ] **Step 2: Run the failing test**

Run from `/Users/luancarvalho/Documents/GitHub/blink-hub`:

```bash
npm test -- tests/latest-radar.test.ts
```

Expected result:

```text
FAIL tests/latest-radar.test.ts
Cannot find module '../lib/latest-radar'
```

- [ ] **Step 3: Implement the helper**

Create `/Users/luancarvalho/Documents/GitHub/blink-hub/lib/latest-radar.ts`:

```ts
import { getNoticias } from './content';

type LatestRadarOptions = {
  baseDir?: string;
};

export type LatestRadarPost = {
  slug: string;
  href: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  dateLabel: string;
  source: 'Blink Radar';
  readTime: '4 min de leitura';
  tags: string[];
};

const formatDateLabel = (date: Date) => (
  date
    .toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    })
    .replace(/\sde\s/g, ' ')
);

export function getLatestRadarPost(opts: LatestRadarOptions = {}): LatestRadarPost | null {
  const [latest] = getNoticias({ baseDir: opts.baseDir });

  if (!latest) {
    return null;
  }

  return {
    slug: latest.slug,
    href: `/radar/${latest.slug}`,
    title: latest.title,
    summary: latest.summary,
    category: latest.category,
    date: latest.date.toISOString(),
    dateLabel: formatDateLabel(latest.date),
    source: 'Blink Radar',
    readTime: '4 min de leitura',
    tags: [latest.category, 'Último post', 'PMEs'],
  };
}
```

- [ ] **Step 4: Create the Next.js route handler**

Create `/Users/luancarvalho/Documents/GitHub/blink-hub/app/api/radar/latest/route.ts`:

```ts
import { getLatestRadarPost } from '@/lib/latest-radar';

const headers = {
  'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=86400',
  'Access-Control-Allow-Origin': '*',
};

export async function GET() {
  return Response.json(
    { post: getLatestRadarPost() },
    { headers },
  );
}
```

Why this shape:
- Next.js App Router route handlers use file convention `app/**/route.ts`.
- `GET` is exported as a named HTTP method.
- `Response.json(...)` uses the Web Response API and does not participate in React rendering.
- CORS is acceptable because the payload is public article metadata and helps local QA with `VITE_RADAR_LATEST_URL`.

- [ ] **Step 5: Verify Task 1**

Run from `/Users/luancarvalho/Documents/GitHub/blink-hub`:

```bash
npm test -- tests/latest-radar.test.ts
npm test
npm run build
```

Expected results:

```text
PASS tests/latest-radar.test.ts
Test Files ... passed
✓ Compiled successfully
```

- [ ] **Step 6: Commit Task 1 in `blink-hub`**

Run from `/Users/luancarvalho/Documents/GitHub/blink-hub`:

```bash
/usr/bin/git status --short --branch
/usr/bin/git add lib/latest-radar.ts app/api/radar/latest/route.ts tests/latest-radar.test.ts
/usr/bin/git commit -m "feat(radar): expose latest post metadata"
```

Expected result:

```text
[branch-name <sha>] feat(radar): expose latest post metadata
```

---

### Task 2: Add Latest Radar Fetch Helper And Rewrite In `blinksite`

**Files:**
- Modify: `/Users/luancarvalho/Documents/GitHub/blinksite/vercel.json`
- Create: `/Users/luancarvalho/Documents/GitHub/blinksite/src/lib/latestRadarPost.js`
- Modify: `/Users/luancarvalho/Documents/GitHub/blinksite/scripts/verify-home-radar-research.mjs`

**Interfaces:**
- Consumes: `GET /api/radar/latest` returning `{ post: LatestRadarPost | null }`.
- Produces:
  - `fetchLatestRadarPost(): Promise<LatestRadarCardPost | null>`
  - `normalizeLatestRadarPost(payload: unknown): LatestRadarCardPost | null`

- [ ] **Step 1: Add the same-origin Vercel rewrite**

In `/Users/luancarvalho/Documents/GitHub/blinksite/vercel.json`, add this rewrite before the existing `/api/newsletter` rewrite:

```json
{ "source": "/api/radar/latest", "destination": "https://blink-press-blinkgroup.vercel.app/api/radar/latest" },
```

The relevant rewrite block should include:

```json
"rewrites": [
  { "source": "/radar", "destination": "https://blink-press-blinkgroup.vercel.app/radar" },
  { "source": "/radar/:path*", "destination": "https://blink-press-blinkgroup.vercel.app/radar/:path*" },
  { "source": "/research", "destination": "https://blink-press-blinkgroup.vercel.app/research" },
  { "source": "/research/:path*", "destination": "https://blink-press-blinkgroup.vercel.app/research/:path*" },
  { "source": "/_next/:path*", "destination": "https://blink-press-blinkgroup.vercel.app/_next/:path*" },
  { "source": "/api/radar/latest", "destination": "https://blink-press-blinkgroup.vercel.app/api/radar/latest" },
  { "source": "/api/newsletter", "destination": "https://blink-press-blinkgroup.vercel.app/api/newsletter" },
  { "source": "/sitemap.xml", "destination": "https://blink-press-blinkgroup.vercel.app/sitemap.xml" }
]
```

- [ ] **Step 2: Create the client fetch helper**

Create `/Users/luancarvalho/Documents/GitHub/blinksite/src/lib/latestRadarPost.js`:

```js
const endpoint = import.meta.env.VITE_RADAR_LATEST_URL || '/api/radar/latest';

const isRecord = (value) => (
    value !== null && typeof value === 'object' && !Array.isArray(value)
);

const isNonEmptyString = (value) => (
    typeof value === 'string' && value.trim().length > 0
);

export function normalizeLatestRadarPost(payload) {
    if (!isRecord(payload) || !isRecord(payload.post)) {
        return null;
    }

    const { post } = payload;

    if (
        !isNonEmptyString(post.title)
        || !isNonEmptyString(post.summary)
        || !isNonEmptyString(post.href)
        || !isNonEmptyString(post.category)
        || !isNonEmptyString(post.dateLabel)
    ) {
        return null;
    }

    return {
        href: post.href,
        title: post.title,
        excerpt: post.summary,
        source: isNonEmptyString(post.source) ? post.source : 'Blink Radar',
        readTime: isNonEmptyString(post.readTime) ? post.readTime : '4 min de leitura',
        meta: `Último post · ${post.dateLabel}`,
        tags: Array.isArray(post.tags) && post.tags.length > 0
            ? post.tags.filter(isNonEmptyString).slice(0, 3)
            : [post.category, 'Último post', 'PMEs'],
    };
}

export async function fetchLatestRadarPost() {
    const response = await fetch(endpoint, {
        headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
        throw new Error(`Latest Radar request failed with status ${response.status}`);
    }

    return normalizeLatestRadarPost(await response.json());
}
```

- [ ] **Step 3: Extend the source verifier**

In `/Users/luancarvalho/Documents/GitHub/blinksite/scripts/verify-home-radar-research.mjs`, add:

```js
const vercel = stripComments(read('vercel.json'));
const latestRadar = stripComments(read('src/lib/latestRadarPost.js'));
```

Add these checks after the existing Radar CTA/card checks:

```js
expectIncludes('Latest Radar API rewrite exists', vercel, '"/api/radar/latest"');
expectIncludes('Latest Radar rewrite targets blink-press', vercel, '"https://blink-press-blinkgroup.vercel.app/api/radar/latest"');
expectIncludes('Latest Radar helper exports fetch function', latestRadar, 'export async function fetchLatestRadarPost()');
expectIncludes('Latest Radar helper validates payload', latestRadar, 'export function normalizeLatestRadarPost(payload)');
expectIncludes('Latest Radar helper supports local QA override', latestRadar, 'VITE_RADAR_LATEST_URL');
expectIncludes('Latest Radar helper falls back to null for invalid payload', latestRadar, 'return null;');
```

- [ ] **Step 4: Verify Task 2 source checks**

Run from `/Users/luancarvalho/Documents/GitHub/blinksite`:

```bash
npm run verify:home-radar-research
npx eslint src/lib/latestRadarPost.js scripts/verify-home-radar-research.mjs
```

Expected results:

```text
Home Radar/Research verification passed
```

ESLint should print no errors.

- [ ] **Step 5: Commit Task 2 in `blinksite`**

Run from `/Users/luancarvalho/Documents/GitHub/blinksite`:

```bash
/usr/bin/git status --short --branch
/usr/bin/git add vercel.json src/lib/latestRadarPost.js scripts/verify-home-radar-research.mjs
/usr/bin/git commit -m "feat(radar): add latest post fetch contract"
```

Expected result:

```text
[nem-page/radar <sha>] feat(radar): add latest post fetch contract
```

---

### Task 3: Wire Latest Radar Data Into The Homepage Card

**Files:**
- Modify: `/Users/luancarvalho/Documents/GitHub/blinksite/src/components/RadarResearchSections.jsx`
- Modify: `/Users/luancarvalho/Documents/GitHub/blinksite/scripts/verify-home-radar-research.mjs`

**Interfaces:**
- Consumes: `fetchLatestRadarPost(): Promise<LatestRadarCardPost | null>`.
- Produces: Radar card renders latest post `title`, `excerpt`, `tags`, `meta`, `href`, and accessible label when available.

- [ ] **Step 1: Update component imports**

Change the first import in `/Users/luancarvalho/Documents/GitHub/blinksite/src/components/RadarResearchSections.jsx`:

```jsx
import { useEffect, useRef, useState } from 'react';
```

Add:

```jsx
import { fetchLatestRadarPost } from '../lib/latestRadarPost';
```

- [ ] **Step 2: Add Radar latest state**

Inside `RadarResearchSections`, directly after existing refs:

```jsx
const [latestRadarPost, setLatestRadarPost] = useState(null);
```

Add this effect after the existing GSAP reveal effect:

```jsx
useEffect(() => {
    let cancelled = false;

    fetchLatestRadarPost()
        .then((post) => {
            if (!cancelled && post) {
                setLatestRadarPost(post);
            }
        })
        .catch(() => {
            if (!cancelled) {
                setLatestRadarPost(null);
            }
        });

    return () => {
        cancelled = true;
    };
}, []);
```

- [ ] **Step 3: Derive card content per section**

Inside the `.map(...)` callback, after:

```jsx
const Cover = section.card.Cover;
```

Add:

```jsx
const latestCard = section.id === 'radar' && latestRadarPost
    ? { ...section.card, ...latestRadarPost }
    : section.card;
const cardHref = section.id === 'radar' && latestRadarPost ? latestRadarPost.href : section.href;
const cardCta = section.id === 'radar' && latestRadarPost ? 'Ler no Radar' : section.cta;
const cardEyebrow = section.id === 'radar' && latestRadarPost ? latestRadarPost.meta : section.eyebrow;
```

- [ ] **Step 4: Replace card-only references**

In the editorial card link only, replace:

```jsx
href={section.href}
```

with:

```jsx
href={cardHref}
```

Replace:

```jsx
aria-label={`${section.cta}: ${section.card.title}`}
```

with:

```jsx
aria-label={`${cardCta}: ${latestCard.title}`}
```

Replace all card display reads:

```jsx
section.card.tags
section.card.title
section.card.excerpt
section.card.source
section.card.readTime
```

with:

```jsx
latestCard.tags
latestCard.title
latestCard.excerpt
latestCard.source
latestCard.readTime
```

Replace the card internal eyebrow:

```jsx
{section.eyebrow}
```

with:

```jsx
{cardEyebrow}
```

Replace the card hover CTA only:

```jsx
{section.cta}
```

with:

```jsx
{cardCta}
```

Do not change the desktop or mobile standalone section CTAs. They must continue to use `href={section.href}` and `{section.cta}`.

- [ ] **Step 5: Extend verifier for dynamic card behavior**

In `/Users/luancarvalho/Documents/GitHub/blinksite/scripts/verify-home-radar-research.mjs`, add checks:

```js
expectIncludes('Radar component imports latest-post helper', sections, "import { fetchLatestRadarPost } from '../lib/latestRadarPost';");
expectIncludes('Radar component stores latest post state', sections, 'const [latestRadarPost, setLatestRadarPost] = useState(null);');
expectIncludes('Radar component fetches latest post', sections, 'fetchLatestRadarPost()');
expectIncludes('Radar card uses latest post when available', sections, "section.id === 'radar' && latestRadarPost");
expectIncludes('Radar card can link to latest article', sections, 'href={cardHref}');
expectIncludes('Radar card hover CTA changes for latest article', sections, "const cardCta = section.id === 'radar' && latestRadarPost ? 'Ler no Radar' : section.cta;");
expectIncludes('Standalone CTAs still use section href', sections, 'href={section.href}');
expectIncludes('Latest Radar failure keeps fallback card', sections, 'setLatestRadarPost(null);');
```

Update this count because the card link no longer uses `href={section.href}`:

```js
expectCount('Configured href is wired to desktop and mobile CTAs', sections, 'href={section.href}', 2);
```

- [ ] **Step 6: Verify Task 3**

Run from `/Users/luancarvalho/Documents/GitHub/blinksite`:

```bash
npm run verify:home-radar-research
npx eslint src/components/RadarResearchSections.jsx src/lib/latestRadarPost.js scripts/verify-home-radar-research.mjs
npm run build
```

Expected results:

```text
Home Radar/Research verification passed
```

ESLint should print no errors.

`npm run build` should finish successfully. The existing Vite chunk-size warning can remain.

- [ ] **Step 7: Commit Task 3 in `blinksite`**

Run from `/Users/luancarvalho/Documents/GitHub/blinksite`:

```bash
/usr/bin/git status --short --branch
/usr/bin/git add src/components/RadarResearchSections.jsx scripts/verify-home-radar-research.mjs
/usr/bin/git commit -m "feat(radar): show latest post in homepage card"
```

Expected result:

```text
[nem-page/radar <sha>] feat(radar): show latest post in homepage card
```

---

### Task 4: End-To-End Local Verification Across Both Apps

**Files:**
- Modify: `/Users/luancarvalho/Documents/GitHub/blinksite/tasks/todo.md`

**Interfaces:**
- Consumes: `blink-hub` latest endpoint at `http://127.0.0.1:3000/api/radar/latest`.
- Consumes: `blinksite` local override `VITE_RADAR_LATEST_URL`.
- Produces: verified browser-visible latest Radar card.

- [ ] **Step 1: Start `blink-hub` locally**

Run from `/Users/luancarvalho/Documents/GitHub/blink-hub`:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Expected result:

```text
Local: http://127.0.0.1:3000
```

- [ ] **Step 2: Verify the latest JSON endpoint**

Run:

```bash
curl -sS http://127.0.0.1:3000/api/radar/latest
```

Expected shape:

```json
{
  "post": {
    "slug": "negocio-em-dia-ia-pequenos-negocios",
    "href": "/radar/negocio-em-dia-ia-pequenos-negocios",
    "title": "96% dos pequenos negócios conhecem IA. Menos da metade usa. O que esse número revela sobre como a tecnologia chega até a operação.",
    "summary": "Uma pesquisa do Sebrae com quase cinco mil empresas, publicada em junho de 2026, mostrou algo que parece contraditório: o problema não é o acesso à inteligência artificial. É saber o que fazer com ela antes de ligar.",
    "category": "Tecnologia",
    "date": "2026-06-26T00:00:00.000Z",
    "dateLabel": "26 jun. 2026",
    "source": "Blink Radar",
    "readTime": "4 min de leitura",
    "tags": ["Tecnologia", "Último post", "PMEs"]
  }
}
```

If the live content changes, the exact slug/title/date can differ. The required contract is the same object shape and `status: published` content only.

- [ ] **Step 3: Start `blinksite` with local endpoint override**

Run from `/Users/luancarvalho/Documents/GitHub/blinksite`:

```bash
VITE_RADAR_LATEST_URL=http://127.0.0.1:3000/api/radar/latest npm run dev -- --host 127.0.0.1 --port 5175
```

Expected result:

```text
Local: http://127.0.0.1:5175/
```

- [ ] **Step 4: Browser QA**

Open:

```text
http://127.0.0.1:5175/#radar
```

Verify:
- `04. Radar` remains visible.
- The Radar card title matches the latest JSON `post.title`.
- The Radar card excerpt matches the latest JSON `post.summary`.
- The card tags include the latest JSON category and `Último post`.
- The card meta line reads `Último post · <dateLabel>`.
- The card link points to `/radar/<latest-slug>`.
- The standalone desktop/mobile CTA still points to `/radar`.
- Research card remains static.
- Mobile order remains label -> headline -> body -> card -> CTA.

- [ ] **Step 5: Run final checks in both repos**

Run from `/Users/luancarvalho/Documents/GitHub/blink-hub`:

```bash
npm test
npm run build
```

Run from `/Users/luancarvalho/Documents/GitHub/blinksite`:

```bash
npm run verify:home-radar-research
npx eslint src/components/RadarResearchSections.jsx src/lib/latestRadarPost.js scripts/verify-home-radar-research.mjs
npm run build
```

Expected results:
- All `blink-hub` tests pass.
- `blink-hub` build succeeds.
- `blinksite` verifier passes.
- `blinksite` targeted ESLint prints no errors.
- `blinksite` build succeeds with only the existing Vite chunk-size warning if it appears.

- [ ] **Step 6: Record verification and commit docs in `blinksite`**

Update `/Users/luancarvalho/Documents/GitHub/blinksite/tasks/todo.md` under `## Review` with:

```markdown
- Latest Radar card integration planned/executed: the homepage Radar card now consumes the latest published Radar post from `blink-press` through `/api/radar/latest`, while standalone CTAs keep `/radar` and fallback content remains available.
- Verified `blink-hub` with `npm test` and `npm run build`.
- Verified `blinksite` with `npm run verify:home-radar-research`, targeted ESLint, `npm run build`, and browser QA at `#radar`.
```

Commit from `/Users/luancarvalho/Documents/GitHub/blinksite`:

```bash
/usr/bin/git add tasks/todo.md
/usr/bin/git commit -m "docs: record latest radar card verification"
```

Expected result:

```text
[nem-page/radar <sha>] docs: record latest radar card verification
```

---

## Final Review Checklist

- [ ] `blink-hub/app/api/radar/latest/route.ts` returns only public metadata for the latest published Radar post.
- [ ] Drafts do not appear in the latest-post payload.
- [ ] `blinksite/vercel.json` exposes `/api/radar/latest` as same-origin in production.
- [ ] `src/lib/latestRadarPost.js` returns `null` instead of breaking the homepage on invalid data.
- [ ] `src/components/RadarResearchSections.jsx` updates only the Radar card, not the Research card.
- [ ] Radar standalone CTAs still navigate to `/radar`.
- [ ] Radar card navigates to `/radar/<latest-slug>` when data is available.
- [ ] Static fallback remains in place when fetch fails.
- [ ] Mobile CTA order remains card before CTA.
- [ ] No public UFF copy appears.
- [ ] No sticky pinning, `h-screen`, or blur-stacking returns.

## Execution Notes

- Implement `blink-hub` first. The homepage should not depend on a route that does not exist yet.
- The `blinksite` Vite dev server does not apply Vercel rewrites locally. Use `VITE_RADAR_LATEST_URL=http://127.0.0.1:3000/api/radar/latest` for local browser QA.
- Production should use the default same-origin `/api/radar/latest` URL, handled by Vercel rewrites.
- The latest production Radar post observed on 2026-06-27 was `/radar/negocio-em-dia-ia-pequenos-negocios` with `lastmod` `2026-06-26T00:00:00.000Z`; do not hardcode this in the app because it is expected to change.
