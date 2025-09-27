
-- Add feature toggle for free user category restriction
INSERT INTO public.feature_toggles (feature_key, description, is_enabled)
VALUES ('restrict_free_user_categories', 'Restrict free users to only two categories', true)
ON CONFLICT (feature_key) DO NOTHING;

-- Make opportunity form fields optional by updating the opportunities table constraints
-- Remove NOT NULL constraints from optional fields
ALTER TABLE public.opportunities 
ALTER COLUMN location DROP NOT NULL,
ALTER COLUMN application_url DROP NOT NULL,
ALTER COLUMN salary_range DROP NOT NULL,
ALTER COLUMN application_deadline DROP NOT NULL,
ALTER COLUMN author DROP NOT NULL,
ALTER COLUMN preview_text DROP NOT NULL;

-- Update user_submissions table to make optional fields nullable
ALTER TABLE public.user_submissions 
ALTER COLUMN location DROP NOT NULL,
ALTER COLUMN application_url DROP NOT NULL,
ALTER COLUMN salary_range DROP NOT NULL,
ALTER COLUMN application_deadline DROP NOT NULL,
ALTER COLUMN submission_notes DROP NOT NULL;
