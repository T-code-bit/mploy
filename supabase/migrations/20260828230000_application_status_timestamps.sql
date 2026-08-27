-- Preserve the exact time of each application workflow decision.
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS shortlisted_at timestamptz,
  ADD COLUMN IF NOT EXISTS hired_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz;

CREATE OR REPLACE FUNCTION public.set_application_status_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    CASE lower(NEW.status)
      WHEN 'reviewing' THEN NEW.reviewed_at := now();
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

DROP TRIGGER IF EXISTS set_application_status_timestamp ON public.applications;
CREATE TRIGGER set_application_status_timestamp
  BEFORE UPDATE OF status ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.set_application_status_timestamp();

-- The original transition time is unavailable for old records. Preserve the
-- best available database timestamp without inventing earlier milestones.
UPDATE public.applications
SET reviewed_at = COALESCE(reviewed_at, updated_at)
WHERE lower(status) IN ('reviewing', 'reviewed');

UPDATE public.applications
SET shortlisted_at = COALESCE(shortlisted_at, updated_at)
WHERE lower(status) = 'shortlisted';

UPDATE public.applications
SET hired_at = COALESCE(hired_at, updated_at)
WHERE lower(status) IN ('hired', 'accepted');

UPDATE public.applications
SET rejected_at = COALESCE(rejected_at, updated_at)
WHERE lower(status) = 'rejected';

COMMENT ON COLUMN public.applications.reviewed_at IS 'Most recent time the application entered reviewing/reviewed status.';
COMMENT ON COLUMN public.applications.shortlisted_at IS 'Most recent time the application entered shortlisted status.';
COMMENT ON COLUMN public.applications.hired_at IS 'Most recent time the application entered hired/accepted status.';
COMMENT ON COLUMN public.applications.rejected_at IS 'Most recent time the application entered rejected status.';

NOTIFY pgrst, 'reload schema';