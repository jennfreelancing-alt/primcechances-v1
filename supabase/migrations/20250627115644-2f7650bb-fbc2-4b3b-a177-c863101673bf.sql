
-- Add new fields to opportunities table for the enhanced opportunity system
ALTER TABLE public.opportunities 
ADD COLUMN IF NOT EXISTS author TEXT,
ADD COLUMN IF NOT EXISTS preview_text TEXT,
ADD COLUMN IF NOT EXISTS featured_image_url TEXT,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

-- Update feature_toggles to include user opportunity post creation control
INSERT INTO public.feature_toggles (feature_key, is_enabled, description) VALUES
('user_opportunity_posts', true, 'Allow users to create and submit opportunity posts for review')
ON CONFLICT (feature_key) DO UPDATE SET
description = 'Allow users to create and submit opportunity posts for review';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_opportunities_published ON public.opportunities(is_published, published_at);
CREATE INDEX IF NOT EXISTS idx_opportunities_author ON public.opportunities(author);
