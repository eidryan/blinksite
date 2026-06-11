# Blink Hub (Radar + Research) — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Colocar no ar `/radar` (notícias para PMEs) e `/research` (papers) sob blinkgroup.com.br, com ambiente editorial Keystatic em `/admin`, pipeline de notícias por IA e captura de newsletter via Resend.

**Architecture:** App Next.js (App Router, SSG) novo no repo `eidryan/blink-hub`, com conteúdo MDX em `content/` validado por Zod no build. O site institucional (`eidryan/blinksite`, Vite SPA) ganha rewrites no `vercel.json` apontando `/radar/*` e `/research/*` para o app novo. Publicação = commit na main (via Keystatic ou pipeline) → deploy Vercel.

**Tech Stack:** Next.js 15+ (App Router, TypeScript, Tailwind v4), Zod, gray-matter, next-mdx-remote (RSC), Keystatic (`@keystatic/core` + `@keystatic/next`), Resend, `@anthropic-ai/sdk` (modelo `claude-opus-4-8` + web search server-side), Vitest, GitHub Actions.

**Spec de origem:** `docs/superpowers/specs/2026-06-10-blink-organic-hub-design.md`

---

## Escopo e divisão de planos

Este plano cobre o **blink-hub completo + integração com o blinksite**. O pré-requisito de lançamento do spec — **corrigir o timeout de geocoding do roteirizador CVRP no Streamlit Cloud e aplicar identidade Blink no app** — é um subsistema independente (outro repo, stack Python/Streamlit) e deve ter **plano próprio**. Ele bloqueia apenas o flip de `status: draft → published` do paper `roteirizador-cvrp` (Task 4), não o restante do hub.

Decisões de implementação tomadas neste plano (desvios mínimos do spec, com motivo):

1. **Keystatic monta em `/keystatic`** (caminho fixo da biblioteca) com **redirect de `/admin` → `/keystatic`**. A UX do spec ("abrir /admin") é preservada.
2. O `/admin` é acessado pelo domínio do próprio hub (ex.: `blink-hub.vercel.app/admin`), não pelo domínio principal — os rewrites do site institucional cobrem apenas `/radar` e `/research`, o que mantém o editor fora do domínio público.
3. `/admin/newsletter` (composer) é Fase 2 — nada a construir agora; o spec só reserva o espaço.

## Mapa de arquivos (repo novo `blink-hub`)

```
blink-hub/
├── app/
│   ├── layout.tsx                       # shell editorial (header/footer, fontes, metadataBase)
│   ├── globals.css                      # tema preto/branco (Tailwind v4 @theme)
│   ├── not-found.tsx                    # 404 customizada
│   ├── sitemap.ts                       # sitemap (published only)
│   ├── robots.ts                        # bloqueia /preview e /keystatic
│   ├── radar/page.tsx                   # home do Radar
│   ├── radar/[slug]/page.tsx            # notícia individual + JSON-LD NewsArticle
│   ├── radar/[slug]/opengraph-image.tsx # OG image automática
│   ├── research/page.tsx                # manifesto + lista de papers
│   ├── research/[slug]/page.tsx         # paper + JSON-LD ScholarlyArticle
│   ├── research/[slug]/opengraph-image.tsx
│   ├── preview/radar/[slug]/page.tsx    # preview de drafts (noindex)
│   ├── preview/research/[slug]/page.tsx
│   ├── keystatic/[[...params]]/page.tsx # UI do Keystatic
│   ├── api/keystatic/[...params]/route.ts
│   └── api/newsletter/route.ts          # POST → Resend Audiences
├── components/
│   ├── NewsletterForm.tsx               # client component
│   └── Prose.tsx                        # wrapper tipográfico p/ MDX
├── content/
│   ├── radar/YYYY-MM-DD-slug.mdx
│   └── research/slug.mdx
├── lib/
│   ├── schemas.ts                       # Zod (frontmatter)
│   ├── content.ts                       # loader MDX + filtro published
│   └── pipeline.ts                      # parse/validação do output da IA
├── scripts/generate-news.mts            # pipeline IA
├── tests/                               # vitest + fixtures
├── .github/workflows/radar-pipeline.yml
├── keystatic.config.ts
└── next.config.ts                       # redirect /admin → /keystatic
```

**Repo existente `blinksite`** (2 arquivos tocados na Task 12): `vercel.json` (rewrites) e `src/components/Navbar.jsx` (links Radar/Research).

---

### Task 1: Scaffold do repo `blink-hub`

**Files:**
- Create: repo `~/Documents/GitHub/blink-hub` (via create-next-app)

- [ ] **Step 1: Criar o app**

```bash
cd ~/Documents/GitHub
npx create-next-app@latest blink-hub --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --turbopack --use-npm
cd blink-hub
```

- [ ] **Step 2: Verificar que roda**

Run: `npm run dev &` e depois `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000`
Expected: `200`. Matar o dev server depois.

- [ ] **Step 3: Criar o repo no GitHub e push**

```bash
git add -A && git commit -m "chore: scaffold next.js app" || true
gh repo create eidryan/blink-hub --private --source=. --remote=origin --push
```

---

### Task 2: Schemas Zod do frontmatter (TDD)

**Files:**
- Create: `lib/schemas.ts`
- Test: `tests/schemas.test.ts`

- [ ] **Step 1: Instalar dependências**

```bash
npm i zod gray-matter next-mdx-remote resend @keystatic/core @keystatic/next @anthropic-ai/sdk
npm i -D vitest tsx
```

Adicionar em `package.json` → `"scripts"`: `"test": "vitest run"`.

- [ ] **Step 2: Escrever os testes (devem falhar)**

```typescript
// tests/schemas.test.ts
import { describe, it, expect } from 'vitest';
import { noticiaSchema, paperSchema, CATEGORIES } from '../lib/schemas';

const noticiaOk = {
  title: 'Pix parcelado chega às maquininhas',
  date: '2026-06-10',
  category: 'Capital',
  summary: 'Reduz custo de antecipação para PMEs do varejo.',
  sources: [{ label: 'Banco Central', url: 'https://www.bcb.gov.br/' }],
  status: 'published',
};

describe('noticiaSchema', () => {
  it('aceita frontmatter válido e coage a data', () => {
    const r = noticiaSchema.parse(noticiaOk);
    expect(r.date).toBeInstanceOf(Date);
    expect(r.category).toBe('Capital');
  });
  it('rejeita categoria fora do enum', () => {
    expect(() => noticiaSchema.parse({ ...noticiaOk, category: 'Esportes' })).toThrow();
  });
  it('rejeita fonte com URL inválida', () => {
    expect(() =>
      noticiaSchema.parse({ ...noticiaOk, sources: [{ label: 'x', url: 'nao-e-url' }] }),
    ).toThrow();
  });
  it('rejeita status desconhecido', () => {
    expect(() => noticiaSchema.parse({ ...noticiaOk, status: 'rascunho' })).toThrow();
  });
  it('expõe as 5 categorias do spec', () => {
    expect(CATEGORIES).toEqual(['Brasil', 'Mundo', 'Regulação', 'Tecnologia', 'Capital']);
  });
});

describe('paperSchema', () => {
  const paperOk = {
    title: 'Roteirização CVRP com stack gratuita',
    date: '2026-06-10',
    authors: ['Luan Carvalho'],
    abstract: 'Como PMEs podem otimizar rotas sem custo de software.',
    status: 'draft',
  };
  it('aceita paper válido sem pdf (opcional)', () => {
    expect(paperSchema.parse(paperOk).pdf).toBeUndefined();
  });
  it('exige ao menos um autor', () => {
    expect(() => paperSchema.parse({ ...paperOk, authors: [] })).toThrow();
  });
});
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `npm test`
Expected: FAIL — `Cannot find module '../lib/schemas'`

- [ ] **Step 4: Implementar**

```typescript
// lib/schemas.ts
import { z } from 'zod';

