ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS employer_feedback TEXT DEFAULT NULL;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS employer_contact_info TEXT DEFAULT NULL;