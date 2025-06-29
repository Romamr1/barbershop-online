// Environment configuration utility
export const config = {
  // API Configuration
  api: {
    baseUrl: (() => {
      // Check for explicit environment variable first
      if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
      }
      
      // Auto-detect environment based on hostname
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        
        // Production environment
        if (hostname === 'barbershop-online-production.up.railway.app' || 
            hostname.includes('railway.app') ||
            hostname.includes('vercel.app') ||
            hostname.includes('netlify.app')) {
          return 'https://barbershop-online-production.up.railway.app/api';
        }
        
        // Local development
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          return 'http://localhost:3001/api';
        }
      }
      
      // Default fallback for development
      return 'http://localhost:3001/api';
    })(),
  },
  
  // Environment detection
  env: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
  },
  
  // Google Maps
  googleMaps: {
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  },
  
  // Analytics
  analytics: {
    gaId: process.env.NEXT_PUBLIC_GA_ID || '',
  },
};

// Log configuration in development
if (config.env.isDevelopment) {
  console.log('🔧 Environment Configuration:', {
    apiBaseUrl: config.api.baseUrl,
    environment: process.env.NODE_ENV,
    googleMapsEnabled: !!config.googleMaps.apiKey,
  });
} 