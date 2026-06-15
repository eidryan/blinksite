# Blinksite — Documentação de Arquitetura e Funcionamento

> **Objetivo deste documento:** servir como gestão de conhecimento do projeto. Ele descreve **o que** o sistema faz, **como** funciona e — mais importante — **por que** cada decisão foi tomada, para que o site nunca seja uma *black box* e para que qualquer pessoa (em especial o tech lead) possa propor melhorias com contexto completo.
>
> **Última atualização:** 14/06/2026 · Branch documentada: `feature/hub-rewrites`

---

## 1. Visão geral

O **blinksite** é o site institucional (landing page) da **Blink** — uma empresa do Rio de Janeiro que entra na operação de pequenos negócios, entende a dor real e constrói ferramentas de software sob medida que depois viram produtos independentes (ex.: *Cadencio*).

É uma **single-page application (SPA) de página única**, com forte ênfase em **storytelling visual e animação de scroll**. Não há roteamento interno de páginas no React: tudo é uma sequência de seções verticais ancoradas (`#sobre`, `#como-atuamos`, etc.). As únicas rotas "externas" (`/radar`, `/research`) **não pertencem a este repositório** — são servidas por outro projeto (`blink-press`) via *rewrites* do Vercel (ver §11).

### Em uma frase
> Uma landing page estática React/Vite com uma camada pesada de animação (GSAP + Lenis + shaders WebGL via Three.js), publicada no Vercel, que delega `/radar` e `/research` para um app Next.js separado.

---

## 2. Stack tecnológica e o porquê de cada escolha

| Camada | Tecnologia | Por que está aqui |
|---|---|---|
| Build / dev server | **Vite 5** | Build instantâneo e HMR rápido. O site é estático (sem SSR), então não há necessidade de Next.js neste repo. |
| UI | **React 18** | Componentização das seções. Usado mais como *organizador de DOM* do que como app reativo — a maior parte da lógica é imperativa (GSAP manipulando o DOM direto). |
| Estilo | **Tailwind CSS 3** + PostCSS/Autoprefixer | Velocidade de prototipagem e consistência. Tokens da marca ficam centralizados em `tailwind.config.js`. |
| Animação de timeline | **GSAP 3 + ScrollTrigger** | Coração do projeto. Controla loader, transições de tema, parallax, scroll horizontal, tilt 3D e o "túnel" de revelação. |
| Scroll suave | **Lenis** (`@studio-freight/lenis`) | Dá o scroll inercial "premium" e — crucialmente — fornece a **velocidade de scroll** que alimenta efeitos reativos. |
| 3D / shaders | **Three.js** | Renderiza os shaders de fundo (Bayer/dithering) e o efeito de hover nas imagens (aberração cromática). |
| Ícones | **lucide-react** | Ícones do menu (hambúrguer, link externo). |
| Utilitário de classe | **clsx + tailwind-merge** (`cn()` em `src/lib/utils.js`) | Mescla classes Tailwind sem conflito. |
| Lint | **ESLint 9** (flat config) | Qualidade de código. |
| Deploy | **Vercel** | Hospedagem estática + rewrites para o `blink-press`. |

> ⚠️ **Observação de dívida técnica:** `package.json` lista `puppeteer` em devDependencies e o `name` do pacote é `"blink-temp"`. Ambos são resquícios — o nome deveria ser `blinksite` e o puppeteer (usado nos scripts de debug `debug.js`/`debug.mjs`) provavelmente não precisa ir para produção. Ver §13.

---

## 3. Arquitetura de alto nível

```
                          Navegador do visitante
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │      Vercel (blinkgroup)      │
                    │   blinkgroup.com.br / domínio │
                    └──────────────────────────────┘
                       │                        │
        rota normal    │                        │  /radar, /research,
        (/, #âncoras)   ▼                        │  /_next/*, /api/newsletter,
              ┌───────────────────┐              │  /sitemap.xml  → REWRITE
              │  blinksite (este  │              ▼
              │  repo) — SPA      │     ┌──────────────────────────┐
              │  estática Vite    │     │  blink-press (outro repo) │
              │                   │     │  Next.js 16 + Keystatic   │
              │  dist/ servido    │     │  blink-press-blinkgroup   │
              │  como assets      │     │  .vercel.app              │
              └───────────────────┘     └──────────────────────────┘
```

