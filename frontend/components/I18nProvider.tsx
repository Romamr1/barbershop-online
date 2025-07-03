'use client';

import { useEffect, useState } from 'react';
import i18n from '@/lib/i18n';

interface I18nProviderProps {
  children: React.ReactNode;
}

export default function I18nProvider({ children }: I18nProviderProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Initialize React integration on client side only
    try {
      const initReactI18next = require('react-i18next').initReactI18next;
      i18n.use(initReactI18next).init({
        react: {
          useSuspense: false,
        },
      });
    } catch (error) {
      console.warn('Failed to initialize react-i18next:', error);
    }
  }, []);

  // Always render children, but react-i18next will only be available on client
  return <>{children}</>;
} 