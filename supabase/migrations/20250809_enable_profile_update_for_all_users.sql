-- Allow all authenticated users to update their own profile in user_profiles
-- This policy allows both free and pro users to update their own profile data
CREATE POLICY "Users can update their own profile (free and pro)" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow all authenticated users to insert their own profile if not exists
CREATE POLICY "Users can insert their own profile (free and pro)" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