**Decisão-chave:** o site institucional (marketing, animação pesada) e a plataforma de conteúdo (`/radar`, `/research`, CMS, newsletter) são **dois projetos separados** unidos só na borda (rewrites). Isso mantém o blinksite leve e estático, sem arrastar a complexidade do Next.js/CMS para cá. Ver `docs/blink-press-deploy-status.md` para o lado do conteúdo.

---

## 4. Estrutura de pastas

```
blinksite/
├── index.html                  # HTML raiz; monta #root e carrega /src/main.jsx
├── vite.config.js              # Config mínima (apenas plugin React)
├── vercel.json                 # Rewrites + headers de segurança/cache (CRÍTICO)
├── tailwind.config.js          # Tokens da marca (cores, fontes)
├── postcss.config.js           # Tailwind + autoprefixer
├── eslint.config.js            # Flat config do ESLint
├── package.json                # Deps e scripts (name: "blink-temp" — renomear)
│
├── public/                     # Assets servidos como estão (favicon, vite.svg)
├── idBLINK/                    # Brand kit bruto (logos, slide guide PDF/PPTX) — NÃO usado no build
├── docs/                       # Esta documentação + status do blink-press
│
├── src/
│   ├── main.jsx                # Entry point: React root + ErrorBoundary
│   ├── App.jsx                 # Orquestrador central (Lenis, GSAP, sequência de seções)
│   ├── index.css               # Fontes (Google), tokens CSS, utilities (.brand-gradient*)
│   ├── App.css                 # (legado do template Vite — pouco/zero uso)
│   ├── lib/utils.js            # cn() — merge de classes Tailwind
│   │
│   ├── assets/
│   │   ├── brand/              # Logos Blink (.png) importados pelos componentes
│   │   └── founders/           # Fotos dos fundadores
│   │
│   └── components/
│       ├── Navbar.jsx           # Nav fixa, scrollspy, menu mobile, CTA WhatsApp
│       ├── Hero.jsx             # Primeira dobra; shader Bayer de fundo
│       ├── Sobre.jsx            # Seção 01
│       ├── ComoAtuamos.jsx      # Seção 02 — scroll horizontal (desktop)
│       ├── Portfolio.jsx        # Seção 03 — card Cadencio + tilt 3D
│       ├── Fundadores.jsx       # Seção 04 — grid de sócios + tilt 3D
│       ├── Footer.jsx           # Seção 05 — contato
│       ├── ScrollRevealSection.jsx  # O "túnel" de revelação (clip-path + shader)
│       │
│       ├── BrandCursor.jsx          # Cursor customizado (desktop)
│       ├── ScrollVelocityReactor.jsx# Reage à velocidade do scroll (skew/stretch/blur)
│       │
│       ├── ui/                       # Primitivos de shader/efeito
│       │   ├── bayer-shader.jsx       # Shader de fundo do Hero
│       │   ├── dithering-shader.jsx   # Shader de fundo do ComoAtuamos
│       │   ├── DitherReveal.jsx       # Shader do túnel (anel que abre)
│       │   ├── VapourTextEffect.jsx   # ⚠️ NÃO IMPORTADO (código morto)
│       │   ├── simplex.jsx            # ⚠️ NÃO IMPORTADO (código morto)
│       │   └── demo.jsx               # ⚠️ NÃO IMPORTADO (código morto)
│       │
│       └── webgl/
│           └── ImageHoverEffect.jsx   # Aberração cromática nas fotos no hover
│
├── debug.js / debug.mjs        # Scripts puppeteer de screenshot (ferramenta de dev)
├── local_debug*.png            # Screenshots de debug (artefatos — podem sair do repo)
└── build-err.txt               # Log de erro de build antigo (artefato)
```

---

## 5. Ciclo de vida / boot da aplicação

1. **`index.html`** define `<div id="root">` e carrega `/src/main.jsx` como módulo ES.
2. **`src/main.jsx`** cria a raiz React dentro de:
   - `<React.StrictMode>` — checagens de dev.
   - `<ErrorBoundary>` — **componente caseiro** que, se qualquer render lançar erro, mostra a stack trace em tela cheia laranja/preta com a instrução "Paste this in chat". *Por quê:* facilita debug em produção/preview sem abrir o console — o usuário copia o erro direto. É uma escolha pragmática de um time pequeno.
