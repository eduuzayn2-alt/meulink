-- Migration: add analytics_events and mp_webhook_logs

create table if not exists public.analytics_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  event_type text not null,
  source text,
  payload jsonb,
  created_at timestamptz not null default now()
);

alter table public.analytics_events enable row level security;

create policy "Authenticated users can insert their own events" on public.analytics_events
  for insert
  with check (auth.uid() = user_id or user_id is null);

-- Table to log raw Mercado Pago webhook payloads for auditing
create table if not exists public.mp_webhook_logs (
  id uuid primary key default uuid_generate_v4(),
  mp_id text,
  topic text,
  raw jsonb,
  created_at timestamptz not null default now()
);

alter table public.mp_webhook_logs enable row level security;

create policy "Authenticated users can view webhook logs" on public.mp_webhook_logs
  for select
  using (true);
