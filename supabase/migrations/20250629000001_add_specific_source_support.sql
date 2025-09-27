
-- Add support for specific source scraping configurations

-- Add new columns to scraping_sources table for specific source configs
ALTER TABLE public.scraping_sources 
ADD COLUMN IF NOT EXISTS source_type VARCHAR(20) DEFAULT 'generic',
ADD COLUMN IF NOT EXISTS is_specific_source BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS source_identifier VARCHAR(50),
ADD COLUMN IF NOT EXISTS pagination_config JSONB,
ADD COLUMN IF NOT EXISTS request_config JSONB;

-- Create index for faster specific source lookups
CREATE INDEX IF NOT EXISTS idx_scraping_sources_specific 
ON public.scraping_sources(source_identifier) 
WHERE is_specific_source = true;

-- Insert configurations for specific sources
INSERT INTO public.scraping_sources (
  name, url, source_type, is_specific_source, source_identifier,
  selector_config, category_mapping, pagination_config, request_config,
  scraping_frequency, success_rate, is_active
) VALUES 
(
  'UN Careers',
  'https://careers.un.org/lbw/Home.aspx',
  'specific',
  true,
  'un-careers',
  '{
    "container": ".job-listing, .vacancy-item",
    "title": "h3 a, .job-title a",
    "description": ".job-summary, .vacancy-summary",
    "deadline": ".deadline, .closing-date",
    "location": ".location, .duty-station",
    "link": "h3 a, .job-title a"
  }',
  '{
    "default_category": "jobs",
    "keywords": {
      "fellowship": "fellowships",
      "internship": "internships",
      "scholarship": "scholarships"
    }
  }',
  '{
    "type": "click",
    "maxPages": 10,
    "waitTime": 2000
  }',
  '{
    "delay": 3000,
    "retries": 3,
    "headers": {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
  }',
  24,
  85,
  true
),
(
  'UNICEF Careers',
  'https://www.unicef.org/careers/search',
  'specific',
  true,
  'unicef-careers',
  '{
    "container": ".job-card, .vacancy-listing",
    "title": ".job-title, h3",
    "description": ".job-description, .summary",
    "deadline": ".application-deadline, .closes",
    "location": ".job-location, .location",
    "link": "a"
  }',
  '{
    "default_category": "jobs",
    "keywords": {
      "fellowship": "fellowships",
      "internship": "internships"
    }
  }',
  '{
    "type": "url",
    "maxPages": 15,
    "waitTime": 1500
  }',
  '{
    "delay": 2000,
    "retries": 2
  }',
  24,
  80,
  true
),
(
  'DAAD Scholarships',
  'https://www.daad.de/en/find-funding/',
  'specific',
  true,
  'daad',
  '{
    "container": ".funding-item, .scholarship-item",
    "title": ".funding-title, h3",
    "description": ".funding-description, .summary",
    "deadline": ".application-deadline, .deadline",
    "location": ".country, .location",
    "link": "a"
  }',
  '{
    "default_category": "scholarships",
    "keywords": {
      "research": "fellowships",
      "fellowship": "fellowships"
    }
  }',
  '{
    "type": "url",
    "maxPages": 20,
    "waitTime": 1500
  }',
  '{
    "delay": 2000,
    "retries": 2
  }',
  168,
  90,
  true
),
(
  'MasterCard Foundation',
  'https://mastercardfdn.org/all-programs/',
  'specific',
  true,
  'mastercard-foundation',
  '{
    "container": ".program-item, .opportunity",
    "title": ".program-title, h3",
    "description": ".program-summary, .description",
    "deadline": ".application-deadline, .deadline",
    "location": ".location, .region",
    "link": "a"
  }',
  '{
    "default_category": "scholarships",
    "keywords": {
      "fellowship": "fellowships",
      "leadership": "fellowships"
    }
  }',
  '{
    "type": "scroll",
    "maxPages": 6,
    "waitTime": 2500
  }',
  '{
    "delay": 2500,
    "retries": 3
  }',
  168,
  88,
  true
)
ON CONFLICT (url) DO UPDATE SET
  source_type = EXCLUDED.source_type,
  is_specific_source = EXCLUDED.is_specific_source,
  source_identifier = EXCLUDED.source_identifier,
  pagination_config = EXCLUDED.pagination_config,
  request_config = EXCLUDED.request_config,
  updated_at = now();

-- Add function to trigger specific source scraping
CREATE OR REPLACE FUNCTION trigger_specific_source_scraping(source_ids text[] DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function can be called to trigger specific source scraping
  -- Implementation would call the edge function with specific parameters
  RETURN json_build_object(
    'message', 'Specific source scraping triggered',
    'sources', COALESCE(array_length(source_ids, 1), 0)
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION trigger_specific_source_scraping TO authenticated;

-- Update RLS policies if needed
ALTER TABLE public.scraping_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow authenticated users to view scraping sources"
  ON public.scraping_sources FOR SELECT
  TO authenticated
  USING (true);
