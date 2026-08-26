
-- Create storage bucket for application documents
INSERT INTO storage.buckets (id, name, public) VALUES ('application-documents', 'application-documents', false);

-- Add new columns to applications table
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS cv_url TEXT,
  ADD COLUMN IF NOT EXISTS recommendation_letter_url TEXT,
  ADD COLUMN IF NOT EXISTS scanned_id_url TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS years_of_experience TEXT,
  ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'Immediately',
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- Storage policies: authenticated users can upload their own files
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'application-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Users can read their own documents
CREATE POLICY "Users can read their own documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'application-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Employers can read documents for their job applications
CREATE POLICY "Employers can read applicant documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'application-documents'
  AND EXISTS (
    SELECT 1 FROM public.applications a
    JOIN public.jobs j ON j.id = a.job_id
    WHERE j.employer_id = auth.uid()
    AND a.applicant_id::text = (storage.foldername(name))[1]
  )
);
