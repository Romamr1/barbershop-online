'use client';

import { useState, useEffect } from 'react';
import { Barbershop, BookingWithDetails } from '@/types';
import { barbershopApi, bookingApi } from '@/lib/api';
import Header from '@/components/Header';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [barbershopsRes, bookingsRes] = await Promise.all([
        barbershopApi.getAll(),
        bookingApi.getAll(),
      ]);

      setBarbershops(barbershopsRes.data.barbershops);
      setBookings(bookingsRes.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const totalRevenue = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + b.totalPrice, 0);

    return {
      totalBookings,
      pendingBookings,
      completedBookings,
      totalRevenue,
    };
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

  const stats = getStats();

  return (
    <div className="min-h-screen bg-primary-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Admin Dashboard</h1>
          <p className="text-primary-300 text-lg">
            Manage your barbershop operations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-primary-400 text-sm">Total Bookings</p>
                <p className="text-2xl font-bold text-white">{stats.totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-primary-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-white">{stats.pendingBookings}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-primary-400 text-sm">Completed</p>
                <p className="text-2xl font-bold text-white">{stats.completedBookings}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-accent-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-primary-400 text-sm">Revenue</p>
                <p className="text-2xl font-bold text-white">${stats.totalRevenue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Recent Bookings</h2>
          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary-700">
                    <th className="text-left p-4 text-primary-300">Client</th>
                    <th className="text-left p-4 text-primary-300">Barbershop</th>
                    <th className="text-left p-4 text-primary-300">Barber</th>
                    <th className="text-left p-4 text-primary-300">Date</th>
                    <th className="text-left p-4 text-primary-300">Status</th>
                    <th className="text-left p-4 text-primary-300">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 10).map((booking) => (
                    <tr key={booking.id} className="border-b border-primary-700">
                      <td className="p-4">
                        <div>
                          <p className="text-white font-medium">{booking.client.name}</p>
                          <p className="text-primary-400 text-sm">{booking.clientPhone}</p>
                        </div>
                      </td>
                      <td className="p-4 text-white">{booking.barbershop.name}</td>
                      <td className="p-4 text-white">{booking.barber.user?.name || 'Unknown'}</td>
                      <td className="p-4">
                        <p className="text-white">
                          {new Date(booking.startTime).toLocaleDateString()}
                        </p>
                        <p className="text-primary-400 text-sm">
                          {new Date(booking.startTime).toLocaleTimeString()}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-600 text-white' :
                          booking.status === 'pending' ? 'bg-yellow-600 text-white' :
                          booking.status === 'completed' ? 'bg-blue-600 text-white' :
                          'bg-red-600 text-white'
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-4 text-accent-400 font-semibold">${booking.totalPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Barbershops */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Barbershops</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {barbershops.map((barbershop) => (
              <div key={barbershop.id} className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-2">{barbershop.name}</h3>
                <p className="text-primary-400 text-sm mb-4">{barbershop.address}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-accent-600 text-white text-xs rounded-full">
                      {barbershop.type}
                    </span>
                    <span className="text-primary-400 text-sm">
                      ⭐ {barbershop.rating.toFixed(1)}
                    </span>
                  </div>
                  <a
                    href={`/barbershop/${barbershop.id}`}
                    className="text-accent-400 hover:text-accent-300 text-sm"
                  >
                    View Details →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
} 