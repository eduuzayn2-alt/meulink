-- Migration: add subscriptions table and profile subscription columns
-- Run this SQL against your Supabase/Postgres database

-- Add columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free';

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'inactive';

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  mp_payment_id text,
  status text,
  amount numeric,
  currency text,
  raw jsonb,
  started_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable row level security and a basic policy to allow owners to manage their subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Authenticated users can manage their own subscriptions" ON public.subscriptions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- NOTE: Execute this migration with proper DB access (psql or Supabase SQL editor)
