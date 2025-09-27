-- Create table for tracking auto-deleted opportunities
CREATE TABLE IF NOT EXISTS public.auto_deletion_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID NOT NULL,
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  application_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  days_expired INTEGER NOT NULL,
  deletion_reason TEXT NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.auto_deletion_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Only admins can view auto-deletion logs
CREATE POLICY "Admins can view auto deletion logs" ON public.auto_deletion_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff_admin'));

CREATE POLICY "System can insert auto deletion logs" ON public.auto_deletion_logs
  FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_auto_deletion_logs_deleted_at ON public.auto_deletion_logs(deleted_at DESC);
CREATE INDEX IF NOT EXISTS idx_auto_deletion_logs_opportunity_id ON public.auto_deletion_logs(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_auto_deletion_logs_organization ON public.auto_deletion_logs(organization);

-- Add feature toggle for auto-deletion
INSERT INTO public.feature_toggles (feature_key, is_enabled, description) VALUES
('auto_delete_expired_opportunities', true, 'Automatically delete opportunities that have passed their application deadline')
ON CONFLICT (feature_key) DO UPDATE SET
description = 'Automatically delete opportunities that have passed their application deadline';

-- Create a function to get expired opportunities count (for admin dashboard)
CREATE OR REPLACE FUNCTION public.get_expired_opportunities_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO expired_count
  FROM public.opportunities
  WHERE application_deadline IS NOT NULL
    AND application_deadline < NOW()
    AND is_published = true
    AND status = 'approved';
  
  RETURN expired_count;
END;
$$;

-- Create a function to get auto-deletion statistics
CREATE OR REPLACE FUNCTION public.get_auto_deletion_stats(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  total_deleted INTEGER,
  deleted_today INTEGER,
  deleted_this_week INTEGER,
  deleted_this_month INTEGER,
  avg_days_expired NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_deleted,
    COUNT(*) FILTER (WHERE deleted_at >= CURRENT_DATE)::INTEGER as deleted_today,
    COUNT(*) FILTER (WHERE deleted_at >= CURRENT_DATE - INTERVAL '7 days')::INTEGER as deleted_this_week,
    COUNT(*) FILTER (WHERE deleted_at >= CURRENT_DATE - INTERVAL '30 days')::INTEGER as deleted_this_month,
    ROUND(AVG(days_expired), 2) as avg_days_expired
  FROM public.auto_deletion_logs
  WHERE deleted_at >= CURRENT_DATE - INTERVAL '1 day' * days_back;
END;
$$;
