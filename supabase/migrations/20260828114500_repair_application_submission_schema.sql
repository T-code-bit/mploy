-- The application form and employer portal both use this snapshot of the
-- applicant's email. It was present in generated frontend types but missing
-- from the deployed schema, causing application submission to fail.
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS applicant_email TEXT;

-- Backfill existing applications without exposing auth.users through the API.
UPDATE public.applications AS application
SET applicant_email = auth_user.email
FROM auth.users AS auth_user
WHERE application.applicant_id = auth_user.id
  AND application.applicant_email IS NULL;

COMMENT ON COLUMN public.applications.applicant_email IS
  'Email snapshot supplied by the authenticated applicant at submission time.';

-- Ensure PostgREST sees the new column immediately after migration.
NOTIFY pgrst, 'reload schema';