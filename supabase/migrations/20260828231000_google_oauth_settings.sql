-- Extend the encrypted provider allow-list for admin-managed custom Google OAuth.
ALTER TABLE public.integration_settings
  DROP CONSTRAINT IF EXISTS integration_settings_setting_key_check;

ALTER TABLE public.integration_settings
  ADD CONSTRAINT integration_settings_setting_key_check
  CHECK (setting_key IN (
    'resend_api_key',
    'resend_from_email',
    'stripe_secret_key',
    'paystack_secret_key',
    'recaptcha_secret_key',
    'openai_api_key',
    'openai_model',
    'google_client_id',
    'google_client_secret',
    'google_allowed_origins',
    'app_url'
  ));

INSERT INTO public.integration_settings (setting_key)
VALUES
  ('google_client_id'),
  ('google_client_secret'),
  ('google_allowed_origins')
ON CONFLICT (setting_key) DO NOTHING;