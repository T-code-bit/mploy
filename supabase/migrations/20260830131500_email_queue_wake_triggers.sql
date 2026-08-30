-- Ensure every pgmq enqueue wakes the email worker.  The original dispatcher
-- functions existed without triggers on the pgmq queue tables, so a broadcast
-- could remain queued until some external setup happened to create the cron
-- job (or until pgmq's 24-hour retention elapsed).

ALTER TABLE public.email_send_state
  ADD COLUMN IF NOT EXISTS last_wake_at timestamptz;

-- The worker records rate-limit events as part of the delivery audit. The
-- original CHECK omitted this status, causing that insert to fail silently.
ALTER TABLE public.email_send_log
  DROP CONSTRAINT IF EXISTS email_send_log_status_check;
ALTER TABLE public.email_send_log
  ADD CONSTRAINT email_send_log_status_check
  CHECK (status IN (
    'pending', 'sent', 'suppressed', 'failed', 'rate_limited',
    'bounced', 'complained', 'dlq'
  ));

CREATE OR REPLACE FUNCTION public.email_queue_wake()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  should_dispatch boolean := false;
BEGIN
  -- Serialize scheduling and debounce the immediate HTTP wake. A broadcast
  -- inserts many messages at once; without this, each recipient would start
  -- a separate worker while the recurring cron job is also running.
  PERFORM pg_catalog.pg_advisory_xact_lock(7700000000000001);

  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'process-email-queue') THEN
    PERFORM cron.schedule(
      'process-email-queue',
      '5 seconds',
      $cron$ SELECT public.email_queue_dispatch(); $cron$
    );
  END IF;

  UPDATE public.email_send_state
     SET last_wake_at = now(),
         updated_at = now()
   WHERE id = 1
     AND (last_wake_at IS NULL OR last_wake_at < now() - interval '2 seconds')
  RETURNING true INTO should_dispatch;

  -- Do not wait for the first cron tick, but limit immediate invocations to
  -- one per short burst. The cron job continues draining subsequent batches.
  IF should_dispatch THEN
    PERFORM net.http_post(
      url := 'https://nlfokrpapmzgazcwfgcp.supabase.co/functions/v1/process-email-queue',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Lovable-Context', 'cron',
        'Authorization', 'Bearer ' || (
          SELECT decrypted_secret
            FROM vault.decrypted_secrets
           WHERE name = 'email_queue_service_role_key'
        )
      ),
      body := '{}'::jsonb
    );
  END IF;

  RETURN NULL;
EXCEPTION WHEN OTHERS THEN
  -- Queue insertion must never be rolled back merely because scheduling or
  -- the optional immediate wake is temporarily unavailable. The next enqueue
  -- or the existing cron schedule will retry processing.
  RAISE WARNING 'email_queue_wake failed (enqueue preserved): %', SQLERRM;
  RETURN NULL;
END;
$function$;

DROP TRIGGER IF EXISTS email_queue_wake_auth_emails ON pgmq.q_auth_emails;
CREATE TRIGGER email_queue_wake_auth_emails
  AFTER INSERT ON pgmq.q_auth_emails
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.email_queue_wake();

DROP TRIGGER IF EXISTS email_queue_wake_transactional_emails ON pgmq.q_transactional_emails;
CREATE TRIGGER email_queue_wake_transactional_emails
  AFTER INSERT ON pgmq.q_transactional_emails
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.email_queue_wake();

-- Repair queues that already contain messages when this migration is applied.
-- A trigger function cannot be invoked directly, so perform its scheduling
-- work once here. This prevents already-queued broadcasts waiting for another
-- enqueue event.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'process-email-queue') THEN
    PERFORM cron.schedule(
      'process-email-queue',
      '5 seconds',
      $cron$ SELECT public.email_queue_dispatch(); $cron$
    );
  END IF;

  UPDATE public.email_send_state
     SET last_wake_at = now(),
         updated_at = now()
   WHERE id = 1;

  PERFORM net.http_post(
    url := 'https://nlfokrpapmzgazcwfgcp.supabase.co/functions/v1/process-email-queue',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Lovable-Context', 'cron',
      'Authorization', 'Bearer ' || (
        SELECT decrypted_secret
          FROM vault.decrypted_secrets
         WHERE name = 'email_queue_service_role_key'
      )
    ),
    body := '{}'::jsonb
  );
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'email queue migration wake failed: %', SQLERRM;
END;
$$;