3. **`src/App.jsx`** monta tudo e, num único `useEffect`, inicializa o motor de scroll e todas as animações globais (ver §6).

---

## 6. O motor de scroll (o coração do site)

Tudo em `App.jsx`, dentro de um `useEffect([])` que roda uma vez. Esta é a parte mais importante para entender o projeto.

### 6.1 Lenis (scroll suave + telemetria de velocidade)
```js
const lenis = new Lenis({ duration: 1.2, smoothWheel: true, smoothTouch: false, ... });
lenis.on('scroll', ScrollTrigger.update);
lenis.on('scroll', ({ velocity }) => {
  document.documentElement.style.setProperty('--scroll-velocity', Math.abs(velocity).toFixed(2));
  document.body.dataset.scrollVelocity = Math.abs(velocity).toFixed(2);
});
gsap.ticker.add((time) => lenis.raf(time * 1000));
```
- **Por quê Lenis + GSAP juntos:** o GSAP precisa saber quando a página rolou para atualizar os `ScrollTrigger`. Por isso `lenis.on('scroll', ScrollTrigger.update)` e o `gsap.ticker` dirige o loop do Lenis (uma única fonte de RAF, evitando dois loops concorrentes).
- **Telemetria:** a velocidade de scroll é escrita em `--scroll-velocity` (CSS) e `body.dataset.scrollVelocity`. Isso é o canal que alimenta o `ScrollVelocityReactor` (§8.3). *Padrão importante:* comunicação entre componentes desacoplados via **estado no DOM**, não via props/contexto React.
- `smoothTouch: false` → no mobile o scroll é nativo (suavização inercial em touch costuma atrapalhar e custar bateria).

### 6.2 Sequência de loading
- Mostra um overlay full-screen com o logo Blink que escala, sobe e some (timeline GSAP).
- **Dois mecanismos de segurança** para nunca travar a tela:
  1. `setTimeout(finishLoading, 2500)` — revela o conteúdo após 2,5s mesmo se o GSAP falhar.
  2. `window 'load'` listener — revela quando os assets terminam.
  - `loadingDoneRef` garante que `finishLoading` rode só uma vez (idempotência).
- Ao terminar, dispara `window.dispatchEvent(new CustomEvent('loaderComplete'))`. **O Hero escuta esse evento** para começar sua animação de entrada (§7.1). *Por quê eventos custom:* desacopla o loader (App) do Hero sem prop drilling.

### 6.3 Transição de tema claro/escuro por seção
```js
const sections = gsap.utils.toArray('section[data-theme], footer[data-theme]');
sections.forEach((section) => {
  const targetBg = section.getAttribute('data-theme') === 'dark' ? '#212121' : '#FDFAF4';
  ScrollTrigger.create({ trigger: section, start: 'top 50%', end: 'bottom 50%',
    onEnter:     () => gsap.to(document.body, { backgroundColor: targetBg, duration: 0.5 }),
    onEnterBack: () => gsap.to(document.body, { backgroundColor: targetBg, duration: 0.5 }),
  });
});
```
- **Contrato de design:** cada `<section>`/`<footer>` declara `data-theme="dark|light"`. O fundo do `<body>` transiciona suavemente quando aquela seção cruza o meio da viewport.
- **Por quê o `<body>` e não cada seção:** garante que não haja "emendas" de cor entre seções e que o fundo apareça atrás de elementos com transparência.
- **Para adicionar uma seção nova:** basta dar a ela `id` + `data-theme` e ela entra automaticamente nesse sistema (e no scrollspy do Navbar — §7.0).

### 6.4 Parallax via `data-speed`
Qualquer elemento com `[data-speed]` ganha deslocamento vertical proporcional ao scroll (`speed < 1` = mais lento). Sistema declarativo: marque o HTML, o JS cuida. *(Hoje há poucos/nenhum uso ativo — é infraestrutura pronta para uso futuro.)*

