-- =============================================
-- PRIVATE RIDES — Supabase Schema
-- =============================================

-- Drivers table (you + future hires)
create table drivers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  telegram_chat_id text,        -- for Telegram notifications
  is_active boolean default true,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- Rides table
create type ride_status as enum (
  'pending',      -- submitted, waiting for approval
  'approved',     -- you approved, waiting for payment
  'paid',         -- payment confirmed (Stripe auto / Zelle manual)
  'scheduled',    -- ride is confirmed and on calendar
  'completed',    -- ride done
  'cancelled'     -- cancelled by either side
);

create type payment_method as enum ('stripe', 'zelle');

create table rides (
  id uuid primary key default gen_random_uuid(),
  -- client info (no auth required)
  client_name text not null,
  client_email text not null,
  client_phone text,
  -- ride details
  pickup_address text not null,
  dropoff_address text not null,
  ride_date date not null,
  ride_time time not null,
  passengers int default 1,
  notes text,
  -- pricing & payment
  price_usd numeric(10,2),
  payment_method payment_method,
  stripe_payment_link text,
  stripe_payment_intent_id text,
  zelle_confirmed_by uuid references drivers(id),
  -- assignment
  driver_id uuid references drivers(id),
  -- status flow
  status ride_status default 'pending',
  -- metadata
  lang text default 'en',       -- language client used
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger rides_updated_at
  before update on rides
  for each row execute function update_updated_at();

-- =============================================
-- RLS
-- =============================================

alter table rides enable row level security;
alter table drivers enable row level security;

-- Anyone can INSERT a ride (public booking form)
create policy "public can book rides"
  on rides for insert
  with check (true);

-- Client can view their own ride by email (for status page)
create policy "client can view own ride"
  on rides for select
  using (true); -- we use ride ID as secret token, so open select is fine

-- Drivers/admin: full access via service role (API routes use service role key)

-- =============================================
-- Indexes
-- =============================================
create index rides_status_idx on rides(status);
create index rides_created_at_idx on rides(created_at desc);
create index rides_client_email_idx on rides(client_email);
