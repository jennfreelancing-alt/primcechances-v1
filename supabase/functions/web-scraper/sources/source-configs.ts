
// Source-specific scraping configurations
export interface SourceConfig {
  id: string;
  name: string;
  baseUrl: string;
  listingPath: string;
  detailPath?: string;
  selectors: {
    container: string;
    title: string;
    description: string;
    deadline?: string;
    location?: string;
    link: string;
    nextPage?: string;
  };
  pagination: {
    type: 'click' | 'url' | 'scroll';
    maxPages?: number;
    waitTime?: number;
  };
  filters: {
    language?: string[];
    keywords?: string[];
    excludeKeywords?: string[];
  };
  requestConfig: {
    headers: Record<string, string>;
    delay: number;
    retries: number;
  };
}

export const sourceConfigs: SourceConfig[] = [
  {
    id: 'un-careers',
    name: 'UN Careers',
    baseUrl: 'https://careers.un.org',
    listingPath: '/lbw/Home.aspx',
    selectors: {
      container: '.job-listing, .vacancy-item',
      title: 'h3 a, .job-title a',
      description: '.job-summary, .vacancy-summary',
      deadline: '.deadline, .closing-date',
      location: '.location, .duty-station',
      link: 'h3 a, .job-title a'
    },
    pagination: {
      type: 'click',
      maxPages: 10,
      waitTime: 2000
    },
    filters: {
      language: ['english'],
      excludeKeywords: ['expired', 'closed']
    },
    requestConfig: {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      delay: 3000,
      retries: 3
    }
  },
  {
    id: 'unicef-careers',
    name: 'UNICEF Careers',
    baseUrl: 'https://www.unicef.org',
    listingPath: '/careers/search',
    selectors: {
      container: '.job-card, .vacancy-listing',
      title: '.job-title, h3',
      description: '.job-description, .summary',
      deadline: '.application-deadline, .closes',
      location: '.job-location, .location',
      link: 'a'
    },
    pagination: {
      type: 'url',
      maxPages: 15,
      waitTime: 1500
    },
    filters: {
      language: ['english'],
      keywords: ['fellowship', 'internship', 'programme', 'officer']
    },
    requestConfig: {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      delay: 2000,
      retries: 2
    }
  },
  {
    id: 'world-bank',
    name: 'World Bank Group',
    baseUrl: 'https://www.worldbank.org',
    listingPath: '/en/about/careers',
    selectors: {
      container: '.opportunity-item, .job-posting',
      title: '.opportunity-title, h4',
      description: '.opportunity-summary, .description',
      deadline: '.deadline, .expires',
      location: '.location, .office',
      link: 'a'
    },
    pagination: {
      type: 'scroll',
      maxPages: 8,
      waitTime: 2500
    },
    filters: {
      keywords: ['young professionals', 'fellowship', 'graduate', 'internship'],
      excludeKeywords: ['senior', 'director', 'manager']
    },
    requestConfig: {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      delay: 2500,
      retries: 3
    }
  },
  {
    id: 'african-union',
    name: 'African Union',
    baseUrl: 'https://au.int',
    listingPath: '/en/careers',
    selectors: {
      container: '.career-item, .vacancy',
      title: '.career-title, h3',
      description: '.career-summary, .description',
      deadline: '.closing-date, .deadline',
      location: '.location, .duty-station',
      link: 'a'
    },
    pagination: {
      type: 'url',
      maxPages: 5,
      waitTime: 3000
    },
    filters: {
      language: ['english'],
      keywords: ['internship', 'fellowship', 'programme']
    },
    requestConfig: {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      delay: 3000,
      retries: 2
    }
  },
  {
    id: 'unesco',
    name: 'UNESCO',
    baseUrl: 'https://en.unesco.org',
    listingPath: '/careers',
    selectors: {
      container: '.job-item, .opportunity',
      title: '.job-title, h4',
      description: '.job-summary, .excerpt',
      deadline: '.deadline, .expires',
      location: '.location, .office',
      link: 'a'
    },
    pagination: {
      type: 'click',
      maxPages: 12,
      waitTime: 2000
    },
    filters: {
      keywords: ['fellowship', 'internship', 'young professionals'],
      excludeKeywords: ['senior', 'chief']
    },
    requestConfig: {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      delay: 2000,
      retries: 3
    }
  },
  {
    id: 'daad',
    name: 'DAAD',
    baseUrl: 'https://www.daad.de',
    listingPath: '/en/find-funding/',
    selectors: {
      container: '.funding-item, .scholarship-item',
      title: '.funding-title, h3',
      description: '.funding-description, .summary',
      deadline: '.application-deadline, .deadline',
      location: '.country, .location',
      link: 'a'
    },
    pagination: {
      type: 'url',
      maxPages: 20,
      waitTime: 1500
    },
    filters: {
      language: ['english'],
      keywords: ['scholarship', 'fellowship', 'research', 'study']
    },
    requestConfig: {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      delay: 2000,
      retries: 2
    }
  },
  {
    id: 'mastercard-foundation',
    name: 'MasterCard Foundation',
    baseUrl: 'https://mastercardfdn.org',
    listingPath: '/all-programs/',
    selectors: {
      container: '.program-item, .opportunity',
      title: '.program-title, h3',
      description: '.program-summary, .description',
      deadline: '.application-deadline, .deadline',
      location: '.location, .region',
      link: 'a'
    },
    pagination: {
      type: 'scroll',
      maxPages: 6,
      waitTime: 2500
    },
    filters: {
      keywords: ['scholarship', 'fellowship', 'young leaders', 'education'],
      excludeKeywords: ['closed', 'ended']
    },
    requestConfig: {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      delay: 2500,
      retries: 3
    }
  },
  {
    id: 'commonwealth',
    name: 'Commonwealth Scholarships',
    baseUrl: 'https://cscuk.fcdo.gov.uk',
    listingPath: '/scholarships/',
    selectors: {
      container: '.scholarship-item, .funding-opportunity',
      title: '.scholarship-title, h3',
      description: '.scholarship-summary, .description',
      deadline: '.application-deadline, .closes',
      location: '.country, .location',
      link: 'a'
    },
    pagination: {
      type: 'url',
      maxPages: 8,
      waitTime: 2000
    },
    filters: {
      language: ['english'],
      keywords: ['scholarship', 'fellowship', 'commonwealth', 'study']
    },
    requestConfig: {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      delay: 2000,
      retries: 2
    }
  },
  {
    id: 'remoteok',
    name: 'RemoteOK',
    baseUrl: 'https://remoteok.com',
    listingPath: '/remote-dev-jobs',
    selectors: {
      container: '.job',
      title: '.position',
      description: '.description[itemprop="description"], .description, .markdown',
      deadline: '.time',
      location: '.location',
      link: 'a'
    },
    pagination: {
      type: 'url',
      maxPages: 10,
      waitTime: 1500
    },
    filters: {
      language: ['english'],
      keywords: ['remote', 'developer', 'engineer', 'programmer', 'software']
    },
    requestConfig: {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      delay: 2000,
      retries: 3
    }
  }
];

export const getSourceConfig = (sourceId: string): SourceConfig | undefined => {
  return sourceConfigs.find(config => config.id === sourceId);
};

export const getAllSourceConfigs = (): SourceConfig[] => {
  return sourceConfigs;
};
