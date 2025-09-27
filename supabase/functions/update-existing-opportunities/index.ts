import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Opportunity {
  id: string;
  title: string;
  description: string;
  source_url?: string;
  application_url?: string;
  organization: string;
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

    const { update_all = false, limit = 10 } = await req.json()

    console.log('Starting opportunity description update job', { update_all, limit })

    // Get opportunities that need updating (short descriptions or from scraped sources)
    let query = supabase
      .from('opportunities')
      .select('id, title, description, source_url, application_url, organization')
      .eq('status', 'approved')
      .or('source.eq.scraped,source.eq.bulk_scraped,source.eq.scraped_specific')

    if (!update_all) {
      // Only update opportunities with short descriptions
      query = query.or('description.lt.200,description.is.null')
    }

    if (limit) {
      query = query.limit(limit)
    }

    const { data: opportunities, error } = await query

    if (error) {
      console.error('Error fetching opportunities:', error)
      throw error
    }

    if (!opportunities || opportunities.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No opportunities found to update',
          updated: 0,
          total: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${opportunities.length} opportunities to update`)

    let updated = 0
    let errors = 0
    const results = []

    for (const opportunity of opportunities) {
      try {
        console.log(`Updating opportunity: ${opportunity.title}`)
        
        const fullDescription = await fetchFullDescription(opportunity)
        
        if (fullDescription && fullDescription.length > opportunity.description?.length) {
          const { error: updateError } = await supabase
            .from('opportunities')
            .update({
              description: fullDescription,
              updated_at: new Date().toISOString()
            })
            .eq('id', opportunity.id)

          if (updateError) {
            console.error(`Error updating opportunity ${opportunity.id}:`, updateError)
            errors++
            results.push({
              id: opportunity.id,
              title: opportunity.title,
              status: 'error',
              error: updateError.message
            })
          } else {
            updated++
            console.log(`✅ Updated: ${opportunity.title} (${fullDescription.length} chars)`)
            results.push({
              id: opportunity.id,
              title: opportunity.title,
              status: 'updated',
              new_length: fullDescription.length,
              old_length: opportunity.description?.length || 0
            })
          }
        } else {
          console.log(`⏭️  Skipped: ${opportunity.title} (no better description found)`)
          results.push({
            id: opportunity.id,
            title: opportunity.title,
            status: 'skipped',
            reason: 'No better description found'
          })
        }

        // Small delay to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        console.error(`Error processing opportunity ${opportunity.id}:`, error)
        errors++
        results.push({
          id: opportunity.id,
          title: opportunity.title,
          status: 'error',
          error: error.message
        })
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Opportunity update completed',
        total: opportunities.length,
        updated,
        errors,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Opportunity update error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function fetchFullDescription(opportunity: Opportunity): Promise<string | null> {
  try {
    // Determine the best URL to fetch from
    const url = opportunity.source_url || opportunity.application_url
    if (!url) {
      console.log(`No URL available for ${opportunity.title}`)
      return null
    }

    console.log(`Fetching full description from: ${url}`)

    const response = await fetch(url, {
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
      console.warn(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
      return null
    }

    const html = await response.text()
    const doc = new DOMParser().parseFromString(html, "text/html")
    
    if (!doc) {
      return null
    }

    // Site-specific selectors based on URL
    let selectorsToTry: string[] = []

    if (url.includes('remoteok.com')) {
      selectorsToTry = [
        '.description[itemprop="description"]', // Main description container (found in analysis)
        '.description', // Fallback description container
        '[itemprop="description"]', // Schema.org description
        '.markdown',
        '.job-description',
        '.content',
        'article',
        '.job-details',
        '.job-content'
      ]
    } else if (url.includes('weworkremotely.com')) {
      selectorsToTry = [
        '.company-card',
        '.job-description',
        '.description',
        '.content',
        'article',
        '.job-details',
        '.company-description'
      ]
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
      ]
    }

    for (const selector of selectorsToTry) {
      const el = doc.querySelector(selector)
      if (el) {
        const text = el.textContent?.trim() || ''
        const cleanText = cleanDescriptionText(text)
        
        if (cleanText.length > 200) {
          console.log(`Found description with selector '${selector}': ${cleanText.length} characters`)
          return cleanText.slice(0, 10000)
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
    ]

    for (const selector of fallbackSelectors) {
      const container = doc.querySelector(selector)
      if (container) {
        // Remove unwanted elements
        const unwanted = container.querySelectorAll('script, style, nav, header, footer, aside, .advertisement, .ads, .sidebar')
        unwanted.forEach(el => el.remove())

        const text = container.textContent?.trim() || ''
        const cleanText = cleanDescriptionText(text)
        
        if (cleanText.length > 300) {
          console.log(`Found fallback description with selector '${selector}': ${cleanText.length} characters`)
          return cleanText.slice(0, 10000)
        }
      }
    }

    console.warn(`No substantial description found for ${url}`)
    return null

  } catch (error) {
    console.warn(`Error fetching full description from ${url}:`, error)
    return null
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
    .trim()
}