export const CATEGORIES = ['Brasil', 'Mundo', 'Regulação', 'Tecnologia', 'Capital'] as const;

export const statusSchema = z.enum(['draft', 'published']);

export const noticiaSchema = z.object({
  title: z.string().min(1),
  date: z.coerce.date(),
  category: z.enum(CATEGORIES),
  summary: z.string().min(1), // "por que isso importa para sua PME"
  sources: z.array(z.object({ label: z.string().min(1), url: z.string().url() })).min(1),
  status: statusSchema,
});

export const paperSchema = z.object({
  title: z.string().min(1),
  date: z.coerce.date(),
  authors: z.array(z.string().min(1)).min(1),
  abstract: z.string().min(1),
  pdf: z.string().optional(),
  status: statusSchema,
});

export type Noticia = z.infer<typeof noticiaSchema>;
export type Paper = z.infer<typeof paperSchema>;
```

- [ ] **Step 5: Rodar e ver passar**

Run: `npm test` — Expected: PASS (7 testes)

- [ ] **Step 6: Commit**

```bash
git add lib/schemas.ts tests/schemas.test.ts package.json package-lock.json
git commit -m "feat: zod schemas para frontmatter de noticias e papers"
```

---

### Task 3: Content loader (TDD)

**Files:**
- Create: `lib/content.ts`
- Test: `tests/content.test.ts`, `tests/fixtures/radar/*.mdx`, `tests/fixtures-invalid/radar/*.mdx`

- [ ] **Step 1: Criar fixtures**

```bash
mkdir -p tests/fixtures/radar tests/fixtures-invalid/radar
```

```mdx
{/* tests/fixtures/radar/2026-06-01-noticia-publicada.mdx */}
---
title: Notícia publicada
date: 2026-06-01
category: Brasil
summary: Importa porque sim.
sources:
  - label: Fonte A
    url: https://example.com/a
status: published
---

Corpo da notícia publicada.
```

```mdx
{/* tests/fixtures/radar/2026-06-05-noticia-draft.mdx */}
---
title: Notícia rascunho
date: 2026-06-05
category: Tecnologia
summary: Ainda em curadoria.
sources:
  - label: Fonte B
    url: https://example.com/b
status: draft
---

Corpo do rascunho.
```

```mdx
{/* tests/fixtures-invalid/radar/2026-06-06-quebrada.mdx */}
---
title: Sem categoria
date: 2026-06-06
summary: Frontmatter incompleto.
sources: []
status: published
---

Não deve passar na validação.
```

(Remover o comentário `{/* ... */}` da primeira linha de cada fixture — está aí só para indicar o path.)

- [ ] **Step 2: Escrever os testes (devem falhar)**

```typescript
// tests/content.test.ts
import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { loadCollection, getNoticias, getNoticia } from '../lib/content';
import { noticiaSchema } from '../lib/schemas';

// import.meta.dirname requer Node 20.11+ (CI usa Node 22)
const FIXTURES = path.join(import.meta.dirname, 'fixtures');
const INVALID = path.join(import.meta.dirname, 'fixtures-invalid');

describe('loadCollection', () => {
  it('carrega entradas com slug derivado do filename e conteúdo MDX', () => {
    const all = loadCollection(path.join(FIXTURES, 'radar'), noticiaSchema);
    expect(all).toHaveLength(2);
    const pub = all.find((e) => e.slug === '2026-06-01-noticia-publicada')!;
    expect(pub.title).toBe('Notícia publicada');
    expect(pub.content).toContain('Corpo da notícia publicada');
  });
  it('lança erro em frontmatter inválido (gate de build)', () => {
    expect(() => loadCollection(path.join(INVALID, 'radar'), noticiaSchema)).toThrow(/quebrada/);
  });
  it('retorna [] para diretório inexistente', () => {
    expect(loadCollection(path.join(FIXTURES, 'nao-existe'), noticiaSchema)).toEqual([]);
  });
});

describe('getNoticias (contra fixtures via baseDir)', () => {
  it('filtra drafts por padrão e ordena por data desc', () => {
    const pub = getNoticias({ baseDir: FIXTURES });
    expect(pub.map((n) => n.slug)).toEqual(['2026-06-01-noticia-publicada']);
  });
  it('inclui drafts quando pedido', () => {
    const all = getNoticias({ baseDir: FIXTURES, includeDrafts: true });
    expect(all[0].slug).toBe('2026-06-05-noticia-draft'); // mais recente primeiro
    expect(all).toHaveLength(2);
  });
  it('getNoticia acha por slug e respeita includeDrafts', () => {
    expect(getNoticia('2026-06-05-noticia-draft', { baseDir: FIXTURES })).toBeUndefined();
    expect(
      getNoticia('2026-06-05-noticia-draft', { baseDir: FIXTURES, includeDrafts: true })?.title,
    ).toBe('Notícia rascunho');
  });
});
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `npm test` — Expected: FAIL — `Cannot find module '../lib/content'`

- [ ] **Step 4: Implementar**

```typescript
// lib/content.ts
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { z } from 'zod';
import { noticiaSchema, paperSchema, type Noticia, type Paper } from './schemas';

export type Entry<T> = T & { slug: string; content: string };

export function loadCollection<S extends z.ZodTypeAny>(
  absDir: string,
  schema: S,
): Entry<z.infer<S>>[] {
  if (!fs.existsSync(absDir)) return [];
  return fs
    .readdirSync(absDir)
    .filter((f) => f.endsWith('.mdx'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(absDir, file), 'utf8');
      const { data, content } = matter(raw);
      const parsed = schema.safeParse(data);
      if (!parsed.success) {
        // build falha aqui — segunda linha de defesa atrás do Keystatic
        throw new Error(`Frontmatter inválido em ${file}: ${parsed.error.message}`);
      }
      return { ...parsed.data, slug: file.replace(/\.mdx$/, ''), content };
    });
}

type Opts = { includeDrafts?: boolean; baseDir?: string };
const defaultBase = () => path.join(process.cwd(), 'content');

function visible<T extends { status: string; date: Date }>(entries: Entry<T>[], opts: Opts) {
  return entries
    .filter((e) => opts.includeDrafts || e.status === 'published')
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function getNoticias(opts: Opts = {}): Entry<Noticia>[] {
  return visible(loadCollection(path.join(opts.baseDir ?? defaultBase(), 'radar'), noticiaSchema), opts);
}

export function getNoticia(slug: string, opts: Opts = {}): Entry<Noticia> | undefined {
  return getNoticias({ ...opts }).find((n) => n.slug === slug);
}

export function getPapers(opts: Opts = {}): Entry<Paper>[] {
  return visible(loadCollection(path.join(opts.baseDir ?? defaultBase(), 'research'), paperSchema), opts);
}

export function getPaper(slug: string, opts: Opts = {}): Entry<Paper> | undefined {
  return getPapers({ ...opts }).find((p) => p.slug === slug);
}
```

- [ ] **Step 5: Rodar e ver passar**

Run: `npm test` — Expected: PASS (todos os testes das Tasks 2 e 3)

- [ ] **Step 6: Commit**

```bash
git add lib/content.ts tests/
git commit -m "feat: content loader com filtro de published e validacao zod"
```

---

### Task 4: Conteúdo seed (notícia inaugural + paper nº 1)

