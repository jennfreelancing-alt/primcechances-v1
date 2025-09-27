-- Adjust RLS policies for feature_toggles to allow staff_admins and admins full access
-- and ensure the auto-delete toggle row exists

-- Drop old single-role policy if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'feature_toggles' 
      AND policyname = 'Admins can manage feature toggles'
  ) THEN
    EXECUTE 'DROP POLICY "Admins can manage feature toggles" ON public.feature_toggles';
  END IF;
END $$;

-- Policy: Admins and Staff Admins can manage feature toggles (ALL)
CREATE POLICY "Admins and staff can manage feature toggles" ON public.feature_toggles
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff_admin'));

-- Keep the public read of enabled features, but also explicitly allow admins and staff_admins to read everything
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'feature_toggles' 
      AND policyname = 'Everyone can read enabled features'
  ) THEN
    EXECUTE 'CREATE POLICY "Everyone can read enabled features" ON public.feature_toggles FOR SELECT USING (is_enabled = true)';
  END IF;
END $$;

CREATE POLICY IF NOT EXISTS "Admins and staff can read all features" ON public.feature_toggles
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff_admin'));

-- Ensure the auto-deletion toggle row exists
INSERT INTO public.feature_toggles (feature_key, is_enabled, description)
VALUES ('auto_delete_expired_opportunities', true, 'Automatically delete opportunities that have passed their application deadline')
ON CONFLICT (feature_key) DO UPDATE
SET description = EXCLUDED.description;
