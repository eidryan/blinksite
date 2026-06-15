# Blinksite

Site institucional (landing page) da **Blink** — empresa que entra na operação de pequenos negócios, entende a dor real e constrói ferramentas de software sob medida que viram produtos independentes (ex.: *Cadencio*).

SPA estática em **React + Vite** com forte camada de animação de scroll (**GSAP + Lenis**) e efeitos **WebGL (Three.js)**. Publicada no **Vercel**, que delega `/radar` e `/research` para o app de conteúdo `blink-press` via rewrites.

## Documentação

- **[`docs/ARQUITETURA.md`](docs/ARQUITETURA.md)** — arquitetura, funcionamento e o porquê de cada decisão. **Comece por aqui.**
- **[`docs/blink-press-deploy-status.md`](docs/blink-press-deploy-status.md)** — status e contexto do app de conteúdo (`/radar`, `/research`, CMS, newsletter).

## Rodar localmente

```bash
# Node 20.x
npm install
npm run dev        # http://localhost:5173
npm run build      # gera dist/
npm run preview    # serve o build
npm run lint       # ESLint
```

## Stack

React 18 · Vite 5 · Tailwind CSS 3 · GSAP 3 (ScrollTrigger) · Lenis · Three.js · Vercel