**Files:**
- Create: `content/radar/2026-06-10-por-que-a-blink-lancou-um-radar-para-pmes.mdx`
- Create: `content/research/roteirizador-cvrp.mdx`

- [ ] **Step 1: Notícia inaugural (published)**

```mdx
---
title: Por que a Blink lançou um radar de notícias para PMEs
date: 2026-06-10
category: Brasil
summary: O noticiário econômico fala com analistas, não com quem opera uma PME. O Radar existe para traduzir cada movimento de mercado em uma resposta prática — o que isso muda no seu caixa, no seu preço e na sua operação.
sources:
  - label: Blink Group
    url: https://blinkgroup.com.br
status: published
---

Toda semana, decisões tomadas em Brasília, em bancos centrais e em conselhos de
big techs chegam até a planilha de uma PME brasileira — quase sempre sem aviso e
sem tradução. O Radar da Blink nasce para fazer essa tradução: selecionamos as
notícias que de fato afetam pequenas e médias empresas e publicamos junto a
análise **"por que isso importa para sua PME"**.

Cobrimos cinco frentes: **Brasil**, **Mundo**, **Regulação**, **Tecnologia** e
**Capital**. Nada de repassar manchete: cada item só entra se conseguirmos
responder o que ele muda na prática para quem opera uma empresa.

O Radar é irmão do nosso programa de [pesquisa aplicada](/research), onde
publicamos estudos com profundidade acadêmica e aplicação imediata.
```

- [ ] **Step 2: Paper nº 1 (nasce draft; flip para published quando o roteirizador estiver corrigido — ver "Escopo")**

```mdx
---
title: Roteirização de entregas para PMEs com software 100% gratuito
date: 2026-06-10
authors:
  - Blink Research
abstract: PMEs que entregam produtos perdem margem todos os dias com rotas planejadas no improviso. Este artigo apresenta o problema científico por trás disso (CVRP — Capacitated Vehicle Routing Problem), mostra por que ele é difícil, e documenta uma solução funcional construída inteiramente com ferramentas gratuitas — VRPSolverEasy, OSRM e Nominatim — disponível para qualquer empresa usar agora.
status: draft
---

## O problema: rotas no improviso custam margem

Uma PME com três veículos e quarenta entregas por dia raramente planeja rotas com
método — decide-se "no olho", pela experiência do motorista. O resultado típico é
quilometragem 10–30% acima do necessário, janelas de entrega estouradas e veículos
voltando meio vazios. Em operações com margem apertada, esse desperdício silencioso
muitas vezes é a diferença entre lucro e prejuízo.

## A ciência: CVRP e otimização combinatória

Esse problema tem nome na literatura: **Capacitated Vehicle Routing Problem (CVRP)**
— dado um conjunto de clientes com demandas, uma frota com capacidade limitada e um
depósito, encontrar o conjunto de rotas de menor custo total. O CVRP é NP-difícil:
o número de soluções possíveis explode combinatorialmente, e mesmo instâncias
modestas são intratáveis por força bruta. É por isso que planejar "no olho" fica tão
longe do ótimo — e por que solvers especializados, que combinam programação inteira
e heurísticas, encontram rotas drasticamente melhores em segundos.

## A solução: stack 100% gratuita

Construímos um roteirizador funcional sem nenhuma licença paga:

- **[VRPSolverEasy](https://github.com/inria-UFF/VRPSolverEasy)** — solver de CVRP
  baseado em branch-cut-and-price, estado da arte acadêmico, com interface Python.
- **[OSRM](https://project-osrm.org/)** — matriz de distâncias e tempos reais de
  rua, usando dados do OpenStreetMap.
- **[Nominatim](https://nominatim.org/)** — geocodificação de endereços (texto →
  coordenadas), também sobre OpenStreetMap.

O fluxo: a empresa sobe uma lista de endereços e demandas; o Nominatim geocodifica;
o OSRM calcula a matriz de distâncias reais; o VRPSolverEasy resolve o CVRP e
devolve as rotas por veículo, prontas para o dia.

## Use agora

A ferramenta está no ar, gratuita:
**[roteirizador.streamlit.app](https://roteirizador.streamlit.app)**.
Suba sua lista de entregas e compare o resultado com a rota que sua operação faria
hoje — a diferença é o tamanho da margem que está na mesa.
```

- [ ] **Step 3: Verificar que o build valida o conteúdo**

Run: `npm test && npm run build`
Expected: testes PASS; build conclui sem erro de validação (as páginas que consomem o conteúdo chegam nas Tasks 6–8; aqui o build só não pode quebrar).

- [ ] **Step 4: Commit**

```bash
git add content/
git commit -m "content: noticia inaugural e paper roteirizador-cvrp (draft)"
```

---

### Task 5: Layout base e identidade editorial

**Files:**
- Modify: `app/layout.tsx`, `app/globals.css`
- Create: `components/Prose.tsx`, `app/not-found.tsx`

- [ ] **Step 1: globals.css — tema preto/branco tipográfico (Tailwind v4)**

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --color-ink: #0a0a0a;
  --color-paper: #fafaf7;
  --color-muted: #6b6b6b;
  --color-line: #e3e3de;
  --font-display: var(--font-newsreader), Georgia, serif;
  --font-body: var(--font-libre), system-ui, sans-serif;
}

