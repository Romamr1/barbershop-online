'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/useTranslation';
import { useLocale } from '@/lib/locale-context';
import { supportedLanguages, languageNames, type SupportedLanguage } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const { t, i18n, ready } = useTranslation();
  const { locale } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debug language changes
  useEffect(() => {
    if (i18n) {
      console.log('LanguageSwitcher: Current language changed to:', i18n.language);
    }
  }, [i18n?.language]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (language: SupportedLanguage) => {
    console.log('LanguageSwitcher: Changing language to:', language);
    try {
      if (i18n && i18n.changeLanguage && ready) {
        i18n.changeLanguage(language);
        console.log('LanguageSwitcher: Language changed successfully');
        
        // Navigate to the same page with new locale
        const currentPath = pathname.replace(`/${locale}`, '');
        const newPath = `/${language}${currentPath}`;
        router.push(newPath);
      } else {
        console.warn('LanguageSwitcher: i18n instance not available or not ready');
        console.log('i18n:', i18n);
        console.log('ready:', ready);
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    }
    setIsOpen(false);
  };

  const currentLanguage = (i18n?.language as SupportedLanguage) || 'ru';
  const currentLanguageName = languageNames[currentLanguage] || languageNames.ru;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-primary-300 hover:text-white transition-colors rounded-lg hover:bg-primary-700"
        aria-label={t('change_language') as string}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        <span className="hidden sm:block">{currentLanguageName}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-primary-800 border border-primary-700 rounded-lg shadow-lg py-2 z-50">
          <div className="px-4 py-2 text-sm text-primary-400 border-b border-primary-700">
            {t('language') as string}
          </div>
          {supportedLanguages.map((language) => (
            <button
              key={language}
              onClick={() => handleLanguageChange(language)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                language === currentLanguage
                  ? 'text-accent-400 bg-primary-700'
                  : 'text-primary-300 hover:bg-primary-700 hover:text-white'
              }`}
            >
              {languageNames[language]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 