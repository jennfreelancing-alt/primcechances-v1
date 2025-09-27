
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JobListing {
  title: string;
  company: string;
  location?: string;
  tags: string[];
  postedDate?: string;
  jobUrl: string;
  description?: string;
  source: string;
}

// Fetch the full job description from the detail page using common selectors per site
async function fetchFullJobDescription(jobUrl: string, website: any): Promise<string | null> {
  try {
    if (!jobUrl) return null;

    // Normalize to absolute URL
    let targetUrl = jobUrl;
    try {
      // If relative, construct with base origin
      if (!/^https?:\/\//i.test(jobUrl)) {
        const base = new URL(website.url);
        targetUrl = new URL(jobUrl, base.origin).href;
      }
    } catch (_e) {
      // ignore URL normalization errors; keep original
    }

    console.log(`Fetching full description from: ${targetUrl}`);

    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });
    if (!res.ok) {
      console.warn(`Failed to fetch ${targetUrl}: ${res.status} ${res.statusText}`);
      return null;
    }

    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    if (!doc) return null;

    // Site-specific selectors based on the website type/name
    let selectorsToTry: string[] = [];

    if (website.name === 'RemoteOK' || website.type === 'remoteok') {
      selectorsToTry = [
        '.description[itemprop="description"]', // Main description container (found in analysis)
        '.description', // Fallback description container
        '[itemprop="description"]', // Schema.org description
        '.markdown', // Markdown content
        '.job-description', // Job description
        '.content', // General content
        'article', // Article tag
        '.job-details', // Job details
        '.job-content', // Job content
        '[data-testid="job-description"]', // Test ID selector
        '.description-content', // Description content
        'main .description', // Main description
        'main .markdown', // Main markdown
        '.job-listing .description', // Job listing description
        '.job-listing .markdown' // Job listing markdown
      ];
    } else if (website.name === 'We Work Remotely' || website.type === 'weworkremotely') {
      selectorsToTry = [
        '.company-card',
        '.job-description',
        '.description',
        '.content',
        'article',
        '.job-details',
        '.company-description'
      ];
    } else {
      // Generic selectors for other sites
      selectorsToTry = [
        '.description',
        '.markdown',
        '[itemprop="description"]',
        'article',
        '.job-description',
        '.content',
        '#content',
        'main',
        '.job-details',
        '.job-content',
        '.company-description'
      ];
    }

    // Allow site-specific overrides via config if provided
    const detailSelectors: string[] = website.selectors?.detailDescription
      ? (Array.isArray(website.selectors.detailDescription)
          ? website.selectors.detailDescription
          : [website.selectors.detailDescription])
      : [];

    const allSelectors = [...detailSelectors, ...selectorsToTry];

    console.log(`Trying ${allSelectors.length} selectors for ${website.name}`);

    for (const sel of allSelectors) {
      const el = doc.querySelector(sel);
      if (el) {
        const text = el.textContent?.trim() || '';
        const cleanText = cleanDescriptionText(text);
        
        // Ensure it's substantial content; otherwise continue trying
        if (cleanText.length > 200) {
          console.log(`Found description with selector '${sel}': ${cleanText.length} characters`);
          return cleanText.slice(0, 10000); // Increased limit for full descriptions
        }
      }
    }

    // Enhanced fallback: try to extract structured content
    const fallbackSelectors = [
      'main',
      'article',
      '.main-content',
      '.content-wrapper',
      '.job-page',
      '.job-detail',
      '.posting-content'
    ];

    for (const sel of fallbackSelectors) {
      const container = doc.querySelector(sel);
      if (container) {
        // Remove unwanted elements 
        const unwanted = container.querySelectorAll('script, style, nav, header, footer, aside, .advertisement, .ads, .sidebar');
        unwanted.forEach(el => el.remove());

        // Get all text content
        const text = container.textContent?.trim() || '';
        const cleanText = cleanDescriptionText(text);
        
        if (cleanText.length > 300) {
          console.log(`Found fallback description with selector '${sel}': ${cleanText.length} characters`);
          return cleanText.slice(0, 10000);
        }
      }
    }

    // Final fallback: aggregate multiple paragraphs
    const paraNodes = doc.querySelectorAll('p') as any;
    const paragraphs = Array.from(paraNodes as any[])
      .map((p: any) => p?.textContent?.trim() || '')
      .filter(p => p.length > 20); // Only include substantial paragraphs
    
    if (paragraphs.length > 0) {
      const combined = paragraphs.join('\n\n');
      const cleanText = cleanDescriptionText(combined);
      if (cleanText.length > 200) {
        console.log(`Found description from paragraphs: ${cleanText.length} characters`);
        return cleanText.slice(0, 10000);
      }
    }

    console.warn(`No substantial description found for ${targetUrl}`);
    return null;
  } catch (err) {
    console.warn('fetchFullJobDescription error:', err);
    return null;
  }
}

