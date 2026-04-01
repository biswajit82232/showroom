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

## 5. PWA (installable app)

The build includes a **web app manifest** and **service worker** (via `vite-plugin-pwa`). After deploy, open the site in **Chrome** (Android/desktop) or **Safari** (iOS 16.4+): use **Install app** / **Add to Home Screen**. The UI can load offline; **Supabase sync still needs the network** (local-only mode can use cached shell + prior localStorage data in the same browser).

For the strongest install prompts on all platforms, add `public/pwa-192x192.png` and `public/pwa-512x512.png` and register them under `manifest.icons` in `vite.config.ts` (see [web.dev install criteria](https://web.dev/articles/install-criteria)).

## 6. Future data protection (checklist)

Use this when you outgrow “open anon access” on `sales`:

1. **Supabase Auth** — Email/magic link or OAuth; store `user_id` on rows.
2. **RLS policies** — Replace broad `anon` policies with `auth.uid()` checks (users only see their rows).
3. **Keys** — Never use `service_role` in the browser; keep publishable/anon in the client only.
4. **Secrets** — Only in Vercel env / server; never commit `.env` with real keys.
5. **Audit** — Periodic review of Supabase logs; rotate keys if leaked.
6. **Optional** — Rate limiting (Edge Functions), CAPTCHA on sign-up, backups (Supabase scheduled backups).

Track schema changes as new files under `supabase/migrations/` and apply via SQL Editor or `supabase db push` after linking the CLI.
