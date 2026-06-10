# Blink Hub — Página Orgânica (Radar + Research)

**Data:** 2026-06-10
**Status:** Design aprovado, aguardando plano de implementação

## Objetivo

Criar o ambiente onde PMEs encontram o que precisam para crescer, com **autoridade e marca** como objetivo nº 1 (referência: página de research da Anthropic). A página posiciona a Blink como referência intelectual no universo de PMEs no Brasil — tráfego SEO e retenção são consequências, não o driver.

## Decisões tomadas

| Decisão | Escolha |
|---|---|
| Objetivo primário | Autoridade e marca (qualidade editorial > volume) |
| Produção de notícias | Pipeline de IA + curadoria humana via Pull Requests |
| Estado dos papers | Programa de pesquisa real (professor orientador + bolsa), pesquisa ainda não iniciada — lança como "manifesto + em breve" |
| Arquitetura | App Next.js novo servido no domínio principal via rewrites (subpath) |
| Estrutura de URLs | `/radar` (notícias) e `/research` (papers) como seções irmãs na raiz |
| Newsletter | Captura de e-mail no MVP via Resend; envio automatizado na Fase 2 |

## Conceito editorial

Uma **publicação** da Blink, não um blog. Estética editorial limpa e tipográfica, herdando a identidade visual da Blink (preto/branco). Diferencial editorial de cada notícia: a análise **"por que isso importa para sua PME"** — nunca apenas repassar a notícia.

Categorias de notícias: Brasil · Mundo · Regulação · Tecnologia · Capital.

## Escopo do MVP

1. **Home do Radar (`/radar`)**
   - Destaque editorial no topo (notícia/análise mais importante)
   - Lista cronológica das últimas notícias com tags de categoria
   - Bloco fixo apresentando o programa de pesquisa (link para `/research`)
   - Formulário de captura de newsletter ("receba o radar da semana")

2. **Notícia individual (`/radar/[slug]`)**
   - URL própria indexável, título, data, categoria
   - Resumo executivo "por que isso importa para sua PME"
   - Fontes citadas; compartilhável (OG tags para LinkedIn/WhatsApp)

3. **Research (`/research`)**
   - Manifesto do programa de pesquisa: linha de pesquisa, professor orientador, vínculo acadêmico (bolsa)
   - Formato das futuras publicações + "primeira publicação em breve"
   - Template de paper reservado (abstract, autores, data, PDF) estilo Anthropic, usado quando a pesquisa publicar (`/research/[slug]`)

4. **Newsletter (captura apenas)**
   - E-mail → audiência no Resend

5. **Pipeline de notícias por IA**
   - Job agendado (GitHub Action cron + API do Claude), 2-3x/semana
   - Monitora fontes relevantes para PMEs, seleciona, escreve rascunho MDX com a análise "por que importa", abre PR
   - Curadoria humana = revisar preview deployment do Vercel, editar se necessário, merge = publicado

6. **SEO técnico**
   - Páginas estáticas (SSG), sitemap, OG images automáticas, JSON-LD (NewsArticle / ScholarlyArticle)

## Fora do escopo do MVP (visão de sonho)

- **Fase 2:** envio automatizado da newsletter semanal (gerada por IA do conteúdo da semana, revisada antes do envio); guias evergreen ("tudo que precisam para crescer"); primeiros papers publicados de verdade.
- **Fase 3:** ferramentas interativas (calculadoras de margem, impostos, valuation); assistente de IA que responde dúvidas de PMEs usando o acervo da Blink como base.
- Comunidade/eventos: descartado por ora.

## Arquitetura técnica

- **Repo novo `blink-hub`:** Next.js (App Router) + Tailwind, projeto separado no Vercel.
- **Integração com o site atual:** `vercel.json` do site institucional ganha rewrites de `/radar/:path*` e `/research/:path*` para o app novo. O app novo serve essas rotas nativamente (sem basePath). Site atual permanece intocado, exceto links "Radar" e "Research" na navbar.
- **Conteúdo:** arquivos MDX no repo.
  - `content/radar/YYYY-MM-DD-slug.mdx` — frontmatter: title, date, category, summary, sources[]
  - `content/research/slug.mdx` — frontmatter extra: authors[], abstract, pdf (opcional)
  - Frontmatter validado com Zod no build — inválido = build falha.
- **Renderização:** SSG via `generateStaticParams`; publicação acontece no deploy (merge na main).
- **Newsletter:** API route → Resend Audiences.

## Operação de conteúdo (fluxo)

```
GitHub Action (cron 2-3x/semana)
  → Claude API: busca fontes, seleciona, escreve MDX
  → abre Pull Request no blink-hub
  → Vercel gera preview deployment
  → humano revisa o preview, edita se quiser
  → merge na main = deploy = publicado
```

## Qualidade e tratamento de erros

- **Gate visual:** preview deployment por PR (a notícia é vista exatamente como ficará no ar antes de publicar).
- **Gate estrutural:** validação Zod do frontmatter no build.
- **Runtime:** páginas 100% estáticas — superfície de erro em produção mínima. 404 customizada para slugs inexistentes.
- **Pipeline:** se o job de IA falhar, nada é publicado (fail-safe — pior caso é ausência de notícia nova, nunca conteúdo quebrado no ar).

## Critérios de sucesso do MVP

- `/radar` e `/research` no ar sob blinkgroup.com.br, indexáveis pelo Google (sitemap aceito no Search Console).
- Pelo menos 5 notícias publicadas via pipeline IA→PR→merge funcionando de ponta a ponta.
- Página Research apresentando o programa de pesquisa com orientador e linha de pesquisa.
- Captura de newsletter funcionando (e-mails chegando na audiência do Resend).
