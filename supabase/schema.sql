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

-- Separate shipping-address parts (for the supplier / dropshipping export).
alter table public.shipments add column if not exists street text;
alter table public.shipments add column if not exists city   text;
alter table public.shipments add column if not exists zip    text;
alter table public.shipments add column if not exists region text;

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

-- ---- Analytics events ----------------------------------------------------
-- Lightweight first-party visit/conversion tracking. Rows are written ONLY by
-- the server (api/track.js and api/verify-payment.js use the service-role key,
-- which bypasses RLS), so no public insert policy is needed and the anon key
-- can neither read nor write this table.
create table if not exists public.analytics_events (
  id          bigint generated always as identity primary key,
  type        text not null,          -- 'pageview' | 'begin_checkout' | 'purchase'
  path        text,                   -- page URL path
  referrer    text,                   -- document.referrer (traffic source)
  session_id  text,                   -- random per-browser id (de-dupe visitors)
  user_agent  text,                   -- browser/device string
  order_ref   text,                   -- set on 'purchase' — links to the order
  amount      numeric(10,2),          -- set on 'purchase'
  created_at  timestamptz not null default now()
);
create index if not exists analytics_events_created_at_idx on public.analytics_events (created_at desc);
create index if not exists analytics_events_type_idx       on public.analytics_events (type);

-- ---- Row Level Security --------------------------------------------------
-- Access is denied by default once RLS is on. We only allow *authenticated*
-- users (i.e. someone who signed in through the admin login). The public
-- anon key on the website therefore cannot read or write these tables.

alter table public.customers        enable row level security;
alter table public.orders           enable row level security;
alter table public.shipments        enable row level security;
alter table public.analytics_events enable row level security;

-- HARDENED: access is limited to a single admin email, not every authenticated
-- user. This way, even if public sign-ups are ever enabled, a random account
-- still cannot read customer PII (names, emails, phones, addresses).
--
-- 👉 Replace 'admin@example.com' below with the exact email you created under
--    Authentication → Users, then run this block. To change the admin later,
--    just edit the email and re-run.
do $$
declare
  t text;
  admin_email text := 'admin@example.com';  -- ← CHANGE ME
begin
  foreach t in array array['customers','orders','shipments','analytics_events'] loop
    -- Drop any previous policies (the old permissive one included).
    execute format('drop policy if exists "admin_all" on public.%I;', t);
    execute format('drop policy if exists "admin_only" on public.%I;', t);
    execute format(
      'create policy "admin_only" on public.%I
         for all to authenticated
         using ((auth.jwt() ->> ''email'') = %L)
         with check ((auth.jwt() ->> ''email'') = %L);',
      t, admin_email, admin_email);
  end loop;
end $$;

-- ---- Create the admin user ----------------------------------------------
-- Do NOT create users in SQL. In the Supabase Dashboard go to
-- Authentication → Users → Add user, and create the admin with an email
-- (this is the "username") and a strong password. That email must match the
-- admin_email set above. That account is the only one able to sign in and read
-- the tables above.
--
-- Also recommended: Authentication → Providers/Settings → disable
-- "Allow new users to sign up", so no one else can create an account at all.