### 6.5 Divisores origami (`.brand-gradient-divider`)
Linhas gradiente que começam "dobradas" (`rotateY(90deg) scaleX(0)` no CSS) e se desdobram via GSAP quando entram na tela. Usadas no topo de Portfolio, Fundadores e Footer. *Metáfora de marca:* origami / "piscar de olhos".

### 6.6 Cleanup
O `return` do `useEffect` destrói o Lenis, mata todos os `ScrollTrigger` e remove listeners. **Essencial** porque o StrictMode do React monta/desmonta em dev — sem cleanup, haveria triggers e loops RAF duplicados.

---

## 7. As seções (ordem de render em `App.jsx`)

```
<Navbar />
<main>
  <ScrollRevealSection hero={<Hero />}>
     <Sobre />            ← revelado pelo "túnel"
  </ScrollRevealSection>
  <ComoAtuamos />
  <Portfolio />
  <Fundadores />
  <Footer />
</main>
```

### 7.0 Navbar (`Navbar.jsx`)
- **Fixa, formato pílula, centralizada.** Tem dois estados visuais:
  - *Topo* (sobre o Hero escuro): transparente, logo branco.
  - *Scrolled* (`scrollY > 90vh`): fundo creme translúcido + blur, logo preto.
- **Scrollspy** via `IntersectionObserver` com `rootMargin: '-30% 0px -70% 0px'` (considera "ativa" a seção que está no terço central da tela) — destaca o link atual em laranja com sublinhado animado.
- **Menu mobile:** overlay full-screen (`lg:hidden`).
- **CTA "Fale Conosco":** link WhatsApp com efeito de gradiente que **segue o mouse** (`--gradient-angle` recalculado no `onMouseMove`).
- **Links Radar/Research** apontam para `/radar` e `/research` (rotas do `blink-press`, ver §11). Os demais são âncoras `#`.

### 7.1 Hero (`Hero.jsx`)
- Primeira dobra escura (`data-theme="dark"`), título *"Decida em um piscar de olhos."*.
- Fundo: **`BayerShader`** (Three.js) com pixels laranja em formato círculo (§9.1).
- **Entrada animada:** espera o evento `loaderComplete` (§6.2) e então faz fade/blur-in do título, subtítulo e CTA.
- **Saída no scroll:** um `ScrollTrigger` próprio aplica blur + fade + deslocamento no título conforme o usuário começa a rolar (efeito de "dissolver" antes do túnel abrir).

### 7.2 ScrollRevealSection — o "túnel" de revelação ⭐
Componente mais sofisticado do projeto. Cria o efeito de a página seguinte (Sobre) **abrir como um anel/círculo crescente** por cima do Hero.

Arquitetura em **3 camadas** sobrepostas:
- **Camada 0** (`z-0`): o Hero, posicionado absoluto no topo.
- **Camada 1** (`z-10`): o conteúdo (Sobre) com `bg-cream`, começando totalmente "recortado" (invisível) por `clip-path: circle(0)`.
- **Camada 2** (`z-20`): o **`DitherReveal`** (shader WebGL) que desenha o anel ditherizado abrindo.

A seção é **fixada (`pin`)** por 150% da viewport. Durante o pin, uma timeline GSAP avança um progresso `p` de 0→1 e a cada frame:
1. Sincroniza o shader: `shaderRef.current.progress = p`.
2. Sincroniza o `clip-path` do conteúdo com a **mesma fórmula matemática** do shader: `innerRadius = p * 1.6 - 0.25`. **Por quê:** o buraco visual do shader e o recorte real do conteúdo precisam coincidir pixel a pixel, senão a "borda" do túnel não bate.
3. Em `p > 0.45`, dispara `ditherRevealComplete` → o Sobre escuta e roda sua animação de texto (e `ditherRevealReset` ao voltar). *Por quê 0.45:* faz o texto aparecer enquanto o círculo ainda está abrindo, não depois — sensação mais fluida.
4. Aplica um **zoom** (`scale 0.6 → 1.0`) **somente no primeiro filho** do conteúdo. Comentário no código explica o porquê: escalar o wrapper inteiro (6000px) puxaria seções de baixo para dentro da viewport.

