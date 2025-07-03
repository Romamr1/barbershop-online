import { supportedLanguages, defaultLanguage } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import EnvironmentInfo from '@/components/EnvironmentInfo';

const inter = Inter({ subsets: ['latin'] });

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

export default function LocaleLayout({ children, params }: LocaleLayoutProps) {
  // Validate the locale parameter
  if (!supportedLanguages.includes(params.locale as any)) {
    notFound();
  }

  return (
    <html lang={params.locale} className="dark">
      <body className={`${inter.className} bg-primary-900 text-white min-h-screen`}>
        {children}
        <EnvironmentInfo />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#fff',
              border: '1px solid #475569',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}

// Generate static params for all supported locales
export function generateStaticParams() {
  return supportedLanguages.map((locale) => ({
    locale,
  }));
} 