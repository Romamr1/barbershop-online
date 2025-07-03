import Header from '@/components/Header';
import ClientOnly from '@/components/ClientOnly';
import HomePageContent from '@/components/HomePageContent';

interface HomePageProps {
  params: {
    locale: string;
  };
}

export default function HomePage({ params }: HomePageProps) {
  return (
    <div className="min-h-screen bg-primary-900">
      <Header />
      <ClientOnly 
        fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="loading-spinner"></div>
          </div>
        }
      >
        <HomePageContent locale={params.locale} />
      </ClientOnly>
    </div>
  );
} 