
-- Update user_profiles table to ensure subscription_tier column exists with proper default
-- The column already exists based on the schema, but let's ensure it has the right default
ALTER TABLE public.user_profiles 
ALTER COLUMN subscription_tier SET DEFAULT 'free';

-- Create a function to check user subscription tier
CREATE OR REPLACE FUNCTION public.get_user_tier(_user_id uuid)
RETURNS subscription_tier
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT subscription_tier
  FROM public.user_profiles
  WHERE id = _user_id
$$;

-- Create a function to upgrade user to pro
CREATE OR REPLACE FUNCTION public.upgrade_user_to_pro(_user_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.user_profiles 
  SET subscription_tier = 'pro', updated_at = now()
  WHERE id = _user_id
$$;

-- Add RLS policy for subscription management
CREATE POLICY "Users can view their own subscription tier" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own subscription tier" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);
