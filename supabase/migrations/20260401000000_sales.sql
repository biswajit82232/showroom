-- Invoices / sales for showroom-tracker (maps to src/lib/salesRemote.ts)
-- Run in Supabase SQL Editor or via: supabase db push (if using Supabase CLI)

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_number text not null,
  invoice_no text not null,
  sale_date date not null,
  due_date date not null,
  product text not null,
  sale_price numeric(14, 2) not null,
  cost_price numeric(14, 2) not null,
  payment_received numeric(14, 2) not null default 0
);

create index if not exists sales_sale_date_idx on public.sales (sale_date desc);

alter table public.sales enable row level security;

-- Permissive policies for anon (browser uses VITE_SUPABASE_ANON_KEY / publishable key).
-- Anyone with your anon key can read/write this table. For a public demo or
-- single-user setup that is simple; for production, add auth and restrict policies.
-- DROP … IF EXISTS keeps this script re-runnable in SQL Editor without duplicate-policy errors.
drop policy if exists "sales_select_anon" on public.sales;
drop policy if exists "sales_insert_anon" on public.sales;
drop policy if exists "sales_update_anon" on public.sales;
drop policy if exists "sales_delete_anon" on public.sales;

create policy "sales_select_anon"
  on public.sales for select
  to anon
  using (true);

create policy "sales_insert_anon"
  on public.sales for insert
  to anon
  with check (true);

create policy "sales_update_anon"
  on public.sales for update
  to anon
  using (true)
  with check (true);

create policy "sales_delete_anon"
  on public.sales for delete
  to anon
  using (true);
