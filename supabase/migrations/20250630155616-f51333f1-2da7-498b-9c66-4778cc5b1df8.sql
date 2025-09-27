
-- Create application_details table to store detailed application data
CREATE TABLE IF NOT EXISTS public.application_details (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    opportunity_id uuid REFERENCES public.opportunities(id) ON DELETE CASCADE NOT NULL,
    opportunity_title text NOT NULL,
    organization text NOT NULL,
    cover_letter text NOT NULL,
    resume_filename text,
    additional_documents text[],
    applied_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.application_details ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own application details" ON public.application_details
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own application details" ON public.application_details
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all application details" ON public.application_details
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'staff_admin')
        )
    );

-- Create indexes
CREATE INDEX idx_application_details_user_id ON public.application_details(user_id);
CREATE INDEX idx_application_details_opportunity_id ON public.application_details(opportunity_id);
CREATE INDEX idx_application_details_applied_at ON public.application_details(applied_at);