body {
  background: var(--color-paper);
  color: var(--color-ink);
  font-family: var(--font-body);
}
```

- [ ] **Step 2: layout.tsx**

```tsx
// app/layout.tsx
import type { Metadata } from 'next';
import { Newsreader, Libre_Franklin } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const newsreader = Newsreader({ subsets: ['latin'], variable: '--font-newsreader', style: ['normal', 'italic'] });
const libre = Libre_Franklin({ subsets: ['latin'], variable: '--font-libre' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://blinkgroup.com.br'),
  title: { default: 'Blink Radar', template: '%s — Blink' },
  description: 'O que PMEs brasileiras precisam saber para crescer. Notícias com análise e pesquisa aplicada, pela Blink.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${newsreader.variable} ${libre.variable}`}>
      <body className="min-h-screen flex flex-col">
        <header className="border-b border-line">
          <div className="mx-auto max-w-3xl px-5 py-5 flex items-baseline justify-between">
            <Link href="/radar" className="font-display text-2xl font-semibold tracking-tight">
              Blink<span className="italic font-normal"> Radar</span>
            </Link>
            <nav className="flex gap-6 text-sm text-muted">
              <Link href="/radar" className="hover:text-ink">Radar</Link>
              <Link href="/research" className="hover:text-ink">Research</Link>
              <a href="https://blinkgroup.com.br" className="hover:text-ink">blinkgroup.com.br</a>
            </nav>
          </div>
        </header>
        <main className="flex-1 mx-auto w-full max-w-3xl px-5 py-10">{children}</main>
        <footer className="border-t border-line">
          <div className="mx-auto max-w-3xl px-5 py-8 text-sm text-muted">
            © {new Date().getFullYear()} Blink Group — uma publicação para PMEs brasileiras.
          </div>
        </footer>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Prose.tsx e 404**

```tsx
// components/Prose.tsx
export default function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="[&_h2]:font-display [&_h2]:text-2xl [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:my-4 [&_p]:leading-relaxed [&_a]:underline [&_a]:underline-offset-2 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-1">
      {children}
    </div>
  );
}
```

```tsx
// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="font-display text-5xl italic">404</p>
      <p className="mt-4 text-muted">Essa página não existe ou ainda não foi publicada.</p>
      <Link href="/radar" className="mt-6 inline-block underline underline-offset-2">Voltar ao Radar</Link>
    </div>
  );
}
```

- [ ] **Step 4: Verificar e commitar**

Run: `npm run dev` → abrir `http://localhost:3000` — header/footer renderizam com as fontes.

```bash
git add app/ components/
git commit -m "feat: layout editorial base, tema preto/branco e 404"
```

---

### Task 6: Home do Radar (`/radar`) + formulário de newsletter

**Files:**
- Create: `app/radar/page.tsx`, `components/NewsletterForm.tsx`
- Modify: `app/page.tsx` (raiz do hub redireciona para /radar)

- [ ] **Step 1: NewsletterForm (client)**

```tsx
// components/NewsletterForm.tsx
'use client';
import { useState } from 'react';

export default function NewsletterForm() {
  const [state, setState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [email, setEmail] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState('loading');
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).catch(() => null);
    setState(res?.ok ? 'ok' : 'error');
  }

  if (state === 'ok') return <p className="text-sm">Pronto — você vai receber o radar da semana. 📬</p>;

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
        placeholder="seu@email.com.br"
        className="flex-1 border border-line bg-white px-3 py-2 text-sm rounded-none focus:outline-none focus:border-ink"
      />
      <button type="submit" disabled={state === 'loading'}
        className="bg-ink text-paper px-4 py-2 text-sm disabled:opacity-50">
        {state === 'loading' ? 'Enviando…' : 'Assinar'}
      </button>
      {state === 'error' && <p className="text-sm text-red-700 self-center">Falhou — tente de novo.</p>}
    </form>
  );
}
```

- [ ] **Step 2: Página /radar**

```tsx
// app/radar/page.tsx
import Link from 'next/link';
import type { Metadata } from 'next';
import { getNoticias } from '@/lib/content';
import NewsletterForm from '@/components/NewsletterForm';

export const metadata: Metadata = {
  title: 'Radar — notícias que importam para sua PME',
  description: 'Seleção e análise de notícias para PMEs brasileiras: Brasil, Mundo, Regulação, Tecnologia e Capital.',
};

const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

export default function RadarPage() {
  const noticias = getNoticias();
  const [destaque, ...resto] = noticias;

  return (
    <div className="space-y-12">
      {destaque && (
        <article className="border-b border-line pb-10">
          <p className="text-xs uppercase tracking-widest text-muted">{destaque.category} · {fmt(destaque.date)}</p>
          <h1 className="font-display text-4xl mt-2 leading-tight">
            <Link href={`/radar/${destaque.slug}`}>{destaque.title}</Link>
          </h1>
          <p className="mt-4 text-lg leading-relaxed"><em className="font-display">Por que importa:</em> {destaque.summary}</p>
        </article>
      )}

      <section className="space-y-8">
        {resto.map((n) => (
          <article key={n.slug}>
            <p className="text-xs uppercase tracking-widest text-muted">{n.category} · {fmt(n.date)}</p>
            <h2 className="font-display text-2xl mt-1">
              <Link href={`/radar/${n.slug}`}>{n.title}</Link>
            </h2>
            <p className="mt-2 text-muted">{n.summary}</p>
          </article>
        ))}
      </section>

      <aside className="border border-line p-6">
        <h2 className="font-display text-xl">Blink Research</h2>
        <p className="mt-2 text-sm text-muted">
          Nosso programa de pesquisa aplicada para PMEs — estudos com rigor acadêmico e aplicação imediata.
        </p>
        <Link href="/research" className="mt-3 inline-block text-sm underline underline-offset-2">Conhecer o programa →</Link>
      </aside>

      <aside className="border-t border-line pt-8">
        <h2 className="font-display text-xl">Receba o radar da semana</h2>
        <p className="mt-1 mb-4 text-sm text-muted">O essencial para sua PME, por e-mail. Sem spam.</p>
        <NewsletterForm />
      </aside>
    </div>
  );
}
```

- [ ] **Step 3: Raiz redireciona para /radar**

```tsx
// app/page.tsx (substituir todo o conteúdo)
import { redirect } from 'next/navigation';
export default function Home() {
  redirect('/radar');
}
```

- [ ] **Step 4: Verificar e commitar**

Run: `npm run dev` → `http://localhost:3000/radar` mostra a notícia inaugural como destaque, bloco Research e formulário.

```bash
git add app/radar app/page.tsx components/NewsletterForm.tsx
git commit -m "feat: home do radar com destaque, lista, bloco research e newsletter"
```

---

### Task 7: Notícia individual (`/radar/[slug]`) com JSON-LD e fontes

**Files:**
- Create: `app/radar/[slug]/page.tsx`

- [ ] **Step 1: Implementar a página**

```tsx
// app/radar/[slug]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getNoticia, getNoticias } from '@/lib/content';
import Prose from '@/components/Prose';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getNoticias().map((n) => ({ slug: n.slug })); // só published
}
export const dynamicParams = false; // slug fora da lista => 404

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const n = getNoticia(slug);
  if (!n) return {};
  return {
    title: n.title,
    description: n.summary,
    openGraph: { title: n.title, description: n.summary, type: 'article', publishedTime: n.date.toISOString() },
  };
}

const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' });

export default async function NoticiaPage({ params }: Props) {
  const { slug } = await params;
  const n = getNoticia(slug);
  if (!n) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: n.title,
    datePublished: n.date.toISOString(),
    description: n.summary,
    author: { '@type': 'Organization', name: 'Blink Group', url: 'https://blinkgroup.com.br' },
    publisher: { '@type': 'Organization', name: 'Blink Group' },
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p className="text-xs uppercase tracking-widest text-muted">{n.category} · {fmt(n.date)}</p>
      <h1 className="font-display text-4xl mt-2 leading-tight">{n.title}</h1>

      <div className="mt-6 border-l-2 border-ink pl-4">
        <p className="text-sm uppercase tracking-widest text-muted">Por que isso importa para sua PME</p>
        <p className="mt-1 text-lg leading-relaxed">{n.summary}</p>
      </div>

      <Prose>
        <MDXRemote source={n.content} />
      </Prose>

      <footer className="mt-12 border-t border-line pt-6">
        <p className="text-sm uppercase tracking-widest text-muted">Fontes</p>
        <ul className="mt-2 space-y-1 text-sm">
          {n.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} rel="noopener noreferrer" target="_blank" className="underline underline-offset-2">{s.label}</a>
            </li>
          ))}
        </ul>
      </footer>
    </article>
  );
}
```

- [ ] **Step 2: Verificar**

Run: `npm run dev` → abrir `/radar/2026-06-10-por-que-a-blink-lancou-um-radar-para-pmes` (renderiza, JSON-LD no HTML); abrir `/radar/nao-existe` → 404 customizada.

Run: `npm run build` — Expected: rota listada como SSG (●) com 1 path.

- [ ] **Step 3: Commit**

```bash
git add app/radar/[slug]
git commit -m "feat: pagina de noticia com json-ld, resumo executivo e fontes"
```

---

### Task 8: Research (`/research` e `/research/[slug]`)

**Files:**
- Create: `app/research/page.tsx`, `app/research/[slug]/page.tsx`

- [ ] **Step 1: Página do programa (manifesto + lista)**

> ⚠️ Os dados do programa (nome do professor orientador, vínculo da bolsa, linha de pesquisa) devem ser confirmados com o Luan antes do deploy — abaixo vão como texto descritivo sem nomes, para não publicar informação errada.

```tsx
// app/research/page.tsx
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPapers } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Research — pesquisa aplicada para PMEs',
  description: 'O programa de pesquisa da Blink: ciência aplicada aos problemas reais de pequenas e médias empresas brasileiras.',
};

const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

export default function ResearchPage() {
  const papers = getPapers();
  return (
    <div className="space-y-12">
      <section>
        <h1 className="font-display text-4xl leading-tight">Pesquisa aplicada, <em className="font-normal">para quem opera</em></h1>
        <div className="mt-6 space-y-4 leading-relaxed">
          <p>
            A Blink mantém um programa de pesquisa dedicado aos problemas reais de PMEs
            brasileiras: otimização de operações, precificação, logística e acesso a
            tecnologia que antes só grandes empresas alcançavam.
          </p>
          <p>
            O programa é conduzido com orientação acadêmica formal — professor orientador
            e bolsa de pesquisa — e tem um compromisso: todo estudo publicado aqui vem
            acompanhado de uma aplicação que qualquer PME pode usar.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-widest text-muted border-b border-line pb-2">Publicações</h2>
        <div className="mt-6 space-y-8">
          {papers.length === 0 && <p className="text-muted">Primeira publicação em preparação.</p>}
          {papers.map((p) => (
            <article key={p.slug}>
              <p className="text-xs uppercase tracking-widest text-muted">{fmt(p.date)} · {p.authors.join(', ')}</p>
              <h3 className="font-display text-2xl mt-1">
                <Link href={`/research/${p.slug}`}>{p.title}</Link>
              </h3>
              <p className="mt-2 text-muted">{p.abstract}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Template de paper**

```tsx
// app/research/[slug]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getPaper, getPapers } from '@/lib/content';
import Prose from '@/components/Prose';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPapers().map((p) => ({ slug: p.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = getPaper(slug);
  if (!p) return {};
  return { title: p.title, description: p.abstract, openGraph: { title: p.title, description: p.abstract, type: 'article' } };
}

const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' });

export default async function PaperPage({ params }: Props) {
  const { slug } = await params;
  const p = getPaper(slug);
  if (!p) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: p.title,
    abstract: p.abstract,
    datePublished: p.date.toISOString(),
    author: p.authors.map((a) => ({ '@type': 'Person', name: a })),
    publisher: { '@type': 'Organization', name: 'Blink Group' },
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p className="text-xs uppercase tracking-widest text-muted">Blink Research · {fmt(p.date)}</p>
      <h1 className="font-display text-4xl mt-2 leading-tight">{p.title}</h1>
      <p className="mt-2 text-muted">{p.authors.join(', ')}</p>

      <div className="mt-6 border border-line p-5 bg-white">
        <p className="text-xs uppercase tracking-widest text-muted">Abstract</p>
        <p className="mt-2 leading-relaxed">{p.abstract}</p>
        {p.pdf && (
          <a href={p.pdf} className="mt-3 inline-block text-sm underline underline-offset-2">Baixar PDF →</a>
        )}
      </div>

      <Prose>
        <MDXRemote source={p.content} />
      </Prose>
    </article>
  );
}
```

- [ ] **Step 3: Verificar e commitar**

Run: `npm run dev` → `/research` mostra manifesto e "Primeira publicação em preparação" (paper está draft); `/research/roteirizador-cvrp` → 404 (correto — é draft; a visualização de draft vem na Task 9 via preview).

```bash
git add app/research
git commit -m "feat: pagina research com manifesto e template de paper"
```

---

### Task 9: API de newsletter (Resend)

**Files:**
- Create: `app/api/newsletter/route.ts`, `.env.local` (não commitado)

- [ ] **Step 1: Implementar a rota**

```typescript
// app/api/newsletter/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';

const bodySchema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'E-mail inválido' }, { status: 400 });
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.contacts.create({
    email: parsed.data.email,
    audienceId: process.env.RESEND_AUDIENCE_ID!,
    unsubscribed: false,
  });
  if (error) {
    console.error('resend error', error);
    return NextResponse.json({ error: 'Falha ao cadastrar' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Configurar Resend**

No painel do Resend (resend.com): criar API key e uma Audience "Radar Blink". Em `.env.local`:

```bash
RESEND_API_KEY=re_xxxxxxxx
RESEND_AUDIENCE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

- [ ] **Step 3: Verificar**

Com `npm run dev` rodando:

```bash
curl -s -X POST localhost:3000/api/newsletter -H 'Content-Type: application/json' -d '{"email":"nao-e-email"}' -w '\n%{http_code}\n'
# Expected: {"error":"E-mail inválido"} / 400
curl -s -X POST localhost:3000/api/newsletter -H 'Content-Type: application/json' -d '{"email":"teste@blinkgroup.com.br"}' -w '\n%{http_code}\n'
# Expected: {"ok":true} / 200 — e o contato aparece na audiência do Resend
```

- [ ] **Step 4: Commit**

```bash
git add app/api/newsletter
git commit -m "feat: captura de newsletter via resend audiences"
```

---

### Task 10: Keystatic (`/keystatic`, redirect `/admin`) + preview de drafts

**Files:**
- Create: `keystatic.config.ts`, `app/keystatic/[[...params]]/page.tsx`, `app/api/keystatic/[...params]/route.ts`, `app/preview/radar/[slug]/page.tsx`, `app/preview/research/[slug]/page.tsx`
- Modify: `next.config.ts`

- [ ] **Step 1: keystatic.config.ts**

```typescript
// keystatic.config.ts
import { config, collection, fields } from '@keystatic/core';
import { CATEGORIES } from './lib/schemas';

const isProd = process.env.NODE_ENV === 'production';

export default config({
  storage: isProd
    ? { kind: 'github', repo: { owner: 'eidryan', name: 'blink-hub' } }
    : { kind: 'local' },
  ui: { brand: { name: 'Blink Hub' } },
  collections: {
    noticias: collection({
      label: 'Notícias (Radar)',
      slugField: 'title',
      path: 'content/radar/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['status', 'date', 'category'],
      schema: {
        title: fields.slug({ name: { label: 'Título' } }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Draft (fila de curadoria)', value: 'draft' },
            { label: 'Published (no ar após deploy)', value: 'published' },
          ],
          defaultValue: 'draft',
        }),
        date: fields.date({ label: 'Data', validation: { isRequired: true } }),
        category: fields.select({
          label: 'Categoria',
          options: CATEGORIES.map((c) => ({ label: c, value: c })),
          defaultValue: 'Brasil',
        }),
        summary: fields.text({
          label: 'Por que isso importa para sua PME',
          multiline: true,
          validation: { isRequired: true },
        }),
        sources: fields.array(
          fields.object({
            label: fields.text({ label: 'Fonte', validation: { isRequired: true } }),
            url: fields.url({ label: 'URL', validation: { isRequired: true } }),
          }),
          { label: 'Fontes', itemLabel: (p) => p.fields.label.value || 'fonte' },
        ),
        content: fields.mdx({ label: 'Conteúdo' }),
      },
    }),
    papers: collection({
      label: 'Papers (Research)',
      slugField: 'title',
      path: 'content/research/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['status', 'date'],
      schema: {
        title: fields.slug({ name: { label: 'Título' } }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Published', value: 'published' },
          ],
          defaultValue: 'draft',
        }),
        date: fields.date({ label: 'Data', validation: { isRequired: true } }),
        authors: fields.array(fields.text({ label: 'Autor' }), {
          label: 'Autores',
          itemLabel: (p) => p.value || 'autor',
        }),
        abstract: fields.text({ label: 'Abstract', multiline: true, validation: { isRequired: true } }),
        pdf: fields.text({ label: 'URL do PDF (opcional)' }),
        content: fields.mdx({ label: 'Conteúdo' }),
      },
    }),
  },
});
```

- [ ] **Step 2: Rotas do Keystatic**

```tsx
// app/keystatic/[[...params]]/page.tsx
import { makePage } from '@keystatic/next/ui/app';
import config from '@/keystatic.config';

