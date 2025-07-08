'use client';

import { useState, useEffect } from 'react';
import { BookingWithDetails } from '@/types';
import { bookingApi } from '@/lib/api';
import Header from '@/components/Header';
import toast from 'react-hot-toast';
import { useTranslation } from '@/lib/useTranslation';

export default function BookingsPage() {
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

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm(t('cancel_booking_confirmation') as string)) return;

    try {
      await bookingApi.cancel(bookingId);
      toast.success(t('booking_cancelled_successfully') as string);
      loadBookings(); // Reload bookings
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      toast.error(error.message || t('failed_to_cancel_booking') as string);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'completed':
        return 'text-blue-400';
      case 'cancelled':
        return 'text-red-400';
      default:
        return 'text-primary-400';
    }
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

  return (
    <div className="min-h-screen bg-primary-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">{t('my_bookings') as string}</h1>
          <p className="text-primary-300 text-lg">
            {t('view_and_manage_appointments') as string}
          </p>
        </div>

        {(!Array.isArray(bookings) || bookings.length === 0) ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-primary-800 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-12 h-12 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{t('no_bookings_yet') as string}</h3>
            <p className="text-primary-400 mb-6">
              {t('no_bookings_yet_description') as string}
            </p>
            <a href="/" className="btn-primary">
              {t('browse_barbershops') as string}
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {Array.isArray(bookings) && bookings.map((booking) => (
              <div key={booking.id} className="card p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-white">
                        {booking.barbershop?.name || t('unknown_barbershop') as string}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)} bg-primary-700`}>
                        {t(booking.status) as string}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <span className="text-primary-400 text-sm">{t('barber') as string}</span>
                        <p className="text-white font-medium">{booking.barber.user?.name || t('unknown') as string}</p>
                      </div>
                      <div>
                        <span className="text-primary-400 text-sm">{t('date_time') as string}</span>
                        <p className="text-white font-medium">
                          {booking.startTime ? new Date(booking.startTime).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : 'N/A'}
                        </p>
                        <p className="text-primary-300 text-sm">
                          {booking.startTime ? new Date(booking.startTime).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          }) : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-primary-400 text-sm">{t('services') as string}</span>
                        <p className="text-white font-medium">
                          {Array.isArray(booking.services) ? booking.services.map(s => s.name).join(', ') : t('no_services') as string}
                        </p>
                      </div>
                      <div>
                        <span className="text-primary-400 text-sm">{t('total') as string}</span>
                        <p className="text-accent-400 font-semibold">${booking.totalPrice || 0}</p>
                        <p className="text-primary-300 text-sm">{booking.totalDuration || 0} {t('min') as string}</p>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="mb-4">
                        <span className="text-primary-400 text-sm">{t('notes') as string}</span>
                        <p className="text-white">{booking.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 lg:ml-6">
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="btn-outline text-sm"
                      >
                        {t('cancel_booking') as string}
                      </button>
                    )}
                    <a
                      href={`/barbershop/${booking.barbershop?.id || '#'}`}
                      className="btn-secondary text-sm"
                    >
                      {t('view_barbershop') as string}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 