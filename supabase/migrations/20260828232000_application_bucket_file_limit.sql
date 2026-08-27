-- Enforce the application document limit at the Storage service boundary.
UPDATE storage.buckets
SET file_size_limit = 5242880
WHERE id = 'application-documents';