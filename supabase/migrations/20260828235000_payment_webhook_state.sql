-- Track Paystack transaction identity and event ordering for safe webhook sync.
ALTER TABLE public.paystack_subscribers
  ADD COLUMN IF NOT EXISTS transaction_reference text,
  ADD COLUMN IF NOT EXISTS provider_event_at timestamptz;

CREATE INDEX IF NOT EXISTS paystack_subscribers_subscription_code_idx
  ON public.paystack_subscribers (subscription_code);

CREATE INDEX IF NOT EXISTS paystack_subscribers_email_idx
  ON public.paystack_subscribers (lower(email));

CREATE OR REPLACE FUNCTION public.initialize_paystack_checkout(
  p_user_id uuid,
  p_email text,
  p_plan_code text,
  p_transaction_reference text,
  p_tier text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_tier NOT IN ('basic', 'premium') THEN
    RAISE EXCEPTION 'Invalid subscription tier';
  END IF;

  INSERT INTO public.paystack_subscribers (
    user_id,
    email,
    plan_code,
    transaction_reference,
    tier,
    status
  )
  VALUES (
    p_user_id,
    lower(p_email),
    p_plan_code,
    p_transaction_reference,
    p_tier,
    'pending'
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    email = EXCLUDED.email,
    plan_code = EXCLUDED.plan_code,
    transaction_reference = EXCLUDED.transaction_reference,
    tier = EXCLUDED.tier,
    status = 'pending'
  WHERE public.paystack_subscribers.status IS DISTINCT FROM 'active';
END;
$$;

REVOKE ALL ON FUNCTION public.initialize_paystack_checkout(uuid, text, text, text, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.initialize_paystack_checkout(uuid, text, text, text, text)
  TO service_role;

CREATE OR REPLACE FUNCTION public.apply_paystack_webhook_event(
  p_user_id uuid,
  p_email text,
  p_status text,
  p_tier text,
  p_event_at timestamptz,
  p_subscription_code text,
  p_customer_code text DEFAULT NULL,
  p_email_token text DEFAULT NULL,
  p_plan_code text DEFAULT NULL,
  p_transaction_reference text DEFAULT NULL,
  p_current_period_end timestamptz DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_row public.paystack_subscribers%ROWTYPE;
BEGIN
  IF p_status NOT IN ('active', 'inactive')
    OR p_tier NOT IN ('free', 'basic', 'premium')
    OR p_event_at IS NULL
  THEN
    RAISE EXCEPTION 'Invalid Paystack event state';
  END IF;

  SELECT * INTO current_row
  FROM public.paystack_subscribers
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    IF p_status <> 'active' THEN
      RETURN 'unmatched';
    END IF;
    INSERT INTO public.paystack_subscribers (user_id, email, tier, status)
    VALUES (p_user_id, lower(p_email), 'free', 'pending')
    ON CONFLICT (user_id) DO NOTHING;

    SELECT * INTO current_row
    FROM public.paystack_subscribers
    WHERE user_id = p_user_id
    FOR UPDATE;
  END IF;

  IF current_row.provider_event_at IS NOT NULL
    AND current_row.provider_event_at >= p_event_at
  THEN
    RETURN 'stale';
  END IF;

  IF p_status = 'inactive'
    AND (
      p_subscription_code IS NULL
      OR current_row.subscription_code IS DISTINCT FROM p_subscription_code
    )
  THEN
    RETURN 'unmatched';
  END IF;

  UPDATE public.paystack_subscribers
  SET
    email = lower(COALESCE(NULLIF(p_email, ''), current_row.email)),
    status = p_status,
    tier = p_tier,
    provider_event_at = p_event_at,
    customer_code = COALESCE(NULLIF(p_customer_code, ''), current_row.customer_code),
    subscription_code = COALESCE(NULLIF(p_subscription_code, ''), current_row.subscription_code),
    email_token = COALESCE(NULLIF(p_email_token, ''), current_row.email_token),
    plan_code = COALESCE(NULLIF(p_plan_code, ''), current_row.plan_code),
    transaction_reference = COALESCE(NULLIF(p_transaction_reference, ''), current_row.transaction_reference),
    current_period_end = COALESCE(p_current_period_end, current_row.current_period_end)
  WHERE user_id = p_user_id;

  RETURN 'applied';
END;
$$;

REVOKE ALL ON FUNCTION public.apply_paystack_webhook_event(
  uuid, text, text, text, timestamptz, text, text, text, text, text, timestamptz
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_paystack_webhook_event(
  uuid, text, text, text, timestamptz, text, text, text, text, text, timestamptz
) TO service_role;