export default makePage(config);
```

```typescript
// app/api/keystatic/[...params]/route.ts
import { makeRouteHandler } from '@keystatic/next/route-handler';
import config from '@/keystatic.config';

export const { POST, GET } = makeRouteHandler({ config });
```

- [ ] **Step 3: Redirect /admin → /keystatic**

```typescript
// next.config.ts (substituir conteúdo)
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/admin', destination: '/keystatic', permanent: false },
      { source: '/admin/:path*', destination: '/keystatic/:path*', permanent: false },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 4: Rotas de preview de drafts (noindex)**

```tsx
// app/preview/radar/[slug]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getNoticia, getNoticias } from '@/lib/content';
import Prose from '@/components/Prose';

export const metadata: Metadata = { robots: { index: false, follow: false } };
type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getNoticias({ includeDrafts: true }).map((n) => ({ slug: n.slug }));
}
export const dynamicParams = false;

export default async function PreviewNoticia({ params }: Props) {
  const { slug } = await params;
  const n = getNoticia(slug, { includeDrafts: true });
  if (!n) notFound();
  return (
    <article>
      <p className="mb-6 border border-ink bg-white px-3 py-2 text-xs uppercase tracking-widest">
        Preview — status: {n.status}
      </p>
      <p className="text-xs uppercase tracking-widest text-muted">{n.category}</p>
      <h1 className="font-display text-4xl mt-2 leading-tight">{n.title}</h1>
      <div className="mt-6 border-l-2 border-ink pl-4">
        <p className="text-sm uppercase tracking-widest text-muted">Por que isso importa para sua PME</p>
        <p className="mt-1 text-lg leading-relaxed">{n.summary}</p>
      </div>
      <Prose><MDXRemote source={n.content} /></Prose>
    </article>
  );
}
```

