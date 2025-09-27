
-- Create table for scraping sources configuration
CREATE TABLE public.scraping_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  selector_config JSONB NOT NULL DEFAULT '{}',
  category_mapping JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  scraping_frequency INTEGER NOT NULL DEFAULT 24, -- hours
  last_scraped_at TIMESTAMP WITH TIME ZONE,
  success_rate DECIMAL(5,2) DEFAULT 100.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for scraping jobs tracking
CREATE TABLE public.scraping_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID NOT NULL REFERENCES scraping_sources(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  opportunities_found INTEGER DEFAULT 0,
  opportunities_published INTEGER DEFAULT 0,
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for duplicate detection using vector embeddings
CREATE TABLE public.opportunity_embeddings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  title_embedding vector(1536),
  description_embedding vector(1536),
  combined_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for scraping analytics
CREATE TABLE public.scraping_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  source_name TEXT NOT NULL,
  opportunities_scraped INTEGER NOT NULL DEFAULT 0,
  opportunities_published INTEGER NOT NULL DEFAULT 0,
  duplicates_detected INTEGER NOT NULL DEFAULT 0,
  errors_count INTEGER NOT NULL DEFAULT 0,
  avg_processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(date, source_name)
);

-- Enable RLS on all new tables
ALTER TABLE public.scraping_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraping_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraping_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scraping_sources
CREATE POLICY "Admins can manage scraping sources" ON public.scraping_sources
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff_admin'));

CREATE POLICY "Everyone can read active scraping sources" ON public.scraping_sources
  FOR SELECT USING (is_active = true);

-- RLS Policies for scraping_jobs
CREATE POLICY "Admins can view scraping jobs" ON public.scraping_jobs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff_admin'));

CREATE POLICY "System can create scraping jobs" ON public.scraping_jobs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update scraping jobs" ON public.scraping_jobs
  FOR UPDATE USING (true);

-- RLS Policies for opportunity_embeddings
CREATE POLICY "System can manage opportunity embeddings" ON public.opportunity_embeddings
  FOR ALL USING (true);

-- RLS Policies for scraping_analytics
CREATE POLICY "Admins can view scraping analytics" ON public.scraping_analytics
  FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff_admin'));

CREATE POLICY "System can manage scraping analytics" ON public.scraping_analytics
  FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_scraping_sources_active ON public.scraping_sources(is_active, last_scraped_at);
CREATE INDEX idx_scraping_jobs_status ON public.scraping_jobs(status, created_at);
CREATE INDEX idx_scraping_jobs_source ON public.scraping_jobs(source_id, created_at DESC);
CREATE INDEX idx_opportunity_embeddings_hash ON public.opportunity_embeddings(combined_hash);
CREATE INDEX idx_opportunity_embeddings_opportunity ON public.opportunity_embeddings(opportunity_id);
CREATE INDEX idx_scraping_analytics_date ON public.scraping_analytics(date DESC);

-- Insert default scraping sources configuration
INSERT INTO public.scraping_sources (name, url, selector_config, category_mapping) VALUES
('UN Careers', 'https://careers.un.org/lbw/home.aspx?viewtype=SC', 
 '{"title": ".job-title", "description": ".job-description", "deadline": ".application-deadline", "link": ".apply-link"}',
 '{"default_category": "Jobs", "keywords": {"scholarship": "Scholarships", "fellowship": "Fellowships", "internship": "Internships"}}'),

('UNICEF Careers', 'https://www.unicef.org/careers/', 
 '{"title": ".position-title", "description": ".position-summary", "deadline": ".closing-date", "link": ".application-url"}',
 '{"default_category": "Jobs", "keywords": {"intern": "Internships", "consultant": "Jobs"}}'),

('World Bank Jobs', 'https://jobs.worldbank.org/en/jobs', 
 '{"title": ".job-title", "description": ".job-summary", "deadline": ".application-deadline", "link": ".apply-button"}',
 '{"default_category": "Jobs", "keywords": {"young professional": "Fellowships", "internship": "Internships"}}'),

