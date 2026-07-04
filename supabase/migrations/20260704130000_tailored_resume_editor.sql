-- Feature 15: track when user last saved tailored resume edits

ALTER TABLE public.analyses
  ADD COLUMN IF NOT EXISTS tailored_content_updated_at timestamptz;
