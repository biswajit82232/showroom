# Deploying showroom-tracker (Vercel + Supabase)

## 1. Supabase database

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run the contents of `supabase/migrations/20260401000000_sales.sql` (creates `sales` table, indexes, and RLS policies for the `anon` role).

### Security note

The migration allows **anonymous** clients (your Vite `VITE_SUPABASE_ANON_KEY`) to **select, insert, update, and delete** all rows in `public.sales`. That matches this app’s current design (no login). Anyone who has the deployed site plus the anon key can modify data. For a private business app, add Supabase Auth and replace these policies with rules that tie rows to `auth.uid()` or use a service role only on a trusted backend.

## 2. Environment variables

### Local

Copy `.env.example` to `.env.local` and fill in values from **Project Settings → API**.

### Vercel

In the project on Vercel: **Settings → Environment Variables**:

| Name | Value |
|------|--------|
| `VITE_SUPABASE_URL` | Project URL |
| `VITE_SUPABASE_ANON_KEY` | anon public key |

Redeploy after changing variables. Vite inlines `VITE_*` at build time, so they must be set for **Production** (and Preview if you use previews).

## 3. Vercel project

- **Framework preset:** Vite  
- **Build command:** `npm run build`  
- **Output directory:** `dist`  
- **Install command:** `npm install`  

The repo includes `vercel.json` with a SPA fallback so client-side routes (`/new`, `/sale/:id`) resolve to `index.html`.

## 4. Verify

After deploy, open the site, create an invoice, and confirm a row appears in Supabase **Table Editor → sales**. If variables are missing, the app falls back to **localStorage** only (data stays in the browser).
