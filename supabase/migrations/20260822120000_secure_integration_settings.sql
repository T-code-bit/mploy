-- Provider credentials are encrypted in an internal-only table. Browser clients
-- never receive this table's rows; admins use the admin-provider-settings Edge
-- Function, which checks their authenticated role before decrypting or writing.
CREATE TABLE IF NOT EXISTS public.integration_settings (
  setting_key text PRIMARY KEY CHECK (setting_key IN (
    'resend_api_key',
    'resend_from_email',
    'stripe_secret_key',
    'paystack_secret_key',
    'recaptcha_secret_key',
    'openai_api_key',
    'openai_model',
    'app_url'
  )),
  encrypted_value text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.integration_settings FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.integration_settings TO service_role;

INSERT INTO public.integration_settings (setting_key)
VALUES
  ('resend_api_key'),
  ('resend_from_email'),
  ('stripe_secret_key'),
  ('paystack_secret_key'),
  ('recaptcha_secret_key'),
  ('openai_api_key'),
  ('openai_model'),
  ('app_url')
ON CONFLICT (setting_key) DO NOTHING;