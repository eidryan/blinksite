# Integration: Condomínio Santos Moreira Dashboard with BlinkGroup

## Quick Access Link

**Production URL**: 
```
https://blink-dashboard.vercel.app/p/santos-moreira-2026
```

(Replace `blink-dashboard.vercel.app` with your actual Vercel deployment domain)

---

## Integration Methods

### Method 1: Direct Link in BlinkSite (Easiest)

Add a link in your BlinkSite repository:

**File**: `docs/projects/santos-moreira.md`
```markdown
# Condomínio Santos Moreira

## Financial Dashboard

[Access Dashboard](https://blink-dashboard.vercel.app/p/santos-moreira-2026)

**Available Reports:**
- Visão Geral (Overview with KPIs)
- Fluxo de Caixa (Cash Flow Analysis)
- Despesas (Expense Breakdown)
- Manutenção & Reserva (Maintenance Planning)

**Data Period**: August 2025 – March 2026
```

Or in navigation/header:

**File**: `src/components/Navigation.tsx`
```tsx
<Link href="https://blink-dashboard.vercel.app/p/santos-moreira-2026">
  Dashboard
</Link>
```

---

### Method 2: Embedded Dashboard (Blinking Loading)

Embed the dashboard directly in a BlinkSite page:

**File**: `pages/projects/santos-moreira.tsx`
```tsx
export default function SantosMoreiraDashboard() {
  return (
    <div className="w-full h-screen">
      <iframe 
        src="https://blink-dashboard.vercel.app/p/santos-moreira-2026"
        title="Condomínio Santos Moreira Dashboard"
        className="w-full h-full border-0"
        allowFullScreen
      />
    </div>
  )
}
```

---

### Method 3: API Integration (Advanced)

For deeper integration, fetch project metadata:

**Endpoint**: `https://blink-dashboard.vercel.app/api/projects/santos-moreira-2026`

*(Note: Implement this API route in the dashboard if needed)*

```typescript
// In your Next.js API route: pages/api/dashboard-link.ts
const response = await fetch(
  'https://blink-dashboard.vercel.app/p/santos-moreira-2026'
);
```

---

## BlinkGroup Website Integration

### Step 1: Add Dashboard Link

**Location**: BlinkGroup website header/navigation

```html
<nav>
  <!-- Existing links -->
  <a href="/p/santos-moreira-2026" target="_blank">
    Condomínio Santos Moreira
  </a>
</nav>
```

Or as a full subdomain:

```
https://dashboard.blinkgroup.com/p/santos-moreira-2026
```

### Step 2: Configure Custom Domain (Optional)

If using a custom domain on BlinkGroup:

1. **In Vercel**: Add `dashboard.blinkgroup.com` as a domain alias
2. **In BlinkGroup DNS**: Add CNAME record pointing to Vercel
3. **Access via**: `https://dashboard.blinkgroup.com/p/santos-moreira-2026`

---

## GitHub Workflow

### Updating Dashboard Data

1. **Edit condominio data** in `lib/data/condominio.ts`
2. **Commit and push**:
   ```bash
   git add lib/data/condominio.ts
   git commit -m "Update Santos Moreira financials: Mar/2026 data"
   git push origin main
   ```
3. **Auto-deploy**: Vercel automatically deploys on push
4. **Live within 30-60 seconds**

### Updating Dashboard UI

1. **Edit dashboard components** in `app/condominio/abas/`
2. **Test locally**:
   ```bash
   npm run dev
   # Visit http://localhost:3000/condominio
   ```
3. **Commit and push** (same as above)

---

## Access Control & Security

### Current Setup
- Token-based URLs: `/p/santos-moreira-2026`
- Token acts as URL password (no additional auth required)
- Suitable for distribution via email/dashboard link

### Future Enhancement
Implement authentication for sensitive projects:

```typescript
// In app/p/[token]/page.tsx
if (project.requiresAuth) {
  return <LoginPage project={project} />
}
```

---

## Data Sources

**Santos Moreira Condominium**
- **Location**: [Address from data]
- **Units**: 6
- **Monthly Revenue**: R$ 4,200
- **Reserve Target**: R$ 1,572/month
- **Analysis Period**: August 2025 – March 2026
- **Data Source**: Blink Consulting - Matriz de Rastreabilidade

---

## Troubleshooting

### Dashboard Not Loading
- [ ] Check URL: `https://blink-dashboard.vercel.app/p/santos-moreira-2026`
- [ ] Verify token in `lib/projects.ts`
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Check browser console for errors (F12)

### Dark Mode Issues
- [ ] Try different theme: Check theme toggle in top-right
- [ ] Clear localStorage: Open DevTools → Application → Clear Storage

### Data Not Updating
- [ ] Force refresh: Ctrl+F5 or Cmd+Shift+R
- [ ] Check deployment status on Vercel dashboard
- [ ] Wait 2-3 minutes for CDN cache to clear

---

## Contact & Support

For issues or integration questions:
- **Blink Team**: [contact info]
- **Vercel Docs**: https://vercel.com/docs
- **GitHub Issues**: [dashboard repo]/issues

---

## Future Enhancements

- [ ] Real-time data sync (WebSocket from Supabase)
- [ ] PDF export for reports
- [ ] Email alerts for maintenance risks
- [ ] Mobile app version
- [ ] Multi-property dashboard (compare multiple condominiums)
