
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";
import { SourceConfig } from '../sources/source-configs.ts';

export interface ScrapedOpportunity {
  title: string;
  description: string;
  deadline?: string;
  location?: string;
  application_url?: string;
  organization: string;
  source_url: string;
  category?: string;
}

export class SourceSpecificScraper {
  private config: SourceConfig;

  constructor(config: SourceConfig) {
    this.config = config;
  }

  async scrapeOpportunities(): Promise<ScrapedOpportunity[]> {
    console.log(`Starting specialized scrape for ${this.config.name}`);
    
    const opportunities: ScrapedOpportunity[] = [];
    let currentPage = 1;

    try {
      while (currentPage <= (this.config.pagination.maxPages || 5)) {
        console.log(`Scraping page ${currentPage} for ${this.config.name}`);
        
        const pageUrl = this.buildPageUrl(currentPage);
        const pageOpportunities = await this.scrapePage(pageUrl);
        
        if (pageOpportunities.length === 0) {
          console.log(`No opportunities found on page ${currentPage}, stopping`);
          break;
        }

        opportunities.push(...pageOpportunities);
        
        // Respect rate limiting
        await this.delay(this.config.requestConfig.delay);
        currentPage++;
      }

      console.log(`Completed scraping ${this.config.name}: ${opportunities.length} opportunities found`);
      return this.filterOpportunities(opportunities);

    } catch (error) {
      console.error(`Error scraping ${this.config.name}:`, error);
      throw error;
    }
  }

  private buildPageUrl(page: number): string {
    if (this.config.pagination.type === 'url') {
      return `${this.config.baseUrl}${this.config.listingPath}?page=${page}`;
    }
    return `${this.config.baseUrl}${this.config.listingPath}`;
  }

  private async scrapePage(url: string): Promise<ScrapedOpportunity[]> {
    const opportunities: ScrapedOpportunity[] = [];

    for (let attempt = 1; attempt <= this.config.requestConfig.retries; attempt++) {
      try {
        const response = await fetch(url, {
          headers: this.config.requestConfig.headers,
          signal: AbortSignal.timeout(30000) // 30 second timeout
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, "text/html");
        
        if (!doc) {
          throw new Error('Failed to parse HTML');
        }

        const containers = doc.querySelectorAll(this.config.selectors.container);
        
        for (const container of containers) {
          try {
            const opportunity = await this.extractOpportunityFromContainer(container);
            if (opportunity && this.isValidOpportunity(opportunity)) {
              opportunities.push(opportunity);
            }
          } catch (error) {
            console.warn(`Error extracting opportunity:`, error);
          }
        }

        return opportunities;

      } catch (error) {
        console.warn(`Attempt ${attempt} failed for ${url}:`, error);
        if (attempt === this.config.requestConfig.retries) {
          throw error;
        }
        await this.delay(1000 * attempt); // Exponential backoff
      }
    }

    return opportunities;
  }

  private async extractOpportunityFromContainer(container: any): Promise<ScrapedOpportunity | null> {
    try {
      const titleEl = container.querySelector(this.config.selectors.title);
      const descEl = container.querySelector(this.config.selectors.description);
      const linkEl = container.querySelector(this.config.selectors.link);

      if (!titleEl || !descEl) {
        return null;
      }

      const title = titleEl.textContent?.trim();
      const description = descEl.textContent?.trim();
      
      if (!title || !description || title.length < 10 || description.length < 30) {
        return null;
      }

      const opportunity: ScrapedOpportunity = {
        title,
        description,
        organization: this.config.name,
        source_url: this.config.baseUrl + this.config.listingPath
      };

      // Extract deadline if selector exists
      if (this.config.selectors.deadline) {
        const deadlineEl = container.querySelector(this.config.selectors.deadline);
        if (deadlineEl) {
          opportunity.deadline = deadlineEl.textContent?.trim();
        }
      }

      // Extract location if selector exists
      if (this.config.selectors.location) {
        const locationEl = container.querySelector(this.config.selectors.location);
        if (locationEl) {
          opportunity.location = locationEl.textContent?.trim();
        }
      }

      // Extract application URL
      if (linkEl) {
        const href = linkEl.getAttribute('href');
        if (href) {
          opportunity.application_url = href.startsWith('http') 
            ? href 
            : `${this.config.baseUrl}${href}`;
        }
      }

      // Try to fetch full description from detail page
      if (opportunity.application_url) {
        try {
          const fullDescription = await this.fetchFullDescription(opportunity.application_url);
          if (fullDescription && fullDescription.length > description.length) {
            opportunity.description = fullDescription;
            console.log(`Enhanced description for ${title}: ${fullDescription.length} characters`);
          }
        } catch (error) {
          console.warn(`Failed to fetch full description for ${title}:`, error);
        }
      }

      return opportunity;

    } catch (error) {
      console.warn('Error extracting opportunity from container:', error);
      return null;
    }
  }

  private isValidOpportunity(opportunity: ScrapedOpportunity): boolean {
    const text = `${opportunity.title} ${opportunity.description}`.toLowerCase();

    // Check exclude keywords
    if (this.config.filters.excludeKeywords) {
      for (const keyword of this.config.filters.excludeKeywords) {
        if (text.includes(keyword.toLowerCase())) {
          return false;
        }
      }
    }

    // Check include keywords (if specified)
    if (this.config.filters.keywords && this.config.filters.keywords.length > 0) {
      const hasMatchingKeyword = this.config.filters.keywords.some(keyword => 
        text.includes(keyword.toLowerCase())
      );
      if (!hasMatchingKeyword) {
        return false;
      }
    }

    return true;
  }

  private filterOpportunities(opportunities: ScrapedOpportunity[]): ScrapedOpportunity[] {
    return opportunities.filter(opp => this.isValidOpportunity(opp));
  }

  private async fetchFullDescription(url: string): Promise<string | null> {
    try {
      console.log(`Fetching full description from: ${url}`);
      
      const response = await fetch(url, {
        headers: this.config.requestConfig.headers,
        signal: AbortSignal.timeout(15000) // 15 second timeout
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

      // Site-specific selectors for full description
      let selectorsToTry: string[] = [];

      if (this.config.id === 'remoteok') {
        selectorsToTry = [
          '.description[itemprop="description"]', // Main description container (found in analysis)
          '.description', // Fallback description container
          '[itemprop="description"]', // Schema.org description
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
          const cleanText = this.cleanDescriptionText(text);
          
          if (cleanText.length > 200) {
            console.log(`Found full description with selector '${selector}': ${cleanText.length} characters`);
            return cleanText.slice(0, 10000);
          }
        }
      }

      // Fallback: try to extract from main content area
      const mainEl = doc.querySelector('main, article, .main-content, .content-wrapper');
      if (mainEl) {
        // Remove unwanted elements
        const unwanted = mainEl.querySelectorAll('script, style, nav, header, footer, aside, .advertisement, .ads, .sidebar');
        unwanted.forEach(el => el.remove());

        const text = mainEl.textContent?.trim() || '';
        const cleanText = this.cleanDescriptionText(text);
        
        if (cleanText.length > 300) {
          console.log(`Found fallback description: ${cleanText.length} characters`);
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

  private cleanDescriptionText(text: string): string {
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

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
