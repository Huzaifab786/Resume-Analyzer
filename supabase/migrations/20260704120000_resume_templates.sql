-- Feature 14: resume templates + stored tailored content for re-render

ALTER TABLE public.analyses
  ADD COLUMN IF NOT EXISTS tailored_resume_content jsonb,
  ADD COLUMN IF NOT EXISTS resume_template_id text;

ALTER TABLE public.analyses
  DROP CONSTRAINT IF EXISTS analyses_resume_template_id_check;

ALTER TABLE public.analyses
  ADD CONSTRAINT analyses_resume_template_id_check
  CHECK (
    resume_template_id IS NULL
    OR resume_template_id IN ('classic', 'modern', 'minimal')
  );
