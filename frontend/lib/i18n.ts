import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files statically
import enCommon from '../public/locales/en/common.json';
import ruCommon from '../public/locales/ru/common.json';
import ukCommon from '../public/locales/uk/common.json';
import deCommon from '../public/locales/de/common.json';

// Supported languages
export const supportedLanguages = ['ru', 'uk', 'en', 'de'] as const;
export type SupportedLanguage = typeof supportedLanguages[number];

// Default language
export const defaultLanguage: SupportedLanguage = 'ru';

// Language names for display
export const languageNames: Record<SupportedLanguage, string> = {
  ru: 'Русский',
  uk: 'Українська',
  en: 'English',
  de: 'Deutsch',
};

// Static resources
const resources = {
  en: {
    common: enCommon,
  },
  ru: {
    common: ruCommon,
  },
  uk: {
    common: ukCommon,
  },
  de: {
    common: deCommon,
  },
};

// Create i18n instance only on client side
let i18nInstance: any = null;

// Initialize i18n only on client side
if (typeof window !== 'undefined') {
  i18nInstance = i18n.createInstance();

  // Initialize i18n with basic configuration
  const initPromise = i18nInstance
    .use(LanguageDetector)
    .init({
      resources,
      
      // Debug mode in development
      debug: process.env.NODE_ENV === 'development',
      
      // Fallback language
      fallbackLng: defaultLanguage,
      
      // Supported languages
      supportedLngs: supportedLanguages,
      
      // Detection options
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
      },
      
      // Interpolation options
      interpolation: {
        escapeValue: false, // React already escapes values
      },
      
      // Namespace options
      defaultNS: 'common',
      ns: ['common'],
      
      // Preload default language
      preload: [defaultLanguage],
    });

  // Log initialization status
  initPromise.then(() => {
    console.log('i18n initialized successfully');
    console.log('Current language:', i18nInstance.language);
    console.log('Available languages:', supportedLanguages);
    console.log('i18n instance:', i18nInstance);
  }).catch((error: any) => {
    console.error('Failed to initialize i18n:', error);
  });
}

export default i18nInstance; 