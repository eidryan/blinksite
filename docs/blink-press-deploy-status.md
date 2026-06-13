# blink-press — Status de Deploy e Contexto

## O que é o blink-press

Repositório separado em `~/Documents/GitHub/blink-hub` (pasta local) / `Ln-Carvalho/blink-press` (GitHub).

Plataforma de conteúdo orgânico da Blink com duas seções:
- `/radar` — curadoria de notícias para PMEs com análise "por que isso importa"
- `/research` — papers com profundidade acadêmica e aplicação imediata

Stack: Next.js 16 (App Router, SSG) · Tailwind v4 · MDX · Keystatic CMS · Resend (newsletter) · Claude API (pipeline de notícias via GitHub Action cron).

Integra ao `blinkgroup.com.br` via rewrites do Vercel — **PR #1 mergeado em 12/06/2026, rewrites ativos em produção**.

---

## Estado atual dos repositórios

### blink-press (`~/Documents/GitHub/blink-hub`)
- Branch: `main` — 22 commits
- GitHub: `https://github.com/Ln-Carvalho/blink-press` (privado)
- Vercel: projeto `blink-press` no team `blinkgroup`
- URL de produção: `https://blink-press-blinkgroup.vercel.app`
- Deploy atual: READY (último commit: `chore: force clean vercel build`)
- Testes: 23/23 passando (`npm test`)

### blinksite (`~/Documents/GitHub/blinksite`)
- Branch: `feature/hub-rewrites` — ainda não mergeada na `main`
- O merge só deve acontecer **depois** do blink-press estar funcionando em produção
- O `vercel.json` já aponta para `blink-press-blinkgroup.vercel.app`

---

## Variáveis de ambiente configuradas no Vercel

| Variável | Status |
|---|---|
| `KEYSTATIC_GITHUB_CLIENT_ID` | ✅ Configurada (Production) |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | ✅ Configurada (Production) |
| `KEYSTATIC_SECRET` | ✅ Configurada (Production) |
| `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | ✅ Configurada (Production) — valor: `blink-press-keystatic` |
| `RESEND_API_KEY` | ✅ Configurada (Production, Preview) |
| `RESEND_AUDIENCE_ID` | ✅ Configurada (Production, Preview) |
| `ANTHROPIC_API_KEY` | ❌ Falta adicionar como GitHub Secret (verificado em 12/06 — não está no repo, environments nem Vercel) |

---

## GitHub App do Keystatic

- Nome: `blink-press-keystatic`
- Owner: `Ln-Carvalho`
- Client ID: `Iv23lihSf9v0otb8k73l`
- Callback URL configurada: `https://blink-press-blinkgroup.vercel.app/api/keystatic/github/oauth/callback`
- Status: criado e com credenciais no Vercel

**PENDENTE:** Verificar se o app está **instalado** no repositório `Ln-Carvalho/blink-press`. Sem instalação, o CMS não consegue commitar conteúdo.
Para instalar: `github.com/settings/apps/blink-press-keystatic` → Install App → Only select repositories → `blink-press`.

---

## Como acessar o Keystatic (CMS)

A tela do Keystatic fica **branca** até o usuário autenticar. Isso é comportamento esperado — o componente só renderiza após verificar a sessão GitHub.

**Para acessar:**
1. Vá para: `https://blink-press-blinkgroup.vercel.app/api/keystatic/github/login`
2. Autorize o app `blink-press-keystatic` no GitHub
3. Após o redirect, acesse: `https://blink-press-blinkgroup.vercel.app/keystatic`

---

## Conteúdo existente

| Tipo | Slug | Status |
|---|---|---|
| Radar (notícia) | `2026-06-10-por-que-a-blink-lancou-um-radar-para-pmes` | **published** — aparece em `/radar` |
| Research (paper) | `roteirizador-cvrp` | **draft** — não aparece publicamente |

O paper do roteirizador fica em draft até o app de roteirização estar funcionando (fix do Streamlit/geocoding pendente em outro projeto).

---

## Pipeline de IA (GitHub Actions)

Workflow: `.github/workflows/radar-pipeline.yml`
- Roda seg/qua/sex às 08h BRT
- Usa Claude API para gerar rascunhos de notícias
- Commita com `status: draft` — nunca publica automaticamente
- **PENDENTE:** Adicionar o secret `ANTHROPIC_API_KEY` no repositório GitHub:
  ```
  gh secret set ANTHROPIC_API_KEY --repo Ln-Carvalho/blink-press
  ```

---

## Status da publicação (12/06/2026)

### ✅ Concluído
- Deployment Protection desativada — produção pública
- `/radar`, `/research`, `/sitemap.xml`, `/robots.txt` respondendo 200 com conteúdo correto (post publicado visível, draft oculto)
- Newsletter validada (endpoint `/api/newsletter` respondendo; Resend configurado)
- PR #1 (`feature/hub-rewrites` → `main`) mergeado no blinksite
- Rewrites ativos: `blinkgroup.com.br/radar`, `/research` e `/sitemap.xml` servindo o blink-press
- Links Radar/Research no Navbar em produção

### ❌ Pendente
1. **Adicionar `ANTHROPIC_API_KEY`** como GitHub Secret (bloqueia o pipeline de IA):
   ```
   gh secret set ANTHROPIC_API_KEY --repo Ln-Carvalho/blink-press
   ```
2. **Smoke test do CMS** — criar/editar conteúdo no Keystatic e confirmar o commit no repo (depende da sessão GitHub do usuário)
3. **Disparar o `radar-pipeline.yml`** manualmente após o secret, para validar a geração de drafts

---

## Arquitetura de rotas (blink-press)

```
app/
├── (site)/              ← layout com nav/footer
│   ├── layout.tsx
│   ├── page.tsx         ← redireciona para /radar
│   ├── radar/
│   │   ├── page.tsx     ← lista de notícias
│   │   └── [slug]/
│   │       ├── page.tsx
│   │       └── opengraph-image.tsx
│   └── research/
│       ├── page.tsx
│       └── [slug]/
│           ├── page.tsx
│           └── opengraph-image.tsx
├── keystatic/           ← CMS (sem nav/footer do site)
├── preview/             ← rascunhos (noindex)
│   ├── radar/[slug]/
│   └── research/[slug]/
├── api/
│   ├── keystatic/       ← handler condicional (503 sem credenciais)
│   └── newsletter/      ← captura via Resend
├── robots.ts
├── sitemap.ts
└── layout.tsx           ← shell mínimo (html/body/fonts)
```

---

## Decisões relevantes tomadas

- **Nome `blink-press`** em vez de `blink-hub` (o nome "blink-hub" já estava em uso internamente como central de tarefas/kanban)
- **Owner `Ln-Carvalho`** em vez de `eidryan` (conta logada no GitHub CLI, mais prático)
- **URL `blink-press-blinkgroup.vercel.app`** (o nome `blink-press.vercel.app` estava tomado no Vercel)
- **Route groups** no Next.js para separar layout do site do layout do Keystatic — necessário porque o Keystatic precisa de tela cheia sem nav/footer
- **Handler condicional** na API do Keystatic — evita falha de build quando as env vars ainda não estão configuradas