('African Union', 'https://au.int/en/jobs', 
 '{"title": ".vacancy-title", "description": ".vacancy-description", "deadline": ".deadline-date", "link": ".apply-link"}',
 '{"default_category": "Jobs", "keywords": {"fellowship": "Fellowships", "scholarship": "Scholarships"}}'),

('UNESCO Careers', 'https://careers.unesco.org/', 
 '{"title": ".position-title", "description": ".job-description", "deadline": ".application-deadline", "link": ".apply-now"}',
 '{"default_category": "Jobs", "keywords": {"fellowship": "Fellowships", "internship": "Internships"}}'),

('DAAD Scholarships', 'https://www.daad.de/en/study-and-research-in-germany/scholarships/', 
 '{"title": ".scholarship-title", "description": ".program-description", "deadline": ".application-deadline", "link": ".application-link"}',
 '{"default_category": "Scholarships", "keywords": {"research": "Fellowships", "study": "Scholarships"}}'),

('Mastercard Foundation', 'https://mastercardfdn.org/all-scholarships/', 
 '{"title": ".scholarship-name", "description": ".program-details", "deadline": ".deadline", "link": ".learn-more"}',
 '{"default_category": "Scholarships", "keywords": {"leadership": "Fellowships", "scholars": "Scholarships"}}'),

('Commonwealth Scholarships', 'https://cscuk.fcdo.gov.uk/scholarships/', 
 '{"title": ".award-title", "description": ".award-description", "deadline": ".closing-date", "link": ".how-to-apply"}',
 '{"default_category": "Scholarships", "keywords": {"fellowship": "Fellowships", "scholarship": "Scholarships"}}'),

('Chevron Careers', 'https://www.chevron.com/careers/', 
 '{"title": ".job-title", "description": ".job-summary", "deadline": ".application-close", "link": ".apply-button"}',
 '{"default_category": "Jobs", "keywords": {"internship": "Internships", "graduate": "Jobs"}}'),

('Google Careers', 'https://careers.google.com/jobs/', 
 '{"title": ".job-title", "description": ".job-description", "deadline": ".application-deadline", "link": ".apply-link"}',
 '{"default_category": "Jobs", "keywords": {"internship": "Internships", "fellowship": "Fellowships", "scholarship": "Scholarships"}}'
);

-- Create function to automatically expire opportunities past deadline
CREATE OR REPLACE FUNCTION expire_past_deadline_opportunities()
RETURNS void AS $$
BEGIN
  UPDATE public.opportunities 
  SET is_published = false, 
      updated_at = now()
  WHERE application_deadline < now() 
    AND is_published = true 
    AND source = 'scraped';
END;
$$ LANGUAGE plpgsql;

-- Create function to update scraping analytics
CREATE OR REPLACE FUNCTION update_scraping_analytics(
  p_source_name TEXT,
  p_scraped INTEGER,
  p_published INTEGER,
  p_duplicates INTEGER,
  p_errors INTEGER,
  p_processing_time INTEGER
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.scraping_analytics (
    date, source_name, opportunities_scraped, opportunities_published, 
    duplicates_detected, errors_count, avg_processing_time_ms
  ) VALUES (
    CURRENT_DATE, p_source_name, p_scraped, p_published, 
    p_duplicates, p_errors, p_processing_time
  )
  ON CONFLICT (date, source_name) 
  DO UPDATE SET
    opportunities_scraped = scraping_analytics.opportunities_scraped + p_scraped,
    opportunities_published = scraping_analytics.opportunities_published + p_published,
    duplicates_detected = scraping_analytics.duplicates_detected + p_duplicates,
    errors_count = scraping_analytics.errors_count + p_errors,
    avg_processing_time_ms = (COALESCE(scraping_analytics.avg_processing_time_ms, 0) + p_processing_time) / 2,
    created_at = now();
END;
$$ LANGUAGE plpgsql;
