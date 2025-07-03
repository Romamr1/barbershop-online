'use client';

import { useEffect, useState } from 'react';
import { initReactI18next } from 'react-i18next';
import i18nInstance from './i18n';

// Initialize React i18next integration on client side
export function initializeReactI18next() {
  if (typeof window !== 'undefined' && i18nInstance) {
    console.log('Initializing React i18next integration...');
    console.log('i18nInstance:', i18nInstance);
    console.log('isInitialized:', i18nInstance.isInitialized);
    
    // Always add React integration, even if already initialized
    return i18nInstance.use(initReactI18next).init({
      react: {
        useSuspense: false, // Disable suspense for SSR compatibility
      },
    });
  }
  return Promise.resolve();
}

// Hook to initialize i18n on client side
export function useI18nInitialization() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && i18nInstance) {
      console.log('useI18nInitialization: Starting initialization...');
      
      // Wait for the basic i18n initialization to complete
      const checkAndInitialize = () => {
        if (i18nInstance.isInitialized) {
          initializeReactI18next().then(() => {
            setIsInitialized(true);
            console.log('React i18next initialized successfully');
            console.log('Final i18n instance:', i18nInstance);
          }).catch((error: any) => {
            console.error('Failed to initialize React i18next:', error);
          });
        } else {
          // Check again in 100ms
          setTimeout(checkAndInitialize, 100);
        }
      };
      
      checkAndInitialize();
    }
  }, []);

  return isInitialized;
}

export default i18nInstance; 