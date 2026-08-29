-- Queue one durable acknowledgement to the job owner when an application
-- commits. A failure in the acknowledgement path never rejects the valid
-- application; warnings and the send log make failures observable.
CREATE OR REPLACE FUNCTION public.queue_employer_application_acknowledgement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  job_record public.jobs%ROWTYPE;
  owner_email text;
  applicant_name text;
  safe_job_title text;
  safe_company text;
  safe_applicant_name text;
  safe_applicant_email text;
  queue_message_id text := NEW.id::text;
  queued_at timestamptz := now();
  subject text;
  html_body text;
  text_body text;
BEGIN
  -- This nested block acts as a savepoint for the best-effort notification.
  BEGIN
  SELECT *
  INTO job_record
  FROM public.jobs
  WHERE id = NEW.job_id;

  IF NOT FOUND THEN
    RAISE WARNING 'Employer acknowledgement was not queued: job was not found';
    RETURN NEW;
  END IF;

  SELECT email
  INTO owner_email
  FROM auth.users
  WHERE id = job_record.employer_id;

  IF owner_email IS NULL OR btrim(owner_email) = '' THEN
    RAISE WARNING 'Employer acknowledgement was not queued: job owner has no email address';
    RETURN NEW;
  END IF;

  SELECT NULLIF(btrim(full_name), '')
  INTO applicant_name
  FROM public.profiles
  WHERE user_id = NEW.applicant_id;

  safe_job_title := replace(replace(replace(job_record.title, '&', '&amp;'), '<', '&lt;'), '>', '&gt;');
  safe_company := replace(replace(replace(job_record.company, '&', '&amp;'), '<', '&lt;'), '>', '&gt;');
  safe_applicant_name := replace(replace(replace(coalesce(applicant_name, 'An applicant'), '&', '&amp;'), '<', '&lt;'), '>', '&gt;');
  safe_applicant_email := replace(replace(replace(coalesce(NULLIF(btrim(NEW.applicant_email), ''), 'Not provided'), '&', '&amp;'), '<', '&lt;'), '>', '&gt;');
  subject := regexp_replace(format('New application received — %s', job_record.title), '[\r\n]+', ' ', 'g');

  html_body := format(
    '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;color:#1f2937;line-height:1.5;"><h1 style="font-size:22px;">New application received</h1><p>A candidate has applied to <strong>%s</strong> at %s.</p><table style="border-collapse:collapse;"><tr><td style="padding:4px 16px 4px 0;color:#6b7280;">Applicant</td><td style="padding:4px 0;">%s</td></tr><tr><td style="padding:4px 16px 4px 0;color:#6b7280;">Email</td><td style="padding:4px 0;">%s</td></tr></table><p style="margin-top:24px;"><a href="https://go-mploy.com/employer" style="background:#1a365d;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;">Review application</a></p><p style="font-size:12px;color:#6b7280;">This notification confirms the application was received in your M-Ploy employer portal.</p></body></html>',
    safe_job_title,
    safe_company,
    safe_applicant_name,
    safe_applicant_email
  );
  text_body := format(
    'New application received%1$s%1$s%2$s has applied to %3$s at %4$s.%1$sApplicant: %5$s%1$sEmail: %6$s%1$s%1$sReview the application in your M-Ploy employer portal: https://go-mploy.com/employer',
    E'\n',
    coalesce(applicant_name, 'An applicant'),
    job_record.title,
    job_record.company,
    coalesce(NULLIF(btrim(NEW.applicant_email), ''), 'Not provided')
  );

    -- Retain an audit entry where possible, but do not make it a prerequisite
    -- for accepting an application.
    BEGIN
      INSERT INTO public.email_send_log (
        message_id,
        template_name,
        recipient_email,
        status,
        metadata
      )
      VALUES (
        queue_message_id,
        'employer_application_received',
        owner_email,
        'pending',
        jsonb_build_object('application_id', NEW.id, 'job_id', NEW.job_id)
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Employer acknowledgement audit entry could not be written';
    END;

    BEGIN
      PERFORM public.enqueue_email(
        'transactional_emails',
        jsonb_build_object(
          'message_id', queue_message_id,
          'to', owner_email,
          'subject', subject,
          'html', html_body,
          'text', text_body,
          'purpose', 'transactional',
          'label', 'employer_application_received',
          'idempotency_key', 'employer-application-received-' || queue_message_id,
          'queued_at', queued_at,
          'metadata', jsonb_build_object('application_id', NEW.id, 'job_id', NEW.job_id)
        )
      );
    EXCEPTION WHEN OTHERS THEN
      -- If the audit row exists, mark the failed queue operation for support.
      UPDATE public.email_send_log AS send_log
      SET status = 'failed',
          error_message = left(SQLERRM, 1000)
      WHERE send_log.message_id = queue_message_id
        AND send_log.status = 'pending';
      RAISE WARNING 'Employer acknowledgement could not be queued';
    END;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Employer acknowledgement preparation failed';
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS queue_employer_application_acknowledgement ON public.applications;
CREATE TRIGGER queue_employer_application_acknowledgement
  AFTER INSERT ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.queue_employer_application_acknowledgement();

REVOKE ALL ON FUNCTION public.queue_employer_application_acknowledgement() FROM PUBLIC;
