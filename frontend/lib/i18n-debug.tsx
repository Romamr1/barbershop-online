'use client';

import { useEffect, useState } from 'react';
import i18nInstance from './i18n';
import { useI18nInitialization } from './i18n-client';

export default function I18nDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const isInitialized = useI18nInitialization();

  useEffect(() => {
    const updateDebugInfo = () => {
      setDebugInfo({
        window: typeof window !== 'undefined',
        i18nInstance: !!i18nInstance,
        i18nInstanceType: typeof i18nInstance,
        isInitialized,
        i18nReady: i18nInstance?.isInitialized,
        currentLanguage: i18nInstance?.language,
        hasChangeLanguage: !!i18nInstance?.changeLanguage,
        hasT: !!i18nInstance?.t,
      });
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 1000);
    return () => clearInterval(interval);
  }, [isInitialized]);

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">i18n Debug Info</h3>
      <pre className="whitespace-pre-wrap">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
} 