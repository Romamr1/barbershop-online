'use client';

import { useTranslation } from '@/lib/useTranslation';
import Header from '@/components/Header';
import LanguageSwitcher from '@/components/LanguageSwitcher';

// Client Component Example
function ClientComponent() {
  const { t } = useTranslation();

  return (
    <div className="card p-6 mb-6">
      <h3 className="text-xl font-bold text-white mb-4">Client Component Example</h3>
      <div className="space-y-2 text-primary-300">
        <p><strong>{t('hello') as string}:</strong> {t('hello') as string}</p>
        <p><strong>{t('welcome') as string}:</strong> {t('welcome') as string}</p>
        <p><strong>{t('language') as string}:</strong> {t('language') as string}</p>
        <p><strong>{t('change_language') as string}:</strong> {t('change_language') as string}</p>
      </div>
    </div>
  );
}

// Server Component Example (using static translations)
function ServerComponent() {
  return (
    <div className="card p-6 mb-6">
      <h3 className="text-xl font-bold text-white mb-4">Server Component Example</h3>
      <div className="space-y-2 text-primary-300">
        <p><strong>Static Text:</strong> This text is static and doesn't change with language</p>
        <p><strong>Note:</strong> Server components can't use useTranslation hook</p>
        <p><strong>Solution:</strong> Use client components or pass translations as props</p>
      </div>
    </div>
  );
}

export default function I18nDemoPage() {
  const { t, i18n } = useTranslation();

  return (
    <div className="min-h-screen bg-primary-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">i18n Demo Page</h1>
          <p className="text-primary-300 text-lg">
            {t('welcome') as string} to the internationalization demo!
          </p>
        </div>

        {/* Language Switcher */}
        <div className="card p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Language Switcher</h2>
          <div className="flex items-center space-x-4">
            <span className="text-primary-300">Current Language:</span>
            <LanguageSwitcher />
          </div>
          <p className="text-primary-400 mt-2">
            Language Code: <code className="bg-primary-700 px-2 py-1 rounded">{i18n?.language || 'ru'}</code>
          </p>
        </div>

        {/* Translation Examples */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ClientComponent />
          <ServerComponent />
        </div>

        {/* Common UI Elements */}
        <div className="card p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Common UI Elements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-primary-700 rounded-lg">
              <div className="text-2xl font-bold text-white mb-2">{t('home') as string}</div>
              <div className="text-primary-400 text-sm">Navigation</div>
            </div>
            <div className="text-center p-4 bg-primary-700 rounded-lg">
              <div className="text-2xl font-bold text-white mb-2">{t('login') as string}</div>
              <div className="text-primary-400 text-sm">Authentication</div>
            </div>
            <div className="text-center p-4 bg-primary-700 rounded-lg">
              <div className="text-2xl font-bold text-white mb-2">{t('dashboard') as string}</div>
              <div className="text-primary-400 text-sm">User Interface</div>
            </div>
            <div className="text-center p-4 bg-primary-700 rounded-lg">
              <div className="text-2xl font-bold text-white mb-2">{t('bookings') as string}</div>
              <div className="text-primary-400 text-sm">Business Logic</div>
            </div>
          </div>
        </div>

        {/* Barbershop Specific Terms */}
        <div className="card p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Barbershop Specific Terms</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-primary-700 rounded-lg">
              <h3 className="font-bold text-white mb-2">{t('barbershop') as string}</h3>
              <p className="text-primary-300 text-sm">{t('barbershops') as string}</p>
            </div>
            <div className="p-4 bg-primary-700 rounded-lg">
              <h3 className="font-bold text-white mb-2">{t('barbers') as string}</h3>
              <p className="text-primary-300 text-sm">{t('select_barber') as string}</p>
            </div>
            <div className="p-4 bg-primary-700 rounded-lg">
              <h3 className="font-bold text-white mb-2">{t('services') as string}</h3>
              <p className="text-primary-300 text-sm">{t('select_service') as string}</p>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        <div className="card p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Status Messages</h2>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-primary-300">{t('pending') as string}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-primary-300">{t('confirmed') as string}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-primary-300">{t('completed') as string}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-primary-300">{t('cancelled') as string}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 