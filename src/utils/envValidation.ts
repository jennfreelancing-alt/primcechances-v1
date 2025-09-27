/**
 * Environment variable validation utilities
 * Ensures required environment variables are present and properly configured
 */

interface EnvConfig {
  VITE_RESEND_API: string;
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
}

interface ValidationResult {
  isValid: boolean;
  missingVars: string[];
  errors: string[];
}

/**
 * Validates that all required environment variables are present
 */
export const validateEnvironmentVariables = (): ValidationResult => {
  const requiredVars: (keyof EnvConfig)[] = [
    'VITE_RESEND_API',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];

  const missingVars: string[] = [];
  const errors: string[] = [];

  // Check for missing variables
  requiredVars.forEach(varName => {
    const value = import.meta.env[varName];
    if (!value || value.trim() === '') {
      missingVars.push(varName);
    }
  });

  // Validate Resend API key format
  const resendApiKey = import.meta.env.VITE_RESEND_API;
  if (resendApiKey && !resendApiKey.startsWith('re_')) {
    errors.push('VITE_RESEND_API should start with "re_" (Resend API key format)');
  }

  // Validate Supabase URL format
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.includes('supabase')) {
    errors.push('VITE_SUPABASE_URL should be a valid Supabase URL');
  }

  // Validate Supabase anon key format
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (supabaseAnonKey && !supabaseAnonKey.startsWith('eyJ')) {
    errors.push('VITE_SUPABASE_ANON_KEY should be a valid JWT token');
  }

  return {
    isValid: missingVars.length === 0 && errors.length === 0,
    missingVars,
    errors
  };
};

/**
 * Gets environment configuration with validation
 */
export const getEnvConfig = (): EnvConfig => {
  const validation = validateEnvironmentVariables();
  
  if (!validation.isValid) {
    const errorMessage = [
      'Environment configuration is invalid:',
      ...validation.missingVars.map(varName => `- Missing: ${varName}`),
      ...validation.errors.map(error => `- ${error}`)
    ].join('\n');
    
    throw new Error(errorMessage);
  }

  return {
    VITE_RESEND_API: import.meta.env.VITE_RESEND_API,
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY
  };
};

/**
 * Checks if email functionality is properly configured
 */
export const isEmailConfigured = (): boolean => {
  const resendApiKey = import.meta.env.VITE_RESEND_API;
  return !!(resendApiKey && resendApiKey.trim() !== '');
};

/**
 * Gets a safe environment variable value with fallback
 */
export const getEnvVar = (key: string, fallback: string = ''): string => {
  return import.meta.env[key] || fallback;
};

/**
 * Development environment check
 */
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV === true;
};

/**
 * Production environment check
 */
export const isProduction = (): boolean => {
  return import.meta.env.PROD === true;
};

/**
 * Gets the correct site URL based on environment
 */
export const getSiteUrl = (): string => {
  const hostname = window.location.hostname;
  const origin = window.location.origin;
  
  console.log('🌐 Environment detection:', {
    hostname,
    origin,
    isDevelopment: isDevelopment(),
    isProduction: isProduction()
  });
  
  // Check if we're in a development environment
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('localhost')) {
    console.log('🔧 Development environment detected, using origin:', origin);
    return origin;
  }
  
  // Check if we're in a Vercel preview or other staging environment
  if (hostname.includes('vercel.app') || hostname.includes('netlify.app') || hostname.includes('herokuapp.com')) {
    console.log('🚀 Preview/staging environment detected, using production URL');
    return 'https://primechances.com';
  }
  
  // For production domain, use the current origin
  if (hostname === 'primechances.com') {
    console.log('✅ Production environment detected, using origin:', origin);
    return origin;
  }
  
  // Check if we're in production mode but on unknown domain - use production URL
  if (isProduction() && !origin.includes('localhost')) {
    console.log('✅ Production mode detected on unknown domain, using production URL');
    return 'https://primechances.com';
  }
  
  // Default fallback to production URL for any deployed environment
  if (!origin.includes('localhost')) {
    console.log('🚀 Deployed environment detected (non-localhost), using production URL');
    return 'https://primechances.com';
  }
  
  // Final fallback
  console.log('⚠️ Unknown environment, defaulting to production URL');
  return 'https://primechances.com';
};

/**
 * Gets the correct redirect URL for authentication flows
 */
export const getAuthRedirectUrl = (path: string = ''): string => {
  const baseUrl = getSiteUrl();
  return `${baseUrl}${path}`;
};

/**
 * Environment-specific configuration
 */
export const getEnvironmentConfig = () => {
  const baseConfig = {
    isDevelopment: isDevelopment(),
    isProduction: isProduction(),
    emailConfigured: isEmailConfigured(),
    siteUrl: getSiteUrl()
  };

  if (baseConfig.isDevelopment) {
    return {
      ...baseConfig,
      logLevel: 'debug',
      enableEmailLogging: true,
      emailRateLimit: 10 // More lenient in development
    };
  }

  return {
    ...baseConfig,
    logLevel: 'error',
    enableEmailLogging: false,
    emailRateLimit: 5 // Stricter in production
  };
};

export default {
  validateEnvironmentVariables,
  getEnvConfig,
  isEmailConfigured,
  getEnvVar,
  isDevelopment,
  isProduction,
  getEnvironmentConfig
};
