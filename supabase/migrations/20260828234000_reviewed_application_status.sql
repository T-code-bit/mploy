-- Distinguish an in-progress review from a completed employer response.
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS reviewing_at timestamptz;

CREATE OR REPLACE FUNCTION public.set_application_status_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    CASE lower(NEW.status)
      WHEN 'reviewing' THEN NEW.reviewing_at := now();
      WHEN 'reviewed' THEN NEW.reviewed_at := now();
      WHEN 'shortlisted' THEN NEW.shortlisted_at := now();
      WHEN 'hired' THEN NEW.hired_at := now();
      WHEN 'accepted' THEN NEW.hired_at := now();
      WHEN 'rejected' THEN NEW.rejected_at := now();
      ELSE NULL;
    END CASE;
  END IF;
  RETURN NEW;
END;
$$;

UPDATE public.applications
SET
  reviewing_at = COALESCE(reviewing_at, reviewed_at, updated_at),
  reviewed_at = NULL
WHERE lower(status) = 'reviewing';

-- Before the Reviewed state existed, Save Feedback was the final-response
-- action. Preserve that meaning for existing applications such as the
-- acceptance case that already has employer feedback but still says Reviewing.
-- Disable only the database-owned trigger during this one-time backfill so
-- clients cannot forge timestamps during ordinary workflow transitions.
ALTER TABLE public.applications DISABLE TRIGGER set_application_status_timestamp;

UPDATE public.applications
SET
  status = 'reviewed',
  reviewed_at = COALESCE(reviewed_at, updated_at, now())
WHERE lower(status) = 'reviewing'
  AND NULLIF(btrim(employer_feedback), '') IS NOT NULL;

ALTER TABLE public.applications ENABLE TRIGGER set_application_status_timestamp;

COMMENT ON COLUMN public.applications.reviewing_at IS 'Most recent time the application entered the in-progress reviewing state.';
COMMENT ON COLUMN public.applications.reviewed_at IS 'Most recent time the employer completed review or sent a final response.';

NOTIFY pgrst, 'reload schema';