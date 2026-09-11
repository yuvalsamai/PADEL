-- ==========================================================================
-- CourtCheck admin — Supabase schema + Row Level Security
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query).
-- ==========================================================================

-- ---- Tables --------------------------------------------------------------

create table if not exists public.customers (
  id          bigint generated always as identity primary key,
  name        text not null,
  email       text,
  phone       text,
  created_at  timestamptz not null default now()
);

create table if not exists public.orders (
  id            bigint generated always as identity primary key,
  customer_id   bigint references public.customers(id) on delete set null,
  customer_name text,
  product       text,
  quantity      integer default 1,
  amount        numeric(10,2),
  order_ref     text,   -- Hyp "Order" number: links the checkout record to the completion redirect
  tran_id       text,   -- Hyp transaction id, set on a verified completion (idempotency key)
  status        text not null default 'pending'
                check (status in ('pending','paid','shipped','delivered','cancelled')),
  created_at    timestamptz not null default now()
);

-- If the orders table already exists from an earlier version, add the columns:
alter table public.orders add column if not exists order_ref text;
alter table public.orders add column if not exists tran_id   text;

create table if not exists public.shipments (
  id              bigint generated always as identity primary key,
  order_id        bigint references public.orders(id) on delete cascade,
  courier         text,
  tracking_number text,
  address         text,
  status          text not null default 'pending'
                  check (status in ('pending','shipped','delivered','cancelled')),
  created_at      timestamptz not null default now()
);

-- ---- Row Level Security --------------------------------------------------
-- Access is denied by default once RLS is on. We only allow *authenticated*
-- users (i.e. someone who signed in through the admin login). The public
-- anon key on the website therefore cannot read or write these tables.

alter table public.customers  enable row level security;
alter table public.orders     enable row level security;
alter table public.shipments  enable row level security;

do $$
declare t text;
begin
  foreach t in array array['customers','orders','shipments'] loop
    execute format('drop policy if exists "admin_all" on public.%I;', t);
    execute format(
      'create policy "admin_all" on public.%I
         for all to authenticated
         using (true) with check (true);', t);
  end loop;
end $$;

-- ---- Create the admin user ----------------------------------------------
-- Do NOT create users in SQL. In the Supabase Dashboard go to
-- Authentication → Users → Add user, and create the admin with an email
-- (this is the "username") and a strong password. That account is the only
-- one able to sign in and read the tables above.
