-- Remove the scanned ID requirement and its application metadata permanently.
-- Existing scanned ID paths are removed with the column and can no longer be
-- selected or authorized through the application data model.
DROP POLICY IF EXISTS "Employers can read applicant documents" ON storage.objects;

ALTER TABLE public.applications
  DROP COLUMN IF EXISTS scanned_id_url;

CREATE POLICY "Employers can read applicant documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'application-documents'
  AND EXISTS (
    SELECT 1
    FROM public.applications AS a
    JOIN public.jobs AS j ON j.id = a.job_id
    WHERE j.employer_id = auth.uid()
      AND a.applicant_id::text = (storage.foldername(name))[1]
      AND (
        a.cv_url = name
        OR a.cover_letter_url = name
        OR a.resume_url = name
        OR a.recommendation_letter_url = name
      )
  )
);