```tsx
// app/preview/research/[slug]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getPaper, getPapers } from '@/lib/content';
import Prose from '@/components/Prose';

export const metadata: Metadata = { robots: { index: false, follow: false } };
type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPapers({ includeDrafts: true }).map((p) => ({ slug: p.slug }));
}
export const dynamicParams = false;

export default async function PreviewPaper({ params }: Props) {
  const { slug } = await params;
  const p = getPaper(slug, { includeDrafts: true });
  if (!p) notFound();
  return (
    <article>
      <p className="mb-6 border border-ink bg-white px-3 py-2 text-xs uppercase tracking-widest">
        Preview — status: {p.status}
      </p>
      <h1 className="font-display text-4xl leading-tight">{p.title}</h1>
      <p className="mt-2 text-muted">{p.authors.join(', ')}</p>
      <div className="mt-6 border border-line p-5 bg-white">
        <p className="text-xs uppercase tracking-widest text-muted">Abstract</p>
        <p className="mt-2 leading-relaxed">{p.abstract}</p>
      </div>
      <Prose><MDXRemote source={p.content} /></Prose>
    </article>
  );
}
```

- [ ] **Step 5: Verificar o fluxo editorial completo em modo local**

Run: `npm run dev` →
1. `http://localhost:3000/admin` redireciona para `/keystatic`.
2. UI mostra coleções "Notícias (Radar)" e "Papers (Research)" com as entradas seed.
3. Editar o paper `roteirizador-cvrp`, salvar → arquivo em `content/research/` muda no disco (`git diff`).
4. `http://localhost:3000/preview/research/roteirizador-cvrp` renderiza o draft com a faixa "Preview".
5. Criar uma notícia nova pelo botão "Add" → arquivo novo em `content/radar/`. Apagar depois do teste (ou manter como draft).

**Nota de compatibilidade:** se `/keystatic` der erro de build/runtime com a versão atual do Next, consultar a doc oficial (keystatic.com/docs/installation-next-js) — a montagem (`makePage`/`makeRouteHandler`) é a parte que pode mudar entre versões; o `keystatic.config.ts` permanece.

- [ ] **Step 6: Commit**

```bash
git checkout -- content/ 2>/dev/null || true  # descartar edicoes de teste
git add keystatic.config.ts app/keystatic app/api/keystatic app/preview next.config.ts
git commit -m "feat: ambiente editorial keystatic com fila de drafts e preview"
```

---

### Task 11: SEO técnico (sitemap, robots, OG images)

**Files:**
- Create: `app/sitemap.ts`, `app/robots.ts`, `app/radar/[slug]/opengraph-image.tsx`, `app/research/[slug]/opengraph-image.tsx`

- [ ] **Step 1: sitemap.ts e robots.ts**

```typescript
// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { getNoticias, getPapers } from '@/lib/content';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://blinkgroup.com.br';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/radar`, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/research`, changeFrequency: 'weekly', priority: 0.9 },
    ...getNoticias().map((n) => ({ url: `${BASE}/radar/${n.slug}`, lastModified: n.date })),
    ...getPapers().map((p) => ({ url: `${BASE}/research/${p.slug}`, lastModified: p.date })),
  ];
}
```

```typescript
// app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/preview/', '/keystatic/', '/admin'] }],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://blinkgroup.com.br'}/sitemap.xml`,
  };
}
```

- [ ] **Step 2: OG image para notícias**

```tsx
// app/radar/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og';
import { getNoticia } from '@/lib/content';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const n = getNoticia(slug);
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', background: '#0a0a0a', color: '#fafaf7', padding: 64,
        fontFamily: 'Georgia, serif',
      }}>
        <div style={{ fontSize: 28, letterSpacing: 4, textTransform: 'uppercase', opacity: 0.7 }}>
          Blink Radar · {n?.category ?? ''}
        </div>
        <div style={{ fontSize: 64, lineHeight: 1.15 }}>{n?.title ?? 'Blink Radar'}</div>
        <div style={{ fontSize: 24, opacity: 0.7 }}>blinkgroup.com.br/radar</div>
      </div>
    ),
    size,
  );
}
```

- [ ] **Step 3: OG image para papers** — mesmo arquivo trocando `getNoticia`→`getPaper`, rótulo `Blink Radar · {category}` → `Blink Research`, rodapé `/radar` → `/research`:

```tsx
// app/research/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og';
import { getPaper } from '@/lib/content';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getPaper(slug);
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', background: '#0a0a0a', color: '#fafaf7', padding: 64,
        fontFamily: 'Georgia, serif',
      }}>
        <div style={{ fontSize: 28, letterSpacing: 4, textTransform: 'uppercase', opacity: 0.7 }}>
          Blink Research
        </div>
        <div style={{ fontSize: 64, lineHeight: 1.15 }}>{p?.title ?? 'Blink Research'}</div>
        <div style={{ fontSize: 24, opacity: 0.7 }}>blinkgroup.com.br/research</div>
      </div>
    ),
    size,
  );
}
```

- [ ] **Step 4: Verificar e commitar**

Run: `npm run build && npm run start &` → `curl -s localhost:3000/sitemap.xml` lista `/radar`, `/research` e a notícia publicada; `curl -s localhost:3000/robots.txt` bloqueia `/preview/`; `curl -s -o /dev/null -w "%{http_code}" "localhost:3000/radar/2026-06-10-por-que-a-blink-lancou-um-radar-para-pmes/opengraph-image"` → `200`.

```bash
git add app/sitemap.ts app/robots.ts "app/radar/[slug]/opengraph-image.tsx" "app/research/[slug]/opengraph-image.tsx"
git commit -m "feat: sitemap, robots e og images automaticas"
```

---

### Task 12: Pipeline de notícias por IA (TDD no parser + script + Action)

**Files:**
- Create: `lib/pipeline.ts`, `scripts/generate-news.mts`, `.github/workflows/radar-pipeline.yml`
- Test: `tests/pipeline.test.ts`

- [ ] **Step 1: Testes do parser/validador (devem falhar)**

```typescript
// tests/pipeline.test.ts
import { describe, it, expect } from 'vitest';
import { parsePipelineOutput } from '../lib/pipeline';

