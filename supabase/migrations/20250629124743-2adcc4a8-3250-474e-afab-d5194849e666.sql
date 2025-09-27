
-- Create table for bulk scraping configurations
CREATE TABLE public.bulk_scraping_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  websites JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for bulk scraping jobs
CREATE TABLE public.bulk_scraping_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id UUID NOT NULL REFERENCES bulk_scraping_configs(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  total_jobs_found INTEGER DEFAULT 0,
  total_jobs_published INTEGER DEFAULT 0,
  errors_count INTEGER DEFAULT 0,
  results JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bulk_scraping_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_scraping_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage bulk scraping configs" ON public.bulk_scraping_configs
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff_admin'));

CREATE POLICY "Admins can view bulk scraping jobs" ON public.bulk_scraping_jobs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff_admin'));

CREATE POLICY "System can manage bulk scraping jobs" ON public.bulk_scraping_jobs
  FOR ALL USING (true);

-- Create indexes
CREATE INDEX idx_bulk_scraping_jobs_config ON public.bulk_scraping_jobs(config_id, created_at DESC);
CREATE INDEX idx_bulk_scraping_jobs_status ON public.bulk_scraping_jobs(status, created_at DESC);

-- Insert default configurations
INSERT INTO public.bulk_scraping_configs (name, description, websites) VALUES
('Remote Development Jobs', 'Scrape remote development job listings from popular job boards', 
 '[
   {
     "name": "RemoteOK",
     "url": "https://remoteok.com/remote-dev-jobs",
     "type": "remoteok",
     "selectors": {
       "container": ".job",
       "title": ".position",
       "company": ".company",
       "location": ".location",
       "tags": ".tags span",
       "date": ".time",
       "url": "a",
       "description": ".markdown"
     }
   },
   {
     "name": "We Work Remotely",
     "url": "https://weworkremotely.com/categories/remote-programming-jobs",
     "type": "weworkremotely",
     "selectors": {
       "container": ".jobs li",
       "title": ".title",
       "company": ".company",
       "location": ".region",
       "tags": ".tags .tag",
       "date": ".date",
       "url": "a",
       "description": ".company-card"
     }
   }
 ]');
