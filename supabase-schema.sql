-- Supabase schema for creator links

create table if not exists public.links (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  titulo text not null,
  url text not null,
  criado_em timestamptz not null default now()
);

alter table public.links enable row level security;

create policy "Authenticated users can manage their own links" on public.links
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique,
  nome text,
  bio text,
  foto_url text,
  username text unique not null
);

alter table public.profiles enable row level security;

create policy "Authenticated users can manage their own profile" on public.profiles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
