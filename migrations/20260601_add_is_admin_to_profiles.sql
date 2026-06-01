-- Migration: add is_admin column to profiles

alter table public.profiles
  add column if not exists is_admin boolean default false;

-- grant minimal policy to allow users to update their own is_admin only via direct DB (admins only)
-- Note: management of is_admin should be done via Supabase dashboard or admin SQL, not the app.
