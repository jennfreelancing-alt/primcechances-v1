
-- Let's get the current user ID from the user_profiles table and assign admin role
-- First, let's see what users exist and assign admin role to the first user
WITH first_user AS (
  SELECT id FROM public.user_profiles 
  ORDER BY created_at ASC 
  LIMIT 1
)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM first_user
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = (SELECT id FROM first_user) AND role = 'admin'
);

-- Also ensure RLS policies exist for the opportunities table
-- Create policy for admins to insert opportunities
DROP POLICY IF EXISTS "Admins can manage all opportunities" ON public.opportunities;
CREATE POLICY "Admins can manage all opportunities" ON public.opportunities
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff_admin'));

-- Ensure admin activity logs can be inserted by admins
DROP POLICY IF EXISTS "Admins can insert activity logs" ON public.admin_activity_logs;
CREATE POLICY "Admins can insert activity logs" ON public.admin_activity_logs
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff_admin'));

DROP POLICY IF EXISTS "Admins can view activity logs" ON public.admin_activity_logs;
CREATE POLICY "Admins can view activity logs" ON public.admin_activity_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff_admin'));
