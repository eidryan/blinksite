# Blink Hub — Página Orgânica (Radar + Research)

**Data:** 2026-06-10
**Status:** Design aprovado, aguardando plano de implementação

## Objetivo

Criar o ambiente onde PMEs encontram o que precisam para crescer, com **autoridade e marca** como objetivo nº 1 (referência: página de research da Anthropic). A página posiciona a Blink como referência intelectual no universo de PMEs no Brasil — tráfego SEO e retenção são consequências, não o driver.

## Decisões tomadas

| Decisão | Escolha |
|---|---|
| Objetivo primário | Autoridade e marca (qualidade editorial > volume) |
| Produção de notícias | Pipeline de IA + curadoria humana via fila de drafts no ambiente editorial |
| Ambiente editorial | Keystatic embutido em `/admin` no próprio hub (git-based, custo zero, login GitHub) |
| Estado dos papers | Programa de pesquisa real (professor orientador + bolsa); pesquisa formal ainda não iniciada, mas o Research **lança com a publicação nº 1**: artigo sobre o roteirizador CVRP gratuito |
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
   - **Publicação nº 1 no lançamento** (`/research/roteirizador-cvrp`): artigo estilo Anthropic sobre o roteirizador CVRP — o problema (PMEs perdem margem com rotas mal planejadas), a ciência (CVRP/otimização combinatória), a solução com stack 100% gratuita (VRPSolverEasy + OSRM + Nominatim), e CTA para usar a ferramenta gratuita (roteirizador.streamlit.app)
   - Template de paper (abstract, autores, data, PDF opcional) usado pela publicação nº 1 e pelas futuras (`/research/[slug]`)
   - **Pré-requisito de lançamento:** corrigir o timeout de geocoding do roteirizador em produção (Nominatim 1s falhando no Streamlit Cloud) e aplicar identidade Blink no app — o artigo vai direcionar tráfego para a ferramenta, que precisa funcionar e ter a marca

4. **Newsletter (captura apenas)**
   - E-mail → audiência no Resend

5. **Pipeline de notícias por IA**
   - Job agendado (GitHub Action cron + API do Claude), 2-3x/semana
   - Monitora fontes relevantes para PMEs, seleciona, escreve rascunho MDX com a análise "por que importa"
   - Commita o rascunho direto na main com `status: draft` — invisível no site público
   - Curadoria humana = fila de drafts no `/admin` (ver item 7)

6. **Ambiente editorial — `/admin` (Keystatic)**
   - Rota `/admin` no próprio hub; modo local em dev, modo GitHub em produção (login GitHub, salvar = commit)
   - Coleções `noticias` (`content/radar/`) e `papers` (`content/research/`) com formulários gerados do schema, incluindo campo `status: draft | published` — o site só renderiza `published`
   - Fluxo de curadoria: abrir `/admin` → fila de drafts → editar no editor visual → mudar status para `published` → salvar (commit) → deploy publica
   - Botão "novo" para escrever notícia ou paper do zero no mesmo editor
   - Rota de preview de drafts (noindex) para ver o rascunho renderizado antes de publicar
   - Espaço reservado para `/admin/newsletter` (composer entra na Fase 2)

7. **SEO técnico**
   - Páginas estáticas (SSG), sitemap, OG images automáticas, JSON-LD (NewsArticle / ScholarlyArticle)

## Fora do escopo do MVP (visão de sonho)

- **Fase 2:** envio automatizado da newsletter semanal — composer em `/admin/newsletter` (IA monta o rascunho da edição a partir do publicado na semana, revisão humana, disparo via Resend); guias evergreen ("tudo que precisam para crescer"); primeiros papers publicados de verdade.
- **Fase 3:** ferramentas interativas (calculadoras de margem, impostos, valuation); assistente de IA que responde dúvidas de PMEs usando o acervo da Blink como base.
- Comunidade/eventos: descartado por ora.

## Arquitetura técnica

- **Repo novo `blink-hub`:** Next.js (App Router) + Tailwind, projeto separado no Vercel.
- **Integração com o site atual:** `vercel.json` do site institucional ganha rewrites de `/radar/:path*` e `/research/:path*` para o app novo. O app novo serve essas rotas nativamente (sem basePath). Site atual permanece intocado, exceto links "Radar" e "Research" na navbar.
- **Conteúdo:** arquivos MDX no repo.
  - `content/radar/YYYY-MM-DD-slug.mdx` — frontmatter: title, date, category, summary, sources[], status (draft|published)
  - `content/research/slug.mdx` — frontmatter extra: authors[], abstract, pdf (opcional)
  - Frontmatter validado com Zod no build — inválido = build falha.
- **Edição:** Keystatic embutido em `/admin` (modo local em dev, modo GitHub em produção) editando esses mesmos arquivos.
- **Renderização:** SSG via `generateStaticParams`, apenas `status: published`; publicação acontece no deploy (commit na main, vindo do `/admin` ou do pipeline).
- **Newsletter:** API route → Resend Audiences.

## Operação de conteúdo (fluxo)

```
GitHub Action (cron 2-3x/semana)
  → Claude API: busca fontes, seleciona, escreve MDX
  → commita na main com status: draft (invisível no site)
  → humano abre /admin (Keystatic): fila de drafts
  → edita no editor visual, confere na rota de preview
  → muda status para published e salva (= commit)
  → deploy = publicado
```

Escrever do zero (notícia ou paper) usa o mesmo `/admin`, nascendo como draft ou direto como published.

## Qualidade e tratamento de erros

- **Gate visual:** rota de preview de drafts (a notícia é vista renderizada exatamente como ficará no ar antes de publicar).
- **Gate estrutural:** validação Zod do frontmatter no build — segunda linha de defesa atrás dos formulários do Keystatic; se algo escapar malformado (do editor ou do pipeline), o deploy falha antes de chegar ao ar.
- **Runtime:** páginas 100% estáticas — superfície de erro em produção mínima. 404 customizada para slugs inexistentes.
- **Pipeline:** se o job de IA falhar, nada é publicado (fail-safe — pior caso é ausência de notícia nova, nunca conteúdo quebrado no ar).

## Critérios de sucesso do MVP

- `/radar` e `/research` no ar sob blinkgroup.com.br, indexáveis pelo Google (sitemap aceito no Search Console).
- Pelo menos 5 notícias publicadas via pipeline IA→draft→`/admin`→publish funcionando de ponta a ponta.
- Ambiente editorial `/admin` operacional: editar um draft da IA e publicá-lo com um clique; criar uma notícia do zero pelo editor.
- Página Research apresentando o programa de pesquisa com orientador e linha de pesquisa.
- Publicação nº 1 (roteirizador CVRP) no ar, com a ferramenta funcionando em produção (geocoding corrigido) e com identidade Blink aplicada.
- Captura de newsletter funcionando (e-mails chegando na audiência do Resend).
