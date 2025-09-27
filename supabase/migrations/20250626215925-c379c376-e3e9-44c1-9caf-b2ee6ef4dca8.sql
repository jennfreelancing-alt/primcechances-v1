
-- Create a function to check if an email is in the admin list
CREATE OR REPLACE FUNCTION public.is_admin_email(email_address TEXT, admin_emails_list TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    email_array TEXT[];
    admin_email TEXT;
BEGIN
    -- Split the comma-separated admin emails into an array
    email_array := string_to_array(admin_emails_list, ',');
    
    -- Check if the email exists in the admin list (case insensitive)
    FOREACH admin_email IN ARRAY email_array
    LOOP
        IF TRIM(LOWER(admin_email)) = LOWER(email_address) THEN
            RETURN TRUE;
        END IF;
    END LOOP;
    
    RETURN FALSE;
END;
$$;

-- Update the handle_new_user function to include admin role assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    admin_emails TEXT;
BEGIN
    -- Insert the user profile
    INSERT INTO public.user_profiles (id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''));
    
    -- Always assign the basic 'user' role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    -- Get admin emails from a hypothetical settings table or use a default
    -- This will be handled by the Edge Function instead
    
    RETURN NEW;
END;
$$;
