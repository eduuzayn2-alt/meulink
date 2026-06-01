-- Migration: restrict mp_webhook_logs select to admin users only

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Authenticated users can view their own webhook logs" ON public.mp_webhook_logs;

-- Create policy: only users who are admins in profiles can select
CREATE POLICY "Admins can view webhook logs" ON public.mp_webhook_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.is_admin = true
    )
  );

-- Also restrict insert to service role or webhook function; keep as-is for now
