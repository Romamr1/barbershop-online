# Internationalization (i18n) Setup

This project uses `i18next` with `react-i18next` for full internationalization support in Next.js App Router.

## 🌍 Supported Languages

- **Russian (ru)** - Default language
- **Ukrainian (uk)**
- **English (en)**
- **German (de)**

## 📁 Directory Structure

```
frontend/
├── app/
│   ├── [locale]/           # Locale-specific routes
│   │   ├── layout.tsx      # Locale layout with i18n provider
│   │   └── page.tsx        # Home page with locale parameter
│   ├── i18n-demo/          # Demo page showcasing i18n features
│   └── layout.tsx          # Root layout (redirects to default locale)
├── components/
│   ├── LanguageSwitcher.tsx # Language switching component
│   └── I18nProvider.tsx    # i18n provider for client components
├── lib/
│   └── i18n.ts            # i18next configuration
├── public/
│   └── locales/           # Translation files
│       ├── ru/
│       │   └── common.json
│       ├── uk/
│       │   └── common.json
│       ├── en/
│       │   └── common.json
│       └── de/
│           └── common.json
└── middleware.ts          # Locale detection middleware
```

## 🚀 Features

### ✅ Implemented Features

1. **Multi-language Support**: Russian, Ukrainian, English, German
2. **Language Detection**: Browser-based with fallback to Russian
3. **Client-side Language Switching**: Real-time language changes
4. **Server and Client Components**: Support for both
5. **URL-based Locales**: `/ru/`, `/uk/`, `/en/`, `/de/`
6. **Automatic Redirects**: Middleware redirects to user's preferred language
7. **Translation Namespaces**: Organized translation files
8. **Type Safety**: TypeScript support for translation keys

### 🔧 Configuration

#### i18next Configuration (`lib/i18n.ts`)

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: process.env.NODE_ENV === 'development',
    fallbackLng: 'ru',
    supportedLngs: ['ru', 'uk', 'en', 'de'],
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    react: {
      useSuspense: false, // Important for SSR
    },
  });
```

#### Middleware Configuration (`middleware.ts`)

```typescript
export function middleware(request: NextRequest) {
  // Detect user's preferred language from browser headers
  // Redirect to appropriate locale path
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|locales).*)'],
};
```

## 📝 Usage

### In Client Components

```typescript
'use client';

import { useTranslation } from 'react-i18next';

export default function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('hello')}</h1>
      <p>{t('welcome')}</p>
    </div>
  );
}
```

### Language Switching

```typescript
import { useTranslation } from 'react-i18next';
import { supportedLanguages } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
  };

  return (
    <select onChange={(e) => handleLanguageChange(e.target.value)}>
      {supportedLanguages.map(lang => (
        <option key={lang} value={lang}>{lang}</option>
      ))}
    </select>
  );
}
```

### Translation Files

Each language has its own JSON file in `public/locales/{locale}/common.json`:

```json
{
  "hello": "Привет",
  "welcome": "Добро пожаловать",
  "language": "Язык",
  "change_language": "Сменить язык",
  "home": "Главная",
  "login": "Войти",
  "register": "Регистрация",
  "logout": "Выйти"
}
```

## 🎯 Key Components

### LanguageSwitcher Component

- Dropdown menu for language selection
- Shows current language
- Updates language in real-time
- Persists selection in localStorage

### I18nProvider Component

- Wraps the app with i18next context
- Handles client-side initialization
- Provides translations to all child components

### Locale Layout

- Validates locale parameter
- Sets HTML lang attribute
- Includes i18n provider and other global components

## 🔄 Language Detection Flow

1. **User visits `/`**
2. **Middleware detects browser language** from `Accept-Language` header
3. **Redirects to appropriate locale** (e.g., `/ru/`, `/en/`)
4. **If no match found**, redirects to default language (`/ru/`)
5. **User can manually switch** languages using LanguageSwitcher
6. **Selection is saved** in localStorage for future visits

## 📱 Demo Page

Visit `/i18n-demo` to see:
- Language switcher in action
- Translation examples
- Client vs Server component differences
- Common UI elements in all languages
- Barbershop-specific terms

## 🛠 Development

### Adding New Languages

1. Add language code to `supportedLanguages` array in `lib/i18n.ts`
2. Add language name to `languageNames` object
3. Create translation file: `public/locales/{code}/common.json`
4. Add translations for all keys

### Adding New Translation Keys

1. Add key to all language files in `public/locales/{locale}/common.json`
2. Use the key in components: `t('new_key')`

### Testing

- Visit different locale URLs: `/ru/`, `/uk/`, `/en/`, `/de/`
- Test language switching
- Verify translations load correctly
- Check browser language detection

## 🚨 Important Notes

1. **Server Components**: Cannot use `useTranslation` hook directly
2. **Client Components**: Must be marked with `'use client'`
3. **Translation Loading**: Uses HTTP backend for dynamic loading
4. **SSR Compatibility**: Configured for Next.js App Router
5. **Type Safety**: Use TypeScript for better development experience

## 🔗 Related Files

- `lib/i18n.ts` - Main configuration
- `components/LanguageSwitcher.tsx` - Language switching UI
- `components/I18nProvider.tsx` - Provider component
- `middleware.ts` - Locale detection
- `app/[locale]/layout.tsx` - Locale-specific layout
- `public/locales/` - Translation files 