> 💡 **Nota para o tech lead:** este componente acopla três coisas (CSS clip-path, shader WebGL e eventos custom) por uma fórmula mágica (`p*1.6-0.25`). Qualquer mudança no shader exige reajustar essa constante. É um candidato natural a documentação inline mais forte ou a um teste visual de regressão.

### 7.3 Sobre (`Sobre.jsx`) — Seção 01
- Layout em 2 colunas (título à esquerda, texto à direita).
- Animação **disparada por evento** (`ditherRevealComplete`), não por ScrollTrigger próprio — porque a seção está fixada dentro do túnel e o gatilho de scroll normal não funcionaria de forma confiável. A timeline fica `paused` e dá `play()`/`reverse()` conforme os eventos do túnel.
- Título revelado palavra a palavra via `clip-path: inset(...)` com stagger.

### 7.4 ComoAtuamos (`ComoAtuamos.jsx`) — Seção 02
- Conteúdo: 3 cards explicando o método ("Primeiro a operação → lado a lado → o nicho inteiro").
- **Desktop (`≥1024px`): scroll horizontal pinado.** A seção é fixada e os cards deslizam na horizontal conforme o scroll vertical (`scrub`). O card central fica em destaque (escala 1, opacidade 1) e os demais recuam (0.92 / 0.4). Há uma linha-gradiente que se desenha (`scaleX 0→1`) conectando os cards.
- **Mobile (`<1024px`): pilha vertical** com fade-in escalonado simples.
- *Por quê a bifurcação:* scroll horizontal pinado em telas pequenas é desorientador e quebra o scroll nativo; o código checa `window.innerWidth` e escolhe a estratégia.
- Fundo: `DitheringShader` em opacidade 5% (textura sutil).

### 7.5 Portfolio (`Portfolio.jsx`) — Seção 03
- Destaca o produto **Cadencio** (card escuro com selo "ATIVO" pulsante e link `cadencio.app`).
- **Tilt 3D no hover:** `onMouseMove` calcula a posição relativa do cursor e rotaciona o card em até ±3° (`rotateX/rotateY`) com perspectiva; `onMouseLeave` volta com easing elástico.
- 2 "ghost cards" tracejados ("Em desenvolvimento") sinalizam o pipeline de produtos.

### 7.6 Fundadores (`Fundadores.jsx`) — Seção 04
- Grid de 3 sócios (Luan, Adrian, Gustavo) com foto, cargo e bio — dados num array no topo do arquivo (fácil de editar).
- Mesmo **tilt 3D** do Portfolio, por card.
- As fotos têm `data-cursor="image"` e `data-canvas="image"` → são alvo do `ImageHoverEffect` (aberração cromática, §8.2) e do `ScrollVelocityReactor` (skew, §8.3).
- Fecha com citação do livro *Blink* (Malcolm Gladwell) — origem do nome da empresa.

### 7.7 Footer (`Footer.jsx`) — Seção 05 (`#contato`)
- Cantos superiores arredondados (`borderRadius: '3rem 3rem 0 0'`) com divisor gradiente.
- CTAs de contato: WhatsApp (número `5521990230538`), e-mail `contato@blinkgroup.com.br`, LinkedIn.
- Ano do copyright dinâmico (`new Date().getFullYear()`).

---

## 8. Camada de efeitos "premium" (componentes globais)

Renderizados em `App.jsx` fora do `<main>`. **Todos retornam `null`** — são componentes puramente de efeito colateral (manipulam o DOM via `useEffect`), não renderizam markup. Padrão deliberado para separar "comportamento" de "conteúdo".

### 8.1 BrandCursor (`BrandCursor.jsx`)
- Substitui o cursor nativo (desktop ≥1024px e ponteiro fino) por um **anel + ponto gradiente** que seguem o mouse com `lerp` (suavização) em um loop RAF próprio.
- Muda de forma/rótulo conforme o elemento sob o cursor (delegação de evento lendo `data-cursor` ou a tag): `link → "Ver"`, `action → "Abrir"`, `image → "Arrastar"`.
- `mix-blend-mode: difference` para contraste automático em qualquer fundo.
- **Desativado em touch/mobile** (mantém cursor nativo).

