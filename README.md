# COURTCHECK — Landing Page

A high-end, RTL (Hebrew) single-page landing for a premium Padel & Tennis phone mount.
Built with **React + Vite**, **Tailwind CSS**, **Framer Motion**, and **Lucide React**.

## Design
- CourtCheck brand palette: black · white · lime-green accents
- Glassmorphism cards, neon ambient grid, and glow lighting
- Simulated auto-rotating 3D mount viewer (CSS 3D + Framer Motion) with floating hotspot callouts

## Sections
1. Minimal sticky header + CTA
2. Interactive hero with 3D viewer, spec hotspots, price & buy box
3. Value-proposition features grid (4 glass cards)
4. Vertical video showcase + customer reviews
5. FAQ accordion
6. Sticky mobile quick-buy bar

## Brand assets
- **Logo**: `public/LOGO-removebg-preview.png` (transparent), shown in the header and footer. It is the only logo used across the site. The browser favicon is `public/favicon.svg`.
- **Product photo**: the showcase section uses `public/STUND.png` (the mount on the net). Until the file is committed, a dark placeholder shows.

## Getting started
```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
npm run preview  # preview the build
```

## Payment
The `#buy` section embeds the Hyp secure payment form in an iframe (`src/App.jsx`).
It currently points at the **stage** URL (`stage.hyp.co.il`) — replace it with the
production URL before going live.

## Admin panel (`/YUVAL`)
A secure admin dashboard for tracking customers, orders, and shipments lives at any
URL ending in **`/YUVAL`** (e.g. `https://yoursite.com/YUVAL`). It is powered by
[Supabase](https://supabase.com) — authentication and data access are enforced
server-side, so no password or data lives in the frontend bundle.

### One-time setup
1. Create a free Supabase project.
2. In the SQL editor, run [`supabase/schema.sql`](supabase/schema.sql) — it creates the
   `customers`, `orders`, and `shipments` tables and enables Row Level Security so only
   a signed-in user can read them.
3. In **Authentication → Users → Add user**, create the admin account with an email
   (the "username") and a strong password. This is the only account that can sign in.
4. Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY` (Project Settings → API). On your host, set the same two
   environment variables for the build.
5. Rebuild/redeploy. Visit `/YUVAL` and log in.

> **Security notes**
> - The anon key is safe to expose; RLS is what protects the data.
> - `.env*` files are git-ignored — never commit real keys.
> - For SPA hosting, add a rewrite so deep routes like `/YUVAL` serve `index.html`
>   (e.g. Netlify `/* → /index.html 200`, or Vercel a catch-all rewrite).
