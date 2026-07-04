-- Allow Word (.docx) uploads for tailored resumes

UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream'
]::text[]
WHERE id = 'resumes';
