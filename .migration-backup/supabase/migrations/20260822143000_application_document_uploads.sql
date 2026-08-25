-- Keep the separate cover-letter attachment distinct from the legacy resume_url field.
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS cover_letter_url TEXT;

-- The bucket is private: access is granted only through the policies below and signed URLs.
INSERT INTO storage.buckets (id, name, public)
VALUES ('application-documents', 'application-documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Allow applicants to manage their own files, including retrying an interrupted upload.
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'application-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'application-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'application-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;
CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'application-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can read their own documents" ON storage.objects;
CREATE POLICY "Users can read their own documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'application-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Employers may only read files attached to applications for jobs they own.
DROP POLICY IF EXISTS "Employers can read applicant documents" ON storage.objects;
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
        OR a.scanned_id_url = name
      )
  )
);

-- Admins can review application attachments without making the private bucket public.
DROP POLICY IF EXISTS "Admins can read application documents" ON storage.objects;
CREATE POLICY "Admins can read application documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'application-documents'
  AND public.has_role(auth.uid(), 'admin')
);