### 8.2 ImageHoverEffect (`webgl/ImageHoverEffect.jsx`)
- Para cada `img[data-cursor="image"]` (as fotos dos fundadores), cria um **canvas Three.js** por cima e esconde a `<img>` original (mantida no DOM para preservar o layout).
- Shader aplica **aberração cromática + onda + brilho** no hover (GSAP interpola os *uniforms*).
- **Otimização importante:** o loop de render só roda durante o hover; fora disso, desenha **um único frame** (`renderOnce`) quando a imagem entra na viewport (`IntersectionObserver`). Isso evita GPU rodando à toa.
- O fix `renderOnce()` (commit `6236fdf`) resolveu fotos que não apareciam até receber hover.
- Desativado em `<1024px` (sem WebGL no mobile).

### 8.3 ScrollVelocityReactor (`ScrollVelocityReactor.jsx`)
- Lê `body.dataset.scrollVelocity` (escrito pelo Lenis, §6.1) a cada frame e aplica reações sutis:
  - **A.** Imagens (`.image-canvas-wrapper`) ganham `skewY` proporcional (máx ±4°).
  - **B.** Títulos `h2` ganham `scaleY` (máx 1.05) — "esticam" no scroll rápido.
  - **D.** Navbar tem o `backdrop-blur` intensificado (16px→28px) no scroll rápido.
- Consulta os elementos **uma vez** no início (evita *layout thrashing*).

> *Por quê toda essa camada:* a Blink se posiciona como "obsessão por detalhes" (frase no footer). Esses microefeitos são a tradução visual desse posicionamento. São também a maior fonte de **complexidade e custo de performance** — ver §14.

---

## 9. Shaders WebGL (primitivos em `components/ui/`)

### 9.1 BayerShader (`bayer-shader.jsx`)
Fundo do Hero. Three.js desenhando um padrão de **dithering Bayer** (pontos/círculos laranja) animado. Props: `shape`, `pixelSize`, `color`.

### 9.2 DitheringShader (`dithering-shader.jsx`)
Fundo do ComoAtuamos (opacidade 5%). Variantes de dithering (`2x2`, `4x4`, `8x8`, ruído) com formas animadas (`ripple` etc.). Props: `shape`, `type`, `colorBack`, `colorFront`, `pxSize`, `speed`.

### 9.3 DitherReveal (`DitherReveal.jsx`)
O shader do **túnel** (§7.2). Expõe `progress` via `useImperativeHandle` (`forwardRef`), permitindo que o `ScrollRevealSection` empurre o progresso do scroll direto no shader. Desenha um anel ditherizado cujo raio interno cresce com `progress`.

**Todos os três** usam GLSL com matrizes de Bayer (2x2/4x4/8x8) para o efeito retrô-pixelado característico da marca.

---

## 10. Sistema de design

### 10.1 Cores (`tailwind.config.js` + `index.css`)
| Token | Hex | Uso |
|---|---|---|
| `cream` | `#FDFAF4` | Fundo claro, texto sobre escuro |
| `dark` | `#212121` | Fundo escuro, texto sobre claro |
| `orange` | `#FF6A00` | Cor primária da marca / destaques |
| `gold` | `#FFA52E` | Início do gradiente |
| `red` | `#F21A1A` | Fim do gradiente |
| `dark-red` | `#C81010` | Sombra do gradiente |
| `mid-orange` | `#FF8A1C` | Tons intermediários |

As mesmas cores existem como **variáveis CSS** (`:root`) em `index.css` — porque os efeitos imperativos (BrandCursor, gradientes dinâmicos) precisam delas fora do Tailwind.

### 10.2 Tipografia
- **Display:** MuseoModerno (títulos)
- **Body:** Plus Jakarta Sans (texto)
- **Mono:** IBM Plex Mono (kickers/labels uppercase)
- Carregadas via Google Fonts no topo de `index.css`.

### 10.3 Utilities de marca (em `index.css @layer utilities`)
- **`.brand-gradient`** — o gradiente laranja→vermelho. Usa `--gradient-angle` (custom property) para que o JS gire o ângulo conforme o mouse (CTAs).
- **`.brand-gradient-text`** — o mesmo gradiente recortado no texto.
- **`.brand-gradient-divider`** — linha gradiente que começa "dobrada" (origami) e o GSAP desdobra.
- **`.glass-panel`** — vidro fosco (blur + borda translúcida).

