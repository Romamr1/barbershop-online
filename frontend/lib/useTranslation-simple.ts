'use client';

import { useEffect, useState } from 'react';
import i18nInstance from './i18n';

export function useTranslation(ns?: string | string[]) {
  const [isClient, setIsClient] = useState(false);

  // Ensure ns is always defined
  const namespace = ns || 'common';

  // Mark as client-side after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Simple translation function that works on both server and client
  const t = (key: string, options?: any) => {
    try {
      // Only try to translate on client side
      if (isClient && i18nInstance && i18nInstance.isInitialized) {
        return i18nInstance.t(key, { ns: namespace, ...options });
      }
    } catch (error) {
      console.warn('Translation error:', error);
    }
    // Return key as fallback during SSR or before initialization
    return key;
  };

  return {
    t,
    i18n: i18nInstance,
    ready: isClient && i18nInstance?.isInitialized || false,
  };
} 