function cleanDescriptionText(text: string): string {
  return text
    .replace(/\u00a0/g, ' ') // nbsp
    .replace(/\u2019/g, "'") // smart apostrophe
    .replace(/\u2018/g, "'") // smart apostrophe
    .replace(/\u201c/g, '"') // smart quote
    .replace(/\u201d/g, '"') // smart quote
    .replace(/\u2013/g, '-') // en dash
    .replace(/\u2014/g, '--') // em dash
    .replace(/\s+\n/g, '\n')
    .replace(/\n\s+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{2,}/g, ' ') // multiple spaces to single space
    .replace(/^\s*[-•]\s*/gm, '• ') // normalize bullet points
    .replace(/\n\s*[-•]\s*/g, '\n• ') // normalize bullet points
    .trim();
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    console.log('Request body:', body);
    const { config_id, action, update_all, limit } = body;

    // Handle test action
    if (action === 'test') {
      return new Response(
        JSON.stringify({ message: 'Function is working!', received: body }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle update_descriptions action
    if (action === 'update_descriptions') {
      console.log('Handling update_descriptions action with params:', { update_all, limit });
      return await updateExistingOpportunities(supabase, update_all, limit);
    }

    // If no action specified, return error
    if (!action) {
      return new Response(
        JSON.stringify({ error: 'action parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!config_id) {
      return new Response(
        JSON.stringify({ error: 'config_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get scraping configuration
    const { data: config, error: configError } = await supabase
      .from('bulk_scraping_configs')
      .select('*')
      .eq('id', config_id)
      .single();

    if (configError || !config) {
      return new Response(
        JSON.stringify({ error: 'Configuration not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create job record
    const { data: job, error: jobError } = await supabase
      .from('bulk_scraping_jobs')
      .insert({
        config_id,
        status: 'running',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (jobError || !job) {
      return new Response(
        JSON.stringify({ error: 'Failed to create job record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Start background scraping
    EdgeRuntime.waitUntil(performBulkScraping(supabase, job.id, config));

    return new Response(
      JSON.stringify({ 
        message: 'Bulk scraping job started',
        job_id: job.id,
        status: 'running'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Bulk scraping error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function performBulkScraping(supabase: any, jobId: string, config: any) {
  let totalFound = 0;
  let totalPublished = 0;
  let totalErrors = 0;
  const results: any = {};

  try {
    console.log(`Starting bulk scraping for config: ${config.name}`);

    for (const website of config.websites) {
      console.log(`Scraping ${website.name} at ${website.url}`);
      
      try {
        const jobs = await scrapeWebsite(website);
        const published = await publishJobs(supabase, jobs, website.name);
        
        totalFound += jobs.length;
        totalPublished += published;
        
        results[website.name] = {
          found: jobs.length,
          published: published,
          status: 'completed'
        };
        
        console.log(`${website.name}: Found ${jobs.length}, Published ${published}`);
        
      } catch (error) {
        console.error(`Error scraping ${website.name}:`, error);
        totalErrors++;
        results[website.name] = {
          found: 0,
          published: 0,
          status: 'failed',
          error: error.message
        };
      }
    }

    // Update job completion
    await supabase
      .from('bulk_scraping_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        total_jobs_found: totalFound,
        total_jobs_published: totalPublished,
        errors_count: totalErrors,
        results: results
      })
      .eq('id', jobId);

    console.log(`Bulk scraping completed: ${totalFound} found, ${totalPublished} published`);

  } catch (error) {
    console.error('Bulk scraping failed:', error);
    
    await supabase
      .from('bulk_scraping_jobs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: error.message,
        results: results
      })
      .eq('id', jobId);
  }
}

async function scrapeWebsite(website: any): Promise<JobListing[]> {
  const response = await fetch(website.url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  
  if (!doc) {
    throw new Error('Failed to parse HTML');
  }

  const jobs: JobListing[] = [];
  const containers = doc.querySelectorAll(website.selectors.container);

  containers.forEach(container => {
    try {
      const job = extractJobFromContainer(container, website);
      if (job && job.title && job.company) {
        jobs.push(job);
      }
    } catch (error) {
      console.warn('Error extracting job:', error);
    }
  });

  // Enrich each job by fetching its detail page to get the full description
  const enrichedJobs: JobListing[] = [];
  for (const job of jobs) {
    try {
      console.log(`Enriching job: ${job.title} at ${job.company}`);
      const fullDesc = await fetchFullJobDescription(job.jobUrl, website);
      if (fullDesc && fullDesc.length > (job.description?.length || 0)) {
        job.description = fullDesc;
        console.log(`Enhanced description for ${job.title}: ${fullDesc.length} characters`);
      } else if (fullDesc) {
        job.description = fullDesc;
        console.log(`Used full description for ${job.title}: ${fullDesc.length} characters`);
      } else {
        console.log(`No enhanced description found for ${job.title}, keeping original`);
      }
    } catch (e) {
      console.warn(`Failed to fetch detail page for ${job.jobUrl}:`, e);
    }
    enrichedJobs.push(job);
    // Small delay to be polite to source websites
    await delay(500); // Increased delay to be more respectful
  }

  return enrichedJobs;
}

function extractJobFromContainer(container: any, website: any): JobListing | null {
  const selectors = website.selectors;
  
  const titleEl = container.querySelector(selectors.title);
  const companyEl = container.querySelector(selectors.company);
  const locationEl = container.querySelector(selectors.location);
  const dateEl = container.querySelector(selectors.date);
  const urlEl = container.querySelector(selectors.url);
  const descEl = container.querySelector(selectors.description);
  
  if (!titleEl || !companyEl) {
    return null;
  }

  const title = titleEl.textContent?.trim();
  const company = companyEl.textContent?.trim();
  
  if (!title || !company) {
    return null;
  }

  // Extract tags
  const tags: string[] = [];
  const tagElements = container.querySelectorAll(selectors.tags);
  tagElements.forEach((tagEl: any) => {
    const tag = tagEl.textContent?.trim();
    if (tag) tags.push(tag);
  });

  // Build job URL
  let jobUrl = '';
  if (urlEl) {
    const href = urlEl.getAttribute('href');
    if (href) {
      jobUrl = href.startsWith('http') ? href : `${new URL(website.url).origin}${href}`;
    }
  }

  return {
    title,
    company,
    location: locationEl?.textContent?.trim(),
    tags,
    postedDate: dateEl?.textContent?.trim() || 'Just posted',
    jobUrl: jobUrl || website.url,
    description: descEl?.textContent?.trim()?.substring(0, 1000),
    source: website.name
  };
}

async function publishJobs(supabase: any, jobs: JobListing[], source: string): Promise<number> {
  let published = 0;
  
  console.log(`Starting to publish ${jobs.length} jobs from ${source}`);
  
  // Get or create default category for jobs
  let { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('name', 'jobs')
    .single();

  // If no 'jobs' category exists, try to get any active category
  if (!category) {
    const { data: categories } = await supabase
      .from('categories')
      .select('id')
      .eq('is_active', true)
      .limit(1);
    
    category = categories?.[0];
  }

  // If still no category, create one
  if (!category) {
    console.log('No categories found, creating default category');
    const { data: newCategory, error: categoryError } = await supabase
      .from('categories')
      .insert({
        name: 'jobs',
        description: 'Job opportunities',
        is_active: true
      })
      .select('id')
      .single();
    
    if (categoryError) {
      console.error('Failed to create category:', categoryError);
      return 0;
    }
    
    category = newCategory;
  }

  const categoryId = category.id;
  console.log(`Using category ID: ${categoryId}`);

  for (const job of jobs) {
    try {
      console.log(`Processing job: ${job.title} at ${job.company}`);

      // Check for existing records (potential duplicates)
      const { data: existing } = await supabase
        .from('opportunities')
        .select('id, description, metadata')
        .ilike('title', `%${job.title.substring(0, 50)}%`)
        .ilike('organization', `%${job.company.substring(0, 30)}%`)
        .limit(1);

      // Create a more comprehensive description (fallback if none from detail page)
      const composedDescription = job.description ||
        `${job.title} position at ${job.company}. ` +
        `Location: ${job.location || 'Remote/Not specified'}. ` +
        `Tags: ${job.tags.join(', ') || 'None specified'}.`;

      if (existing && existing.length > 0) {
        const existingItem = existing[0] as any;
        const currentLen = (existingItem.description || '').length;
        const newLen = (composedDescription || '').length;
        if (newLen > currentLen + 50) { // update only if it's meaningfully longer
          const { error: updateErr } = await supabase
            .from('opportunities')
            .update({
              description: composedDescription,
              location: job.location || 'Remote',
              source_url: job.jobUrl,
              application_url: job.jobUrl,
              tags: job.tags.length > 0 ? job.tags : null,
              updated_at: new Date().toISOString(),
              metadata: {
                ...((existingItem && existingItem.metadata) ? existingItem.metadata : {}),
                source_website: source,
                posted_date: job.postedDate,
                last_rescraped_at: new Date().toISOString()
              }
            })
            .eq('id', existingItem.id);
          if (updateErr) {
            console.warn(`Failed to update existing job ${job.title}:`, updateErr);
          } else {
            console.log(`Updated description for existing job: ${job.title}`);
          }
        } else {
          console.log(`Skipping update; existing description is similar/longer: ${job.title}`);
        }
        continue;
      }

      // Insert new opportunity
      const { data: insertedJob, error } = await supabase
        .from('opportunities')
        .insert({
          title: job.title,
          description: composedDescription,
          organization: job.company,
          location: job.location || 'Remote',
          application_url: job.jobUrl,
          source_url: job.jobUrl,
          category_id: categoryId,
          source: 'bulk_scraped',
          is_published: true,
          published_at: new Date().toISOString(),
          tags: job.tags.length > 0 ? job.tags : null,
          status: 'approved',
          metadata: {
            source_website: source,
            posted_date: job.postedDate,
            scraped_at: new Date().toISOString()
          }
        })
        .select('id');

      if (error) {
        console.error(`Error publishing job ${job.title}:`, error);
      } else {
        published++;
        console.log(`Successfully published: ${job.title} at ${job.company} (ID: ${insertedJob?.[0]?.id})`);
      }
    } catch (error) {
      console.error(`Error processing job ${job.title}:`, error);
    }
  }

  console.log(`Finished publishing: ${published} out of ${jobs.length} jobs from ${source}`);
  return published;
}

// Function to update existing opportunities with full descriptions
async function updateExistingOpportunities(supabase: any, updateAll: boolean = false, limit: number = 10) {
  console.log(`Starting update of existing opportunities. Update all: ${updateAll}, Limit: ${limit}`);

  try {
    console.log('Creating Supabase query...');
    let query = supabase
      .from('opportunities')
      .select('id, title, description, source_url, application_url, organization')
      .eq('status', 'approved')
      .or('source.eq.scraped,source.eq.bulk_scraped');

    if (!updateAll) {
      // Only update opportunities with short descriptions (less than 200 characters)
      query = query.or('description.lt.200,description.is.null');
    }

    query = query.limit(limit);

    console.log('Executing query...');
    const { data: opportunities, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching opportunities:', fetchError);
      return new Response(
        JSON.stringify({ error: `Database query failed: ${fetchError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!opportunities || opportunities.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No opportunities to update', total: 0, updated: 0, errors: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let updatedCount = 0;
    let errorCount = 0;

    for (const opp of opportunities) {
      console.log(`Processing opportunity: ${opp.title} (ID: ${opp.id})`);
      try {
        const fullDescription = await fetchFullDescriptionFromSource(opp.source_url || opp.application_url);

        if (fullDescription && fullDescription.length > (opp.description?.length || 0)) {
          const { error: updateError } = await supabase
            .from('opportunities')
            .update({ description: fullDescription, updated_at: new Date().toISOString() })
            .eq('id', opp.id);

          if (updateError) {
            console.error(`Error updating opportunity ${opp.id}:`, updateError);
            errorCount++;
          } else {
            updatedCount++;
            console.log(`Successfully updated description for opportunity ${opp.id}`);
          }
        } else {
          console.log(`No longer description found or description already sufficient for ${opp.id}`);
        }
      } catch (processError) {
        console.error(`Error processing opportunity ${opp.id}:`, processError);
        errorCount++;
      }
      await delay(500); // Be polite to source websites
    }

    return new Response(
      JSON.stringify({
        message: 'Update completed',
        total: opportunities.length,
        updated: updatedCount,
        errors: errorCount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Update existing opportunities error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

// Function to fetch full description from source URL
async function fetchFullDescriptionFromSource(url: string): Promise<string | null> {
  if (!url) return null;

  console.log(`Attempting to fetch full description from: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      signal: AbortSignal.timeout(20000) // 20 second timeout
    });

    if (!response.ok) {
      console.warn(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
      return null;
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    if (!doc) {
      return null;
    }

    let selectorsToTry: string[] = [];

    if (url.includes('remoteok.com')) {
      selectorsToTry = [
        '.description[itemprop="description"]',
        '.description',
        '[itemprop="description"]',
        '.markdown',
        '.job-description',
        '.content',
        'article',
        '.job-details',
        '.job-content',
        '[data-testid="job-description"]',
        '.description-content',
        'main .description',
        'main .markdown'
      ];
    } else if (url.includes('weworkremotely.com')) {
      selectorsToTry = [
        '.company-card',
        '.job-description',
        '.description',
        '.content',
        'article',
        '.job-details',
        '.company-description'
      ];
    } else {
      // Generic selectors
      selectorsToTry = [
        '.description',
        '.markdown',
        '[itemprop="description"]',
        'article',
        '.job-description',
        '.content',
        '#content',
        'main',
        '.job-details',
        '.job-content'
      ];
    }

    for (const selector of selectorsToTry) {
      const el = doc.querySelector(selector);
      if (el) {
        const text = el.textContent?.trim() || '';
        const cleanText = cleanDescriptionText(text);

        if (cleanText.length > 200) {
          console.log(`Found full description with selector '${selector}': ${cleanText.length} characters`);
          return cleanText.slice(0, 10000);
        }
      }
    }

    // Fallback: try to extract from main content area
    const mainEl = doc.querySelector('main, article, .main-content, .content-wrapper');
    if (mainEl) {
      const unwanted = mainEl.querySelectorAll('script, style, nav, header, footer, aside, .advertisement, .ads, .sidebar');
      unwanted.forEach(el => el.remove());

      const text = mainEl.textContent?.trim() || '';
      const cleanText = cleanDescriptionText(text);

      if (cleanText.length > 300) {
        console.log(`Found fallback description: ${cleanText.length} characters`);
        return cleanText.slice(0, 10000);
      }
    }

    // Final fallback: aggregate multiple paragraphs
    const paraNodes = doc.querySelectorAll('p') as any;
    const paragraphs = Array.from(paraNodes as any[])
      .map((p: any) => p?.textContent?.trim() || '')
      .filter(p => p.length > 20);

    if (paragraphs.length > 0) {
      const combined = paragraphs.join('\n\n');
      const cleanText = cleanDescriptionText(combined);
      if (cleanText.length > 200) {
        console.log(`Found description from paragraphs: ${cleanText.length} characters`);
        return cleanText.slice(0, 10000);
      }
    }

    console.warn(`No substantial description found for ${url}`);
    return null;

  } catch (error) {
    console.warn(`Error fetching full description from ${url}:`, error);
    return null;
  }
}

// Helper function to clean description text
function cleanDescriptionText(text: string): string {
  return text
    .replace(/\u00a0/g, ' ') // nbsp
    .replace(/\u2019/g, "'") // smart apostrophe
    .replace(/\u2018/g, "'") // smart apostrophe
    .replace(/\u201c/g, '"') // smart quote
    .replace(/\u201d/g, '"') // smart quote
    .replace(/\u2013/g, '-') // en dash
    .replace(/\u2014/g, '--') // em dash
    .replace(/\s+\n/g, '\n')
    .replace(/\n\s+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{2,}/g, ' ') // multiple spaces to single space
    .replace(/^\s*[-•]\s*/gm, '• ') // normalize bullet points
    .replace(/\n\s*[-•]\s*/g, '\n• ') // normalize bullet points
    .trim();
}

// Helper function for delays
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
