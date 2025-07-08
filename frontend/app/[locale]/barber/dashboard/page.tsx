'use client';

import { useState, useEffect } from 'react';
import { BookingWithDetails } from '@/types';
import { bookingApi } from '@/lib/api';
import Header from '@/components/Header';
import { useTranslation } from '@/lib/useTranslation';
import toast from 'react-hot-toast';

export default function BarberDashboard() {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingApi.getAll();
      // The backend returns { data: { bookings: [...], pagination: {...} } }
      const bookingsData = response as any;
      setBookings(bookingsData.data?.bookings || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error(t('failed_to_load_bookings') as string);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getUpcomingBookings = () => {
    if (!Array.isArray(bookings)) return [];
    
    const now = new Date();
    return bookings.filter(booking => 
      booking.startTime && new Date(booking.startTime) > now && booking.status !== 'cancelled'
    ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  };

  const getTodayBookings = () => {
    if (!Array.isArray(bookings)) return [];
    
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    
    return bookings.filter(booking => {
      if (!booking.startTime) return false;
      const bookingDate = new Date(booking.startTime);
      return bookingDate >= todayStart && bookingDate < todayEnd && booking.status !== 'cancelled';
    }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  const upcomingBookings = getUpcomingBookings();
  const todayBookings = getTodayBookings();

  return (
    <div className="min-h-screen bg-primary-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">{t('dashboard') as string}</h1>
          <p className="text-primary-300 text-lg">
            {t('manage_your_appointments_and_schedule') as string}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-primary-400 text-sm">{t('todays_appointments') as string}</p>
                <p className="text-2xl font-bold text-white">{todayBookings.length}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-primary-400 text-sm">{t('upcoming') as string}</p>
                <p className="text-2xl font-bold text-white">{upcomingBookings.length}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-accent-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-primary-400 text-sm">{t('completed_today') as string}</p>
                <p className="text-2xl font-bold text-white">
                  {Array.isArray(bookings) ? bookings.filter(b => 
                    b.startTime && new Date(b.startTime).toDateString() === new Date().toDateString() && 
                    b.status === 'completed'
                  ).length : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">{t('todays_appointments') as string}</h2>
          {todayBookings.length === 0 ? (
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-primary-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{t('no_appointments_today') as string}</h3>
              <p className="text-primary-400">{t('you_are_all_caught_up') as string}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayBookings.map((booking) => (
                <div key={booking.id} className="card p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold text-white">
                          {booking.client?.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{booking.client?.name || t('unknown_client') as string}</h3>
                        <p className="text-primary-400">{booking.clientPhone || t('no_phone') as string}</p>
                        <p className="text-primary-300 text-sm">
                          {Array.isArray(booking.services) ? booking.services.map(s => s.name).join(', ') : t('no_services') as string}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-white">
                        {booking.startTime ? new Date(booking.startTime).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        }) : 'N/A'}
                      </p>
                      <p className="text-primary-400 text-sm">{booking.totalDuration || 0} {t('min') as string}</p>
                      <p className="text-accent-400 font-semibold">${booking.totalPrice || 0}</p>
                    </div>
                  </div>
                  {booking.notes && (
                    <div className="mt-4 p-3 bg-primary-700 rounded-lg">
                      <p className="text-primary-300 text-sm">
                        <span className="font-medium">{t('notes') as string}:</span> {booking.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Appointments */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('upcoming_appointments') as string}</h2>
          {upcomingBookings.length === 0 ? (
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-primary-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{t('no_upcoming_appointments') as string}</h3>
              <p className="text-primary-400">{t('you_are_all_set_for_now') as string}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="card p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold text-white">
                          {booking.client?.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{booking.client?.name || t('unknown_client') as string}</h3>
                        <p className="text-primary-400">{booking.clientPhone || t('no_phone') as string}</p>
                        <p className="text-primary-300 text-sm">
                          {booking.startTime ? new Date(booking.startTime).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : t('no_phone') as string}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-white">
                        {booking.startTime ? new Date(booking.startTime).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        }) : 'N/A'}
                      </p>
                      <p className="text-primary-400 text-sm">{booking.totalDuration || 0} {t('min') as string}</p>
                      <p className="text-accent-400 font-semibold">${booking.totalPrice || 0}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 