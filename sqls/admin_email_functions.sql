    -- Create function to get user emails for admins
    CREATE OR REPLACE FUNCTION public.get_user_emails_for_admin()
    RETURNS TABLE (
    user_id UUID,
    email TEXT,
    full_name TEXT,
    created_at TIMESTAMPTZ
    )
    LANGUAGE SQL
    SECURITY DEFINER
    AS $$
    SELECT 
        u.id as user_id,
        u.email,
        up.full_name,
        u.created_at
    FROM auth.users u
    LEFT JOIN public.user_profiles up ON u.id = up.id
    WHERE public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff_admin')
    ORDER BY u.created_at DESC;
    $$;

    -- Grant execute permission to authenticated users (function will check admin role internally)
    GRANT EXECUTE ON FUNCTION public.get_user_emails_for_admin() TO authenticated;

    -- Create a more comprehensive function to get user details including subscription info
    CREATE OR REPLACE FUNCTION public.get_admin_user_details()
    RETURNS TABLE (
    user_id UUID,
    email TEXT,
    full_name TEXT,
    subscription_tier TEXT,
    created_at TIMESTAMPTZ,
    last_sign_in TIMESTAMPTZ,
    is_active BOOLEAN
    )
    LANGUAGE SQL
    SECURITY DEFINER
    AS $$
    SELECT 
        u.id as user_id,
        u.email,
        up.full_name,
        up.subscription_tier::TEXT,
        u.created_at,
        u.last_sign_in_at,
        u.confirmed_at IS NOT NULL as is_active
    FROM auth.users u
    LEFT JOIN public.user_profiles up ON u.id = up.id
    WHERE public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff_admin')
    ORDER BY u.created_at DESC;
    $$;

    -- Grant execute permission to authenticated users
    GRANT EXECUTE ON FUNCTION public.get_admin_user_details() TO authenticated; 