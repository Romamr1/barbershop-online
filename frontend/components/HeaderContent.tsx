'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User } from '@/types';
import { getCurrentUser, setCurrentUser } from '@/lib/auth';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { useTranslation } from '@/lib/useTranslation';
import { useLocale } from '@/lib/locale-context';
import LanguageSwitcher from './LanguageSwitcher';

export default function HeaderContent() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      setCurrentUser(null);
      setUser(null);
      toast.success(t('logged_out_successfully') as string);
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(t('failed_to_logout') as string);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between h-16">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-accent-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <span className="text-xl font-bold text-white">Barbershop</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href={`/${locale}`} className="text-primary-300 hover:text-white transition-colors">
            {t('home') as string}
          </Link>
          {user && (
            <>
              {user.role === 'client' && (
                <Link href={`/${locale}/bookings`} className="text-primary-300 hover:text-white transition-colors">
                  {t('my_bookings') as string}
                </Link>
              )}
              {user.role === 'barber' && (
                <Link href={`/${locale}/barber/dashboard`} className="text-primary-300 hover:text-white transition-colors">
                  {t('dashboard') as string}
                </Link>
              )}
              {user.role === 'admin' && (
                <Link href={`/${locale}/admin/dashboard`} className="text-primary-300 hover:text-white transition-colors">
                  {t('admin') as string}
                </Link>
              )}
            </>
          )}
        </nav>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2 text-primary-300 hover:text-white transition-colors"
              >
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:block">{user.name}</span>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-primary-800 border border-primary-700 rounded-lg shadow-lg py-2">
                  <div className="px-4 py-2 text-sm text-primary-400 border-b border-primary-700">
                    {user.email}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-primary-300 hover:bg-primary-700 transition-colors"
                  >
                    {t('logout') as string}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href={`/${locale}/login`} className="btn-outline">
                {t('login') as string}
              </Link>
              <Link href={`/${locale}/register`} className="btn-primary">
                {t('register') as string}
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-primary-300 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden py-4 border-t border-primary-700">
          <nav className="flex flex-col space-y-4">
            <Link href={`/${locale}`} className="text-primary-300 hover:text-white transition-colors">
              {t('home') as string}
            </Link>
            {user && (
              <>
                {user.role === 'client' && (
                  <Link href={`/${locale}/bookings`} className="text-primary-300 hover:text-white transition-colors">
                    {t('my_bookings') as string}
                  </Link>
                )}
                {user.role === 'barber' && (
                  <Link href={`/${locale}/barber/dashboard`} className="text-primary-300 hover:text-white transition-colors">
                    {t('dashboard') as string}
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link href={`/${locale}/admin/dashboard`} className="text-primary-300 hover:text-white transition-colors">
                    {t('admin') as string}
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  );
} 