---

## 11. Integração com o blink-press (rewrites Vercel)

`vercel.json` redireciona (server-side, sem mudar a URL no browser) algumas rotas para o app de conteúdo:

```jsonc
"rewrites": [
  { "source": "/radar",            "destination": ".../radar" },
  { "source": "/radar/:path*",     "destination": ".../radar/:path*" },
  { "source": "/research",         "destination": ".../research" },
  { "source": "/research/:path*",  "destination": ".../research/:path*" },
  { "source": "/_next/:path*",     "destination": ".../_next/:path*" },   // ⚠️ assets do Next
  { "source": "/api/newsletter",   "destination": ".../api/newsletter" },
  { "source": "/sitemap.xml",      "destination": ".../sitemap.xml" }
]
// destino = https://blink-press-blinkgroup.vercel.app
```

**Por que cada linha existe:**
- `/radar*` e `/research*` — as páginas de conteúdo.
- `/_next/:path*` — **crítico.** Sem isso, o CSS/JS das páginas Next.js dá 404 e elas carregam quebradas (foi um bug real corrigido — ver memória e commit `3b7c8d6`). Cuidado: este rewrite captura *todo* `/_next/*` do domínio; como o blinksite é Vite (usa `/assets/`, não `/_next/`), não há colisão hoje.
- `/api/newsletter` — o formulário de captação (Resend) vive no blink-press.
- `/sitemap.xml` — SEO unificado a partir do app de conteúdo.

> ⚠️ **Ponto de atenção (do histórico):** houve mismatch de domínio entre o alias canônico do Vercel (`blink-press-virid.vercel.app`) e o usado nos rewrites (`blink-press-blinkgroup.vercel.app`), causando erro de OAuth do Keystatic. Ao trocar de alias/domínio, **atualize os rewrites e os callbacks do GitHub App juntos.** Ver `docs/blink-press-deploy-status.md`.

---

## 12. Deploy e configuração

