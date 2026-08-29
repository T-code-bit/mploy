CREATE TABLE IF NOT EXISTS public.admin_broadcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid,
  audience text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  recipient_count integer NOT NULL DEFAULT 0,
  queued_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'queued',
  queue_error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_broadcasts
  ADD COLUMN IF NOT EXISTS queued_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS failed_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'queued',
  ADD COLUMN IF NOT EXISTS queue_error text;

ALTER TABLE public.admin_broadcasts ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.admin_broadcasts FROM anon, authenticated;
GRANT ALL ON public.admin_broadcasts TO service_role;