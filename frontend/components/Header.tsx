import ClientOnly from './ClientOnly';
import HeaderContent from './HeaderContent';

export default function Header() {
  return (
    <header className="bg-primary-800 border-b border-primary-700 sticky top-0 z-50">
      <ClientOnly 
        fallback={
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-accent-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">B</span>
                </div>
                <span className="text-xl font-bold text-white">Barbershop</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-primary-600 rounded-full"></div>
                <div className="w-20 h-8 bg-primary-700 rounded"></div>
              </div>
            </div>
          </div>
        }
      >
        <HeaderContent />
      </ClientOnly>
    </header>
  );
} 