### `vercel.json`
- `cleanUrls: true`, `trailingSlash: false` — URLs limpas.
- **Headers de segurança** em todas as rotas: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`. *(Não há `Content-Security-Policy` — oportunidade de melhoria, §14.)*
- **Cache** agressivo e imutável em `/assets/*` (1 ano) — seguro porque o Vite faz hash dos nomes de arquivo.

### Build
- `npm run dev` → Vite dev server (HMR).
- `npm run build` → gera `dist/` (estático).
- `npm run preview` → serve o build localmente.
- `npm run lint` → ESLint.
- Node fixado em `20.x` (`engines`).

---

## 13. Código morto e artefatos (limpeza recomendada)

Identificado durante a análise — **nada disto entra na árvore de render viva**:

| Item | Situação | Recomendação |
|---|---|---|
| `src/components/OrigamiStar.jsx` | Não importado (App usa SVG origami inline) | Remover ou reaproveitar |
| `src/components/ui/VapourTextEffect.jsx` (739 linhas!) | Não importado | Remover se não for usar |
| `src/components/ui/simplex.jsx` | Não importado | Remover |
| `src/components/ui/demo.jsx` | Só importa o DitheringShader p/ demo | Remover |
| `src/App.css` | Resquício do template Vite | Verificar e remover |
| `debug.js`, `debug.mjs`, `local_debug*.png`, `build-err.txt` | Ferramentas/artefatos de debug | Mover p/ `scripts/` ou ignorar no git |
| `package.json` → `"name": "blink-temp"` | Nome temporário | Renomear p/ `blinksite` |
| `puppeteer` em devDeps | Usado só pelos scripts de debug | Avaliar se precisa ficar |
| `idBLINK/` (brand kit bruto) | Não usado no build | Manter como referência ou mover p/ Drive |

Remover ~1000+ linhas de código morto reduz a superfície cognitiva sem nenhum risco funcional.

---

## 14. Oportunidades de melhoria (para o tech lead)

Priorizadas por impacto/esforço:

### Performance
1. **`prefers-reduced-motion`** — hoje não há respeito a essa media query. Usuários com sensibilidade a movimento (e Core Web Vitals) se beneficiariam de uma versão reduzida. *Alto impacto, baixo esforço.*
2. **Múltiplos loops RAF concorrentes** — BrandCursor, ScrollVelocityReactor, ImageHoverEffect e o ticker do GSAP rodam em paralelo. Consolidar num único loop reduziria custo em máquinas fracas.
3. **Lazy-load dos shaders / Three.js** — o `three` é pesado no bundle e só é necessário no desktop. `import()` dinâmico condicionado a `innerWidth ≥ 1024` cortaria o JS inicial no mobile.
4. **`ScrollVelocityReactor` escreve estilos inline a cada frame** — mesmo parado (velocidade 0). Vale curto-circuitar quando `v` ~ 0.

### Qualidade / manutenção
5. **Remover código morto** (§13).
6. **Tipos** — migrar para TypeScript (ou ao menos JSDoc) ajudaria, dado o uso intenso de refs e DOM imperativo.
7. **Acoplamento por "fórmula mágica"** no `ScrollRevealSection` (`p*1.6-0.25`) — extrair para uma constante nomeada e documentada, compartilhada entre shader e clip-path.
8. **Comunicação por eventos/DOM global** (`loaderComplete`, `ditherRevealComplete`, `body.dataset.scrollVelocity`) é elegante mas invisível. Um pequeno mapa "quem emite / quem escuta" (ou centralizar num módulo) reduz o risco de quebra silenciosa.

### Robustez / SEO
9. **SEO/meta tags** — `index.html` tem só `<title>Blink</title>`. Faltam `description`, Open Graph, Twitter cards, favicon variants. *Alto impacto p/ um site institucional.*
10. **Acessibilidade** — revisar foco de teclado no menu mobile, `aria-*` nos toggles, contraste em estados de hover, e o cursor customizado não deve prejudicar navegação por teclado.
11. **CSP header** — adicionar `Content-Security-Policy` ao `vercel.json` fecha a lacuna deixada pelos outros headers de segurança.

### Conteúdo
12. **Dados hard-coded** (fundadores, cards de método, portfólio) vivem em arrays nos componentes. Se a frequência de edição crescer, considerar um JSON central ou — coerente com o ecossistema — o Keystatic do blink-press.

---

## 15. Como rodar localmente

```bash
# pré-requisito: Node 20.x
npm install
npm run dev        # http://localhost:5173 (Vite)

npm run build      # gera dist/
npm run preview    # serve o build
npm run lint       # ESLint
```

Para inspeção visual automatizada existem `debug.js`/`debug.mjs` (puppeteer) que tiram screenshots — úteis para validar mudanças de animação sem abrir o navegador manualmente.

---

## 16. Glossário rápido de "contratos" do projeto

Convenções implícitas que o código assume. **Respeite-as ao editar:**

| Contrato | Significado |
|---|---|
| `data-theme="dark\|light"` numa `<section>`/`<footer>` | Entra na transição automática de fundo do body (§6.3) |
| `id="..."` numa seção | Entra no scrollspy do Navbar e nas âncoras `#` |
| `data-speed="0.x"` | Ativa parallax naquele elemento (§6.4) |
| `data-cursor="link\|action\|image"` | Define a forma/rótulo do BrandCursor (§8.1) |
| `data-cursor="image"` numa `<img>` | Ativa o shader de aberração cromática (§8.2) |
| `data-canvas="image"` / `.image-canvas-wrapper` | Ativa skew por velocidade de scroll (§8.3) |
| `.brand-gradient-divider` | Divisor que o GSAP desdobra ao entrar na tela (§6.5) |
| Evento `loaderComplete` | Loader terminou → Hero pode animar (§6.2) |
| Eventos `ditherRevealComplete` / `ditherRevealReset` | Túnel passou de 45% → Sobre anima (§7.2/7.3) |
| `body.dataset.scrollVelocity` | Velocidade atual do scroll (Lenis → reatores) (§6.1) |

---

*Documento gerado para gestão de conhecimento do blinksite. Mantenha-o atualizado ao alterar a arquitetura — especialmente o motor de scroll (§6), o túnel (§7.2) e os rewrites (§11).*
