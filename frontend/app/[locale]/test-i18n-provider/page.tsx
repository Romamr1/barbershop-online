'use client';

import { useTranslation } from '@/lib/useTranslation-provider';
import { I18nProvider, supportedLanguages, languageNames } from '@/lib/i18n-provider';
import { useEffect, useState } from 'react';

function TestContent() {
  const { t, i18n, ready } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-primary-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">i18n Provider Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-primary-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Status</h2>
            <div className="space-y-2 text-primary-300">
              <p><strong>Ready:</strong> {ready ? 'Yes' : 'No'}</p>
              <p><strong>Current Language:</strong> {i18n?.language || 'Not set'}</p>
              <p><strong>Is Initialized:</strong> {i18n?.isInitialized ? 'Yes' : 'No'}</p>
              <p><strong>Has changeLanguage:</strong> {typeof i18n?.changeLanguage === 'function' ? 'Yes' : 'No'}</p>
            </div>
          </div>

          <div className="bg-primary-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Translations</h2>
            <div className="space-y-2 text-primary-300">
              <p><strong>Hello:</strong> {t('hello') as string}</p>
              <p><strong>Welcome:</strong> {t('welcome') as string}</p>
              <p><strong>Language:</strong> {t('language') as string}</p>
              <p><strong>Home:</strong> {t('home') as string}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-primary-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-white mb-4">Language Switcher Test</h2>
          <div className="flex space-x-4">
            {supportedLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  console.log('Changing language to:', lang);
                  console.log('i18n instance:', i18n);
                  console.log('changeLanguage function:', i18n?.changeLanguage);
                  i18n?.changeLanguage(lang);
                }}
                className="px-4 py-2 bg-accent-600 text-white rounded hover:bg-accent-700 transition-colors"
              >
                {languageNames[lang]}
              </button>
            ))}
          </div>
          <p className="text-primary-300 mt-4">
            Click a language button above to test language switching
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TestI18nProviderPage() {
  return (
    <I18nProvider>
      <TestContent />
    </I18nProvider>
  );
} 