import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts"
import { SourceSpecificScraper } from './scrapers/SourceSpecificScraper.ts'
import { getAllSourceConfigs, getSourceConfig } from './sources/source-configs.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScrapingSource {
  id: string
  name: string
  url: string
  selector_config: any
  category_mapping: any
  scraping_frequency: number
  last_scraped_at?: string
  success_rate: number
}

interface ScrapedOpportunity {
  title: string
  description: string
  deadline?: string
  application_url?: string
  organization: string
  source_url: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { source_id, source_type, manual_trigger } = await req.json()

    console.log('Starting enhanced web scraping job', { source_id, source_type, manual_trigger })

    // Handle source-specific scraping
    if (source_type === 'specific' && source_id) {
      const sourceConfig = getSourceConfig(source_id);
      if (!sourceConfig) {
        return new Response(
          JSON.stringify({ error: `Unknown specific source: ${source_id}` }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      return await handleSpecificSourceScraping(sourceConfig, supabase);
    }

    // Handle multiple specific sources
    if (source_type === 'all_specific') {
      const sourceConfigs = getAllSourceConfigs();
      const results = [];

      for (const config of sourceConfigs) {
        try {
          const result = await scrapeSpecificSource(config, supabase);
          results.push(result);
          
          // Add delay between sources to be respectful
          await new Promise(resolve => setTimeout(resolve, 5000));
        } catch (error) {
          console.error(`Error scraping ${config.name}:`, error);
          results.push({
            source: config.name,
            error: error.message,
            scraped: 0,
            published: 0
          });
        }
      }

      return new Response(
        JSON.stringify({
          message: 'Specific source scraping completed',
          sources_processed: sourceConfigs.length,
          results
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get scraping source configuration
    let sourcesQuery = supabase
      .from('scraping_sources')
      .select('*')
      .eq('is_active', true)

    if (source_id) {
      sourcesQuery = sourcesQuery.eq('id', source_id)
    } else if (!manual_trigger) {
      const hoursAgo = new Date()
      hoursAgo.setHours(hoursAgo.getHours() - 24)
      sourcesQuery = sourcesQuery.or(`last_scraped_at.is.null,last_scraped_at.lt.${hoursAgo.toISOString()}`)
    }

    const { data: sources, error: sourcesError } = await sourcesQuery

    if (sourcesError) {
      console.error('Error fetching sources:', sourcesError)
      throw sourcesError
    }

    if (!sources || sources.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No sources to scrape', sources_processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Processing ${sources.length} scraping sources`)

    const results = []

    for (const source of sources) {
      const startTime = Date.now()
      console.log(`Starting enhanced scrape for: ${source.name}`)

      // Create scraping job record
      const { data: job, error: jobError } = await supabase
        .from('scraping_jobs')
        .insert({
          source_id: source.id,
          status: 'running',
          started_at: new Date().toISOString()
        })
        .select()
        .single()

      if (jobError) {
        console.error('Error creating job:', jobError)
        continue
      }

      try {
        // Check source health first
        const healthCheck = await checkSourceHealth(source)
        if (!healthCheck.healthy) {
          throw new Error(`Source health check failed: ${healthCheck.error}`)
        }

        const scrapedData = await scrapeSourceEnhanced(source)
        const processedOpportunities = await processOpportunities(scrapedData, source, supabase)
        
        const endTime = Date.now()
        const executionTime = endTime - startTime

        // Update job status
        await supabase
          .from('scraping_jobs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            opportunities_found: scrapedData.length,
            opportunities_published: processedOpportunities.published,
            execution_time_ms: executionTime
          })
          .eq('id', job.id)

        // Update source success rate
        const newSuccessRate = Math.min(100, source.success_rate * 0.9 + 10)
        await supabase
          .from('scraping_sources')
          .update({
            last_scraped_at: new Date().toISOString(),
            success_rate: newSuccessRate
          })
          .eq('id', source.id)

        // Update analytics
        await supabase.rpc('update_scraping_analytics', {
          p_source_name: source.name,
          p_scraped: scrapedData.length,
          p_published: processedOpportunities.published,
          p_duplicates: processedOpportunities.duplicates,
          p_errors: 0,
          p_processing_time: executionTime
        })

        results.push({
          source: source.name,
          scraped: scrapedData.length,
          published: processedOpportunities.published,
          duplicates: processedOpportunities.duplicates,
          execution_time: executionTime,
          health_status: 'healthy'
        })

        console.log(`Enhanced scrape completed for ${source.name}: ${scrapedData.length} found, ${processedOpportunities.published} published`)

      } catch (error) {
        console.error(`Error in enhanced scraping ${source.name}:`, error)
        
        // Update job with error
        await supabase
          .from('scraping_jobs')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: error.message
          })
          .eq('id', job.id)

        // Decrease source success rate
        const newSuccessRate = Math.max(0, source.success_rate * 0.8)
        await supabase
          .from('scraping_sources')
          .update({
            success_rate: newSuccessRate
          })
          .eq('id', source.id)

        // Update analytics with error
        await supabase.rpc('update_scraping_analytics', {
          p_source_name: source.name,
          p_scraped: 0,
          p_published: 0,
          p_duplicates: 0,
          p_errors: 1,
          p_processing_time: Date.now() - startTime
        })

        results.push({
          source: source.name,
          error: error.message,
          scraped: 0,
          published: 0,
          health_status: 'unhealthy'
        })
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Enhanced scraping completed',
        sources_processed: sources.length,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Enhanced scraping error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function handleSpecificSourceScraping(sourceConfig: any, supabase: any) {
  const startTime = Date.now()
  console.log(`Starting specific scrape for: ${sourceConfig.name}`)

  // Create scraping job record
  const { data: job, error: jobError } = await supabase
    .from('scraping_jobs')
    .insert({
      source_id: `specific_${sourceConfig.id}`,
      status: 'running',
      started_at: new Date().toISOString()
    })
    .select()
    .single()

  if (jobError) {
    console.error('Error creating job:', jobError)
    throw jobError
  }

  try {
    const result = await scrapeSpecificSource(sourceConfig, supabase);
    const executionTime = Date.now() - startTime

    // Update job status
    await supabase
      .from('scraping_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        opportunities_found: result.scraped,
        opportunities_published: result.published,
        execution_time_ms: executionTime
      })
      .eq('id', job.id)

    return new Response(
      JSON.stringify({
        message: `Specific source scraping completed for ${sourceConfig.name}`,
        result
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    // Update job with error
    await supabase
      .from('scraping_jobs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: error.message
      })
      .eq('id', job.id)

    throw error
  }
}

async function scrapeSpecificSource(sourceConfig: any, supabase: any) {
  const scraper = new SourceSpecificScraper(sourceConfig);
  const opportunities = await scraper.scrapeOpportunities();
  
  const processedOpportunities = await processSpecificSourceOpportunities(
    opportunities, 
    sourceConfig, 
    supabase
  );
  
  return {
    source: sourceConfig.name,
    scraped: opportunities.length,
    published: processedOpportunities.published,
    duplicates: processedOpportunities.duplicates,
    health_status: 'healthy'
  };
}

async function processSpecificSourceOpportunities(
  opportunities: any[], 
  sourceConfig: any, 
  supabase: any
): Promise<{ published: number; duplicates: number }> {
  let published = 0
  let duplicates = 0

  // Get categories for mapping
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')

  const categoryMap = new Map(categories?.map((cat: any) => [cat.name.toLowerCase(), cat.id]) || [])

  for (const opp of opportunities) {
    try {
      const contentHash = await generateContentHash(opp.title + opp.description)
      
      // Check for duplicates
      const { data: existingEmbedding } = await supabase
        .from('opportunity_embeddings')
        .select('id')
        .eq('combined_hash', contentHash)
        .single()

      if (existingEmbedding) {
        duplicates++
        console.log(`Duplicate found: ${opp.title}`)
        continue
      }

      // Determine category based on source and content
      const category = determineSpecificSourceCategory(opp, sourceConfig, categoryMap)
      
      if (!category) {
        console.warn(`No category found for opportunity: ${opp.title}`)
        continue
      }

      const deadline = parseDeadline(opp.deadline)

      // Create the opportunity
      const { data: newOpportunity, error: oppError } = await supabase
        .from('opportunities')
        .insert({
          title: opp.title,
          description: opp.description,
          organization: opp.organization,
          location: opp.location,
          category_id: category,
          application_url: opp.application_url,
          application_deadline: deadline,
          source_url: opp.source_url,
          source: 'scraped_specific',
          status: 'approved',
          is_published: true,
          published_at: new Date().toISOString()
        })
        .select()
        .single()

      if (oppError) {
        console.error('Error creating opportunity:', oppError)
        continue
      }

      // Create embedding record
      await supabase
        .from('opportunity_embeddings')
        .insert({
          opportunity_id: newOpportunity.id,
          combined_hash: contentHash
        })

      published++
      console.log(`Published: ${opp.title}`)

    } catch (error) {
      console.error(`Error processing opportunity: ${opp.title}`, error)
    }
  }

  return { published, duplicates }
}

function determineSpecificSourceCategory(
  opportunity: any, 
  sourceConfig: any, 
  categoryMap: Map<string, string>
): string | null {
  const text = (opportunity.title + ' ' + opportunity.description).toLowerCase()
  
  // Source-specific category mapping
  const sourceCategories: Record<string, string> = {
    'un-careers': 'jobs',
    'unicef-careers': 'jobs',
    'world-bank': 'fellowships',
    'african-union': 'jobs',
    'unesco': 'fellowships',
    'daad': 'scholarships',
    'mastercard-foundation': 'scholarships',
    'commonwealth': 'scholarships'
  }

  // Try source-specific mapping first
  if (sourceCategories[sourceConfig.id]) {
    const categoryId = categoryMap.get(sourceCategories[sourceConfig.id])
    if (categoryId) return categoryId
  }

  // Fallback to content-based detection
  if (text.includes('scholarship') || text.includes('study')) {
    return categoryMap.get('scholarships') || null
  }
  if (text.includes('fellowship') || text.includes('research')) {
    return categoryMap.get('fellowships') || null
  }
  if (text.includes('internship')) {
    return categoryMap.get('internships') || null
  }
  if (text.includes('job') || text.includes('position') || text.includes('officer')) {
    return categoryMap.get('jobs') || null
  }

  return categoryMap.get('jobs') || null
}

async function checkSourceHealth(source: ScrapingSource): Promise<{ healthy: boolean; error?: string }> {
  try {
    const response = await fetch(source.url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.ok) {
      return { healthy: false, error: `HTTP ${response.status}: ${response.statusText}` }
    }

    return { healthy: true }
  } catch (error) {
    return { healthy: false, error: error.message }
  }
}

async function scrapeSourceEnhanced(source: ScrapingSource): Promise<ScrapedOpportunity[]> {
  console.log(`Enhanced scraping ${source.name} from ${source.url}`)
  
  try {
    const response = await fetch(source.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()
    console.log(`HTML content length: ${html.length}`)
    
    // Enhanced HTML processing with DOM parsing
    const opportunities = await extractOpportunitiesEnhanced(html, source)
    
    return opportunities

  } catch (error) {
    console.error(`Failed to scrape ${source.name}:`, error)
    throw error
  }
}

async function extractOpportunitiesEnhanced(html: string, source: ScrapingSource): Promise<ScrapedOpportunity[]> {
  // First try structured extraction if selectors are configured
  if (source.selector_config && Object.keys(source.selector_config).length > 0) {
    try {
      const structuredOpportunities = extractWithSelectors(html, source)
      if (structuredOpportunities.length > 0) {
        console.log(`Extracted ${structuredOpportunities.length} opportunities using selectors`)
        return structuredOpportunities
      }
    } catch (error) {
      console.warn(`Selector extraction failed for ${source.name}:`, error)
    }
  }

  // Fallback to AI extraction
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
  
  if (!openaiApiKey) {
    console.warn('OpenAI API key not found, using enhanced fallback extraction')
    return extractOpportunitiesEnhancedFallback(html, source)
  }

  try {
    // Clean and process HTML for better AI analysis
    const processedContent = preprocessHtmlForAI(html)
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert at extracting job opportunities, scholarships, fellowships, and internships from website content. 

IMPORTANT: You must respond with ONLY a valid JSON array, no markdown formatting, no code blocks, no explanations.

Extract opportunities with this exact structure:
[
  {
    "title": "opportunity title",
    "description": "detailed description (minimum 50 characters)",
    "deadline": "application deadline in YYYY-MM-DD format if available, otherwise null",
    "application_url": "application link if available, otherwise null",
    "organization": "${source.name}",
    "source_url": "${source.url}"
  }
]

Only include real opportunities with clear titles and descriptions. Skip navigation items, general information, or promotional content.`
          },
          {
            role: 'user',
            content: `Extract opportunities from this ${source.name} content:\n\n${processedContent}`
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} - ${response.statusText}`)
    }

    const result = await response.json()
    const content = result.choices[0]?.message?.content

    if (!content) {
      throw new Error('No content returned from OpenAI')
    }

    try {
      // Clean the response to handle markdown formatting
      const cleanedContent = content
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim()

      const opportunities = JSON.parse(cleanedContent)
      
      if (!Array.isArray(opportunities)) {
        console.warn('AI response is not an array, wrapping in array')
        return [opportunities].filter(op => op && op.title && op.description)
      }

      // Validate and filter opportunities
      const validOpportunities = opportunities.filter(op => 
        op && 
        typeof op.title === 'string' && 
        op.title.length > 10 &&
        typeof op.description === 'string' && 
        op.description.length > 50
      )

      console.log(`AI extracted ${validOpportunities.length} valid opportunities from ${opportunities.length} total`)
      return validOpportunities

    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      console.log('Raw AI response:', content)
      return extractOpportunitiesEnhancedFallback(html, source)
    }

  } catch (error) {
    console.error('AI extraction failed:', error)
    return extractOpportunitiesEnhancedFallback(html, source)
  }
}

function extractWithSelectors(html: string, source: ScrapingSource): ScrapedOpportunity[] {
  const opportunities: ScrapedOpportunity[] = []
  
  try {
    const doc = new DOMParser().parseFromString(html, "text/html")
    if (!doc) throw new Error('Failed to parse HTML')

    const config = source.selector_config
    const containerSelector = config.container || 'body'
    const titleSelector = config.title || 'h1, h2, h3, .title'
    const descriptionSelector = config.description || 'p, .description, .summary'
    const linkSelector = config.link || 'a'

    const containers = doc.querySelectorAll(containerSelector)
    
    containers.forEach(container => {
      const titleEl = container.querySelector(titleSelector)
      const descriptionEl = container.querySelector(descriptionSelector)
      const linkEl = container.querySelector(linkSelector)

      if (titleEl && descriptionEl) {
        const title = titleEl.textContent?.trim()
        const description = descriptionEl.textContent?.trim()
        const applicationUrl = linkEl?.getAttribute('href')

        if (title && description && title.length > 10 && description.length > 50) {
          opportunities.push({
            title,
            description,
            application_url: applicationUrl ? new URL(applicationUrl, source.url).href : undefined,
            organization: source.name,
            source_url: source.url
          })
        }
      }
    })

    return opportunities.slice(0, 20) // Limit results
  } catch (error) {
    console.error('Selector extraction error:', error)
    return []
  }
}

function preprocessHtmlForAI(html: string): string {
  try {
    const doc = new DOMParser().parseFromString(html, "text/html")
    if (!doc) return html.substring(0, 8000)

    // Remove unwanted elements
    const elementsToRemove = ['script', 'style', 'nav', 'header', 'footer', 'aside', 'advertisement']
    elementsToRemove.forEach(tag => {
      const elements = doc.querySelectorAll(tag)
      elements.forEach(el => el.remove())
    })

    // Focus on main content areas
    const mainContent = doc.querySelector('main, .main, .content, #content, .jobs, .opportunities, .careers')
    const contentToAnalyze = mainContent ? mainContent.textContent : doc.body?.textContent

    return (contentToAnalyze || '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 8000)
  } catch (error) {
    console.warn('HTML preprocessing failed:', error)
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 8000)
  }
}

function extractOpportunitiesEnhancedFallback(html: string, source: ScrapingSource): ScrapedOpportunity[] {
  const opportunities: ScrapedOpportunity[] = []
  
  try {
    const doc = new DOMParser().parseFromString(html, "text/html")
    if (!doc) throw new Error('Failed to parse HTML')

    // Look for common opportunity patterns
    const opportunitySelectors = [
      '.job, .opportunity, .position, .vacancy, .career',
      'article, .article',
      '.listing, .item',
      '[class*="job"], [class*="career"], [class*="opportunity"]'
    ]

    for (const selector of opportunitySelectors) {
      const elements = doc.querySelectorAll(selector)
      
      elements.forEach(element => {
        const titleEl = element.querySelector('h1, h2, h3, h4, .title, [class*="title"]')
        const descEl = element.querySelector('p, .description, .summary, [class*="desc"]')
        const linkEl = element.querySelector('a')

        if (titleEl && descEl) {
          const title = titleEl.textContent?.trim()
          const description = descEl.textContent?.trim()
          const link = linkEl?.getAttribute('href')

          if (title && description && title.length > 10 && description.length > 30) {
            opportunities.push({
              title,
              description,
              application_url: link ? new URL(link, source.url).href : undefined,
              organization: source.name,
              source_url: source.url
            })
          }
        }
      })

      if (opportunities.length > 0) break
    }

    return opportunities.slice(0, 15)
  } catch (error) {
    console.error('Enhanced fallback extraction failed:', error)
    return []
  }
}

async function processOpportunities(
  opportunities: ScrapedOpportunity[], 
  source: ScrapingSource, 
  supabase: any
): Promise<{ published: number; duplicates: number }> {
  let published = 0
  let duplicates = 0

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')

  const categoryMap = new Map(categories?.map((cat: any) => [cat.name.toLowerCase(), cat.id]) || [])

  for (const opp of opportunities) {
    try {
      const contentHash = await generateContentHash(opp.title + opp.description)
      
      const { data: existingEmbedding } = await supabase
        .from('opportunity_embeddings')
        .select('id')
        .eq('combined_hash', contentHash)
        .single()

      if (existingEmbedding) {
        duplicates++
        console.log(`Duplicate found: ${opp.title}`)
        continue
      }

      const category = determineCategory(opp, source.category_mapping, categoryMap)
      
      if (!category) {
        console.warn(`No category found for opportunity: ${opp.title}`)
        continue
      }

      const deadline = parseDeadline(opp.deadline)

      const { data: newOpportunity, error: oppError } = await supabase
        .from('opportunities')
        .insert({
          title: opp.title,
          description: opp.description,
          organization: opp.organization,
          category_id: category,
          application_url: opp.application_url,
          application_deadline: deadline,
          source_url: opp.source_url,
          source: 'scraped',
          status: 'approved',
          is_published: true,
          published_at: new Date().toISOString()
        })
        .select()
        .single()

      if (oppError) {
        console.error('Error creating opportunity:', oppError)
        continue
      }

      await supabase
        .from('opportunity_embeddings')
        .insert({
          opportunity_id: newOpportunity.id,
          combined_hash: contentHash
        })

      published++
      console.log(`Published: ${opp.title}`)

    } catch (error) {
      console.error(`Error processing opportunity: ${opp.title}`, error)
    }
  }

  return { published, duplicates }
}

function determineCategory(
  opportunity: ScrapedOpportunity, 
  categoryMapping: any, 
  categoryMap: Map<string, string>
): string | null {
  const text = (opportunity.title + ' ' + opportunity.description).toLowerCase()
  
  if (categoryMapping?.keywords) {
    for (const [keyword, categoryName] of Object.entries(categoryMapping.keywords)) {
      if (text.includes(keyword.toLowerCase())) {
        return categoryMap.get(categoryName.toString().toLowerCase()) || null
      }
    }
  }
  
  if (categoryMapping?.default_category) {
    return categoryMap.get(categoryMapping.default_category.toLowerCase()) || null
  }
  
  return categoryMap.get('jobs') || null
}

function parseDeadline(deadlineStr?: string): string | null {
  if (!deadlineStr) return null
  
  const datePatterns = [
    /(\d{4})-(\d{2})-(\d{2})/,
    /(\d{2})\/(\d{2})\/(\d{4})/,
    /(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i
  ]
  
  for (const pattern of datePatterns) {
    const match = deadlineStr.match(pattern)
    if (match) {
      try {
        const date = new Date(deadlineStr)
        if (!isNaN(date.getTime())) {
          return date.toISOString()
        }
      } catch (error) {
        continue
      }
    }
  }
  
  return null
}

async function generateContentHash(content: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(content)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
