# Blink Dashboard

Multi-project dashboard system with support for financial analysis dashboards and campaign management dashboards.

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start dev server (runs on http://localhost:3000)
npm run dev

# View dashboard
# - Main: http://localhost:3000
# - Condominio: http://localhost:3000/condominio
# - Token access: http://localhost:3000/p/santos-moreira-2026
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## Project Types

### 1. Condominio Dashboard (`type: "condominio"`)

Financial analysis dashboard for residential condominiums with:
- **Visão Geral**: KPI overview with monthly status indicator
- **Fluxo de Caixa**: Cash flow evolution, waterfall, and historical comparison
- **Despesas**: Category breakdown, supplier analysis, outlier detection, temporal heatmap
- **Manutenção & Reserva**: Maintenance timeline, risk assessment, reserve forecasting

**Example Token**: `santos-moreira-2026`
**Access**: `/p/santos-moreira-2026`

### 2. Campaign Dashboard (`type: "campaign"`)

Multi-section project dashboard with:
- **Visão Geral**: Project overview and status
- **Equipe**: Team management
- **Operações**: Operational metrics
- **Relatórios**: Reports and analytics
- **Sistemas**: System status and configuration

**Example Token**: `loreal-2025-x7k`
**Access**: `/p/loreal-2025-x7k`

---

## Project Configuration

Projects are defined in `lib/projects.ts`:

```typescript
const PROJECTS: Project[] = [
  {
    token: "santos-moreira-2026",
    type: "condominio",
    clientName: "Condomínio Santos Moreira",
    clientSlug: "santos-moreira",
    projectName: "Análise Financeira e Manutenção",
    description: "Financial analysis dashboard",
    status: "active",
    startDate: "2025-08-01",
    endDate: "2026-03-31",
    logoUrl: "/blink-logo-light.png",
  },
  // ... more projects
]
```

**Token Format**: Use lowercase with hyphens (e.g., `santos-moreira-2026`)

---

## Data Management

### Condominio Data

All condominium financial data is stored in `lib/data/condominio.ts`:

- **CATEGORIAS**: 14 expense categories with colors
- **FORNECEDORES**: Supplier master data
- **TRANSACOES**: 55 transaction records (Aug 2025 – Mar 2026)
- **MANUSCRITOS**: Historical manuscript data (2020, 2024-25)
- **META**: Metadata (units, revenue, reserve target)

Update transactions and data directly in this file. Vercel auto-deploys on push.

---

## Deployment

### Prerequisites
- Git repository (GitHub, GitLab, Bitbucket)
- Vercel account (free at vercel.com)

### Deploy to Vercel

**Option A: Via Web UI**
1. Push code to GitHub
2. Go to vercel.com → "Add New..." → "Project"
3. Import your repository
4. Click "Deploy"

**Option B: Via CLI**
```bash
npm install -g vercel
vercel login
vercel
```

### Access After Deployment

Once deployed on Vercel (e.g., `my-blink-dashboard.vercel.app`):

- **Condominio**: `https://my-blink-dashboard.vercel.app/p/santos-moreira-2026`
- **Campaign**: `https://my-blink-dashboard.vercel.app/p/loreal-2025-x7k`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

---

## Integration with BlinkGroup/BlinkSite

Add a link to the BlinkGroup website or BlinkSite repository:

```html
<!-- Simple link -->
<a href="https://blink-dashboard.vercel.app/p/santos-moreira-2026">
  View Condominio Dashboard
</a>

<!-- Embedded iframe -->
<iframe 
  src="https://blink-dashboard.vercel.app/p/santos-moreira-2026"
  style="width: 100%; height: 100vh; border: none;"
/>
```

See [BLINKGROUP_INTEGRATION.md](./BLINKGROUP_INTEGRATION.md) for detailed integration options.

---

## Features

### Dark Mode
Automatic dark/light mode with theme toggle in top-right corner.

### Responsive Design
- Desktop: Full layout (max-width 1400px)
- Tablet: Optimized spacing
- Mobile: Stacked layout with collapsible sections

### Interactive Visualizations
- Recharts for dynamic charts
- Tooltips with formatted currency
- Drill-down capability in stacked charts

### Performance
- ✅ Image optimization (Next.js)
- ✅ Code splitting
- ✅ CSS minification (Tailwind)
- ✅ Static generation where possible

---

## Architecture

```
app/
├── condominio/              # Condominio dashboard
│   ├── page.tsx            # Main shell with tabs
│   └── abas/               # Tab components
│       ├── visao-geral.tsx
│       ├── fluxo-caixa.tsx
│       ├── despesas.tsx
│       └── manutencao-reserva.tsx
├── p/[token]/              # Token-based project access
│   ├── page.tsx            # Dynamic route handler
│   └── not-found.tsx       # Invalid token page
└── [other-dashboards]/
components/
├── condominio/             # Condominio-specific components
│   ├── kpi-card.tsx
│   ├── section-card.tsx
│   └── blink-logo.tsx
└── ui/                     # shadcn/ui components
lib/
├── data/
│   └── condominio.ts       # Financial data
├── projects.ts             # Project registry
└── utils.ts
```

---

## Technology Stack

- **Framework**: Next.js 15.2.6
- **UI Library**: React 19
- **Styling**: Tailwind CSS 3.4
- **Charts**: Recharts 2.15
- **Components**: shadcn/ui
- **Theme**: next-themes
- **Type Safety**: TypeScript 5

---

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS 12+)
- Chrome Mobile

---

## Troubleshooting

### Build Issues
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Port Already in Use
```bash
npm run dev -- -p 3001
```

### Dark Mode Not Working
- Clear browser cache
- Check DevTools Console for errors
- Verify `next-themes` provider in `app/layout.tsx`

### Token Not Found
- Check token exists in `lib/projects.ts`
- Verify URL case sensitivity
- Clear browser localStorage

---

## Contributing

To add new projects:

1. Edit `lib/projects.ts`
2. Add project to `PROJECTS` array with unique token
3. Commit and push
4. Vercel auto-deploys on push

For condominio data updates:

1. Edit `lib/data/condominio.ts`
2. Update transactions, categories, or metadata
3. Commit and push
4. Changes live within 30-60 seconds

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Recharts Docs**: https://recharts.org
- **Tailwind Docs**: https://tailwindcss.com/docs

---

## License

[Your License Here]

---

## Project Status

✅ **Production Ready**

- Condominio Santos Moreira dashboard (complete)
- Token-based access system (complete)
- Dark/light mode (complete)
- Responsive design (complete)
- Vercel deployment ready (complete)
