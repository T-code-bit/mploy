-- A CV export is a separate, one-off purchase. Clients can read their
-- purchases but cannot create, verify, or complete one themselves.
CREATE TABLE public.cv_export_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  reference text NOT NULL UNIQUE,
  checkout_url text,
  amount integer NOT NULL DEFAULT 1000 CHECK (amount = 1000),
  currency text NOT NULL DEFAULT 'KES' CHECK (currency = 'KES'),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'verified', 'exported', 'failed')),
  provider_paid_at timestamptz,
  exported_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX cv_export_purchases_user_created_idx
  ON public.cv_export_purchases (user_id, created_at DESC);

ALTER TABLE public.cv_export_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own CV export purchases"
  ON public.cv_export_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view CV export purchases"
  ON public.cv_export_purchases FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_cv_export_purchases_updated_at
  BEFORE UPDATE ON public.cv_export_purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT ON public.cv_export_purchases TO authenticated;
GRANT ALL ON public.cv_export_purchases TO service_role;