const mdx = `---
title: Selic cai e crédito para PME fica mais barato
date: 2026-06-12
category: Capital
summary: Cada ponto a menos na Selic reduz o custo do capital de giro.
sources:
  - label: Banco Central
    url: https://www.bcb.gov.br/
status: published
---

Corpo da análise.`;

const output = `Pesquisei as fontes e preparei a notícia.
<filename>2026-06-12-selic-cai-credito-pme.mdx</filename>
<mdx>
${mdx}
</mdx>`;

describe('parsePipelineOutput', () => {
  it('extrai filename e mdx, valida frontmatter e FORÇA status draft', () => {
    const r = parsePipelineOutput(output);
    expect(r.filename).toBe('2026-06-12-selic-cai-credito-pme.mdx');
    expect(r.mdx).toContain('Corpo da análise.');
    expect(r.mdx).toMatch(/status: draft/); // mesmo que a IA mande published
    expect(r.mdx).not.toMatch(/status: published/);
  });
  it('rejeita output sem marcadores', () => {
    expect(() => parsePipelineOutput('sem marcadores')).toThrow(/marcadores/);
  });
  it('rejeita frontmatter inválido (fail-safe: nada é escrito)', () => {
    const bad = output.replace('category: Capital', 'category: Esportes');
    expect(() => parsePipelineOutput(bad)).toThrow();
  });
  it('rejeita filename fora do padrao YYYY-MM-DD-slug.mdx', () => {
    const bad = output.replace('<filename>2026-06-12-selic-cai-credito-pme.mdx</filename>', '<filename>../../etc/passwd</filename>');
    expect(() => parsePipelineOutput(bad)).toThrow(/filename/);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test` — Expected: FAIL — `Cannot find module '../lib/pipeline'`

- [ ] **Step 3: Implementar o parser**

```typescript
// lib/pipeline.ts
import matter from 'gray-matter';
import { noticiaSchema } from './schemas';

const FILENAME_RE = /^\d{4}-\d{2}-\d{2}-[a-z0-9-]+\.mdx$/;

export function parsePipelineOutput(text: string): { filename: string; mdx: string } {
  const fname = text.match(/<filename>([\s\S]*?)<\/filename>/)?.[1]?.trim();
  const body = text.match(/<mdx>\n?([\s\S]*?)\n?<\/mdx>/)?.[1];
  if (!fname || !body) throw new Error('Output da IA sem marcadores <filename>/<mdx>');
  if (!FILENAME_RE.test(fname)) throw new Error(`filename inválido: ${fname}`);

  const { data, content } = matter(body);
  // força draft independentemente do que a IA escreveu (gate de curadoria humana)
  const validated = noticiaSchema.parse({ ...data, status: 'draft' });

  const fm = [
    `title: ${JSON.stringify(validated.title)}`,
    `date: ${validated.date.toISOString().slice(0, 10)}`,
    `category: ${validated.category}`,
    `summary: ${JSON.stringify(validated.summary)}`,
    'sources:',
    ...validated.sources.flatMap((s) => [`  - label: ${JSON.stringify(s.label)}`, `    url: ${JSON.stringify(s.url)}`]),
    'status: draft',
  ].join('\n');

  return { filename: fname, mdx: `---\n${fm}\n---\n${content}` };
}
```

- [ ] **Step 4: Rodar e ver passar, commitar o parser**

Run: `npm test` — Expected: PASS

```bash
git add lib/pipeline.ts tests/pipeline.test.ts
git commit -m "feat: parser fail-safe do output do pipeline (forca status draft)"
```

- [ ] **Step 5: Script do pipeline (Claude API + web search)**

```typescript
// scripts/generate-news.mts
import fs from 'node:fs';
import path from 'node:path';
import Anthropic from '@anthropic-ai/sdk';
import { parsePipelineOutput } from '../lib/pipeline';

const client = new Anthropic(); // ANTHROPIC_API_KEY do ambiente

const hoje = new Date().toISOString().slice(0, 10);

const PROMPT = `Você é o editor do "Blink Radar", publicação da Blink Group para PMEs brasileiras.

Tarefa: usando busca na web, encontre A notícia mais relevante das últimas 72 horas para
pequenas e médias empresas no Brasil (temas: economia, crédito, regulação/tributos,
tecnologia aplicável, capital). Escreva uma análise original — nunca apenas repasse a notícia.

Regras editoriais:
- O diferencial é o campo "summary": a resposta direta a "por que isso importa para sua PME".
- Corpo: 3 a 5 parágrafos em português do Brasil, tom direto e prático, sem jargão.
- Cite de 1 a 3 fontes reais (as URLs que você de fato consultou na busca).
- category: exatamente um de Brasil | Mundo | Regulação | Tecnologia | Capital.
- date: ${hoje}.

Formato da resposta — exatamente assim, nada depois do fechamento:
<filename>${hoje}-slug-curto-em-kebab-case.mdx</filename>
<mdx>
---
title: "..."
date: ${hoje}
category: ...
summary: "..."
sources:
  - label: "..."
    url: "https://..."
status: draft
---

Corpo da análise em markdown.
</mdx>`;

async function main() {
  const stream = client.messages.stream({
    model: 'claude-opus-4-8',
    max_tokens: 64000,
    thinking: { type: 'adaptive' },
    tools: [{ type: 'web_search_20260209', name: 'web_search' }],
    messages: [{ role: 'user', content: PROMPT }],
  });
  const message = await stream.finalMessage();

  if (message.stop_reason === 'refusal') throw new Error('Modelo recusou a tarefa');

  const text = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');

  const { filename, mdx } = parsePipelineOutput(text);
  const dest = path.join(process.cwd(), 'content', 'radar', filename);
  if (fs.existsSync(dest)) {
    console.log(`Já existe ${filename} — nada a fazer.`);
    return;
  }
  fs.writeFileSync(dest, mdx);
  console.log(`Rascunho criado: content/radar/${filename}`);
}

main().catch((err) => {
  // fail-safe: erro = nenhum arquivo escrito = nada publicado
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 6: Testar o script localmente**

Run: `ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY npx tsx scripts/generate-news.mts`
Expected: cria `content/radar/<hoje>-*.mdx` com `status: draft`. Conferir o draft em `/admin` e em `/preview/radar/<slug>`. Depois: `git checkout -- content/` (não commitar o teste) — ou manter como primeiro draft real.

- [ ] **Step 7: GitHub Action (cron 3x/semana)**

```yaml
# .github/workflows/radar-pipeline.yml
name: radar-pipeline
on:
  schedule:
    - cron: '0 11 * * 1,3,5' # seg/qua/sex 08:00 BRT
  workflow_dispatch:

permissions:
  contents: write

jobs:
  gerar-rascunho:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npx tsx scripts/generate-news.mts
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
      - name: Commit do rascunho (se houver)
        run: |
          git config user.name "blink-radar-bot"
          git config user.email "radar-bot@blinkgroup.com.br"
          git add content/radar
          git diff --cached --quiet && echo "Sem rascunho novo" && exit 0
          git commit -m "radar: rascunho automático $(date +%F)"
          git push
```

- [ ] **Step 8: Commit e configurar o secret**

```bash
git add scripts/generate-news.mts .github/workflows/radar-pipeline.yml
git commit -m "feat: pipeline de noticias por ia (cron 3x/semana, commita draft)"
git push
gh secret set ANTHROPIC_API_KEY --repo eidryan/blink-hub
```

Verificar: `gh workflow run radar-pipeline --repo eidryan/blink-hub` e acompanhar com `gh run watch` — o run deve commitar um `.mdx` com `status: draft` na main.

---

### Task 13: Integração com o site institucional (repo `blinksite`)

**Files:**
- Modify: `vercel.json` (repo blinksite)
- Modify: `src/components/Navbar.jsx:41-47` (repo blinksite)

> Pré-requisito: Task 14 Step 1 (projeto Vercel do hub criado) — o destino dos rewrites é o domínio de produção do projeto `blink-hub` (assumido `blink-hub.vercel.app`; ajustar se o Vercel atribuir outro).

- [ ] **Step 1: Branch no blinksite**

```bash
cd ~/Documents/GitHub/blinksite
git checkout main && git pull && git checkout -b feature/hub-rewrites
```

- [ ] **Step 2: Rewrites no vercel.json** — adicionar a chave `rewrites` ao JSON existente (manter `headers`, `cleanUrls`, `trailingSlash`):

```json
{
  "version": 2,
  "cleanUrls": true,
  "trailingSlash": false,
  "rewrites": [
    { "source": "/radar", "destination": "https://blink-hub.vercel.app/radar" },
    { "source": "/radar/:path*", "destination": "https://blink-hub.vercel.app/radar/:path*" },
    { "source": "/research", "destination": "https://blink-hub.vercel.app/research" },
    { "source": "/research/:path*", "destination": "https://blink-hub.vercel.app/research/:path*" },
    { "source": "/sitemap.xml", "destination": "https://blink-hub.vercel.app/sitemap.xml" }
  ],
  "headers": [ ...manter o conteúdo atual sem alteração... ]
}
```

(O rewrite de `/sitemap.xml` só entra se o site institucional não tiver sitemap próprio — hoje não tem, então o sitemap do hub vira o sitemap do domínio, cobrindo `/radar` e `/research` para o Search Console.)

- [ ] **Step 3: Links na navbar** — em `src/components/Navbar.jsx`, no array `navLinks` (linha ~41):

```jsx
const navLinks = [
    { name: 'Sobre', href: '#sobre' },
    { name: 'Como Atuamos', href: '#como-atuamos' },
    { name: 'Portfólio', href: '#portfolio' },
    { name: 'Fundadores', href: '#fundadores' },
    { name: 'Radar', href: '/radar' },
    { name: 'Research', href: '/research' },
    { name: 'Contato', href: '#contato' },
];
```

O mesmo array alimenta o menu desktop e o mobile — nenhuma outra mudança necessária (`activeSection` nunca vai casar com `radar`/`research`, o que é inofensivo: o link só não ganha o sublinhado de "ativo").

- [ ] **Step 4: Verificar build do blinksite e commitar**

Run: `npm run build` — Expected: build Vite conclui sem erro.

```bash
git add vercel.json src/components/Navbar.jsx
git commit -m "feat: rewrites para o blink-hub e links Radar/Research na navbar"
git push -u origin feature/hub-rewrites
```

Abrir PR para `main` — **só mergear depois da Task 14** (hub em produção), para não criar links quebrados no domínio principal.

---

### Task 14: Deploy, configuração de produção e verificação E2E

- [ ] **Step 1: Projeto Vercel do hub**

```bash
cd ~/Documents/GitHub/blink-hub
vercel link   # criar projeto novo "blink-hub" na conta/teamcerta
vercel env add RESEND_API_KEY production
vercel env add RESEND_AUDIENCE_ID production
vercel env add NEXT_PUBLIC_SITE_URL production   # valor: https://blinkgroup.com.br
git push origin main   # deploy de produção via integração GitHub
```

Confirmar o domínio de produção atribuído (`vercel inspect` ou dashboard). Se não for `blink-hub.vercel.app`, atualizar os rewrites da Task 13 antes do merge.

- [ ] **Step 2: Keystatic em modo GitHub**

1. Acessar `https://blink-hub.vercel.app/keystatic` — na primeira visita em modo GitHub, o Keystatic guia a criação de um **GitHub App** apontando para `eidryan/blink-hub`.
2. Copiar as variáveis geradas para o Vercel (produção): `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`, `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`.
3. Redeploy e login com GitHub no `/keystatic` — salvar uma edição deve criar um commit na main.

- [ ] **Step 3: Merge da integração**

Mergear o PR `feature/hub-rewrites` do blinksite. Verificar em produção:

```bash
curl -s -o /dev/null -w "%{http_code}" https://blinkgroup.com.br/radar          # 200
curl -s https://blinkgroup.com.br/radar | grep -o '<h1[^>]*>' | head -1         # h1 do destaque
curl -s -o /dev/null -w "%{http_code}" https://blinkgroup.com.br/radar/nao-existe  # 404
curl -s https://blinkgroup.com.br/sitemap.xml | grep -c '<loc>'                 # >= 3
```

- [ ] **Step 4: Verificação E2E contra os critérios de sucesso do spec**

1. ☐ `/radar` e `/research` no ar sob blinkgroup.com.br; sitemap enviado no Google Search Console e aceito.
2. ☐ Fluxo ponta a ponta: `gh workflow run radar-pipeline` → draft commitado → abrir `/admin` → editar → conferir `/preview/radar/<slug>` → status `published` → salvar → deploy → notícia no ar. (Meta operacional do spec: repetir até ter **5 notícias publicadas** — operação contínua pós-lançamento, não bloqueia o fim deste plano.)
3. ☐ Criar uma notícia do zero pelo `/admin` e publicá-la.
4. ☐ `/research` apresenta o programa (texto do manifesto revisado pelo Luan — orientador/linha de pesquisa confirmados).
5. ☐ Paper `roteirizador-cvrp`: flip para `published` **somente após** o plano irmão (fix do geocoding + identidade Blink no Streamlit) estar concluído e a ferramenta verificada em produção.
6. ☐ Newsletter: assinar com um e-mail real em produção e confirmar o contato na audiência do Resend.

- [ ] **Step 5: Encerramento**

Atualizar o spec (`docs/superpowers/specs/2026-06-10-blink-organic-hub-design.md`) com status "Implementado — aguardando flip do paper nº 1" e abrir o plano irmão do roteirizador CVRP.

---

## Riscos e pontos de atenção

| Risco | Mitigação |
|---|---|
| Keystatic vs versão do Next (peer deps / montagem) | Task 10 Step 5 verifica cedo em dev; se incompatível, pinar Next na versão suportada pela doc do Keystatic — o resto do app não depende de features novas do Next |
| Domínio de produção do hub diferente do assumido | Rewrites só entram no merge da Task 13, após confirmação na Task 14 Step 1 |
| Pipeline gera conteúdo ruim | Dupla defesa já no design: parser força `status: draft` (curadoria obrigatória) + Zod no build; erro no job = nenhum arquivo escrito |
| Dados do programa de pesquisa (orientador/bolsa) | Texto do manifesto sem nomes até confirmação do Luan (Task 8) |
| Commits do bot disparam deploy a cada cron | Aceitável no MVP (drafts são invisíveis); se incomodar, adicionar [Ignored Build Step](https://vercel.com/docs/project-configuration#ignorecommand) no Vercel comparando se `content/` mudou com status published |
