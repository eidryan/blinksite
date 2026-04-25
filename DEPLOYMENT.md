# Deployment Guide: Blink Dashboard to Vercel

## Overview

This dashboard supports multiple project types:
- **Campaign Projects** (e.g., L'Oréal): Multi-section dashboard with Overview, Team, Operations, Reports, Systems
- **Condominio Projects** (e.g., Santos Moreira): Financial analysis with Visão Geral, Fluxo de Caixa, Despesas, Manutenção & Reserva

Token-based access via `/p/[token]` routes enables secure client-specific dashboards.

---

## Quickstart: Deploy to Vercel

### Prerequisites
- Vercel account (free at vercel.com)
- GitHub account for repository hosting
- Git installed locally

### Step 1: Push to GitHub

```bash
# Navigate to project directory
cd C:\Users\dvill\Documents\blink\predio_caindo\dash

# Add GitHub as remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/blink-dashboard.git
git branch -M main
git push -u origin main
```

### Step 2: Connect to Vercel

**Option A: Web UI (Recommended)**
1. Go to vercel.com and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure build settings:
   - **Framework**: Next.js (auto-detected)
   - **Build Command**: `npm run build` (pre-configured)
   - **Output Directory**: `.next` (auto-detected)
5. Click "Deploy"

**Option B: Vercel CLI**
```bash
npm install -g vercel
vercel login
vercel
# Follow prompts to connect and deploy
```

---

## Access Santos Moreira Dashboard

Once deployed, access the Condomínio Santos Moreira dashboard:

```
https://your-vercel-domain.vercel.app/p/santos-moreira-2026
```

### Token Details
- **Token**: `santos-moreira-2026`
- **Project Type**: `condominio`
- **Available Tabs**:
  - Visão Geral (Overview with KPIs and monthly status)
  - Fluxo de Caixa (Cash flow, waterfall, comparatives)
  - Despesas (Expense breakdown, outliers, heatmap)
  - Manutenção & Reserva (Maintenance timeline, risk assessment)

---

## Adding New Projects

To add new projects, edit `lib/projects.ts`:

```typescript
const PROJECTS: Project[] = [
  // Existing projects...
  {
    token: "your-client-2026",
    type: "campaign",  // or "condominio"
    clientName: "Client Name",
    clientSlug: "client-slug",
    projectName: "Project Name",
    description: "Project description",
    status: "active",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    logoUrl: "/path-to-logo.png",
    metrics: {  // optional, required for campaign type
      completionRate: 50,
      activeTasks: 10,
      completedTasks: 20,
      teamSize: 5,
      daysRemaining: 100,
    },
  },
]
```

Then:
```bash
git add lib/projects.ts
git commit -m "Add new project: [Project Name]"
git push
# Vercel auto-deploys on push
```

---

## Environment Variables

Optional environment variables can be set in Vercel dashboard:

```
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
```

---

## Domain Configuration

### Custom Domain
1. In Vercel dashboard, go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS setup instructions
4. Verify domain

### Example: Access via blinkgroup.com
```
https://dashboard.blinkgroup.com/p/santos-moreira-2026
```

---

## Integration with BlinkSite

### Option 1: Iframe Embed (Simple)
Add to any page in blinksite:
```html
<iframe 
  src="https://your-vercel-domain.vercel.app/p/santos-moreira-2026"
  title="Condomínio Santos Moreira"
  style="width: 100%; height: 100vh; border: none;"
/>
```

### Option 2: Direct Link (Simple)
Add to blinksite navigation:
```markdown
[Dashboard](https://your-vercel-domain.vercel.app/p/santos-moreira-2026)
```

### Option 3: Deep Integration (Advanced)
- Fork/clone dashboard to blinksite repo as `/dashboards/condominio/`
- Serve from same origin to avoid CORS issues
- Share authentication context if needed

---

## Monitoring & Logs

### Vercel Dashboard
1. Go to your project on vercel.com
2. Click "Deployments" to see deploy history
3. Click any deployment to view logs
4. Check "Analytics" for traffic patterns

### Local Testing
```bash
# Build locally
npm run build

# Start production server
npm start

# App runs on http://localhost:3000
```

---

## Troubleshooting

### Project Not Found Error
- Verify token exists in `lib/projects.ts`
- Check URL: `/p/TOKEN-NAME` (case-sensitive)
- Clear browser cache

### Build Failure
```bash
# Clear build cache
rm -rf .next
npm run build
```

### Import Errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Dark Mode Not Working
- Ensure `next-themes` provider in `app/layout.tsx`
- Check browser DevTools Console for errors
- Try clearing localStorage

---

## Performance Optimization

### Current Setup
- ✅ Image optimization (Next.js Image component)
- ✅ Code splitting (dynamic imports)
- ✅ CSS minification (Tailwind)
- ✅ API routes ready for database integration

### Next Steps
- Monitor Core Web Vitals on Vercel Analytics
- Consider Redis caching for condominio data
- Implement ISR (Incremental Static Regeneration) for data updates

---

## Support & Questions

For integration with blinkgroup or blinksite, contact the Blink team or refer to:
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- GitHub Issues: [Your repo URL]/issues
