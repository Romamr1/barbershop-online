'use client';

import { useState, useEffect } from 'react';
import { Barber, Barbershop } from '@/types';
import { barberApi, barbershopApi } from '@/lib/api';
import Header from '@/components/Header';
import { useTranslation } from '@/lib/useTranslation';
import { useLocale } from '@/lib/locale-context';
import Link from 'next/link';
import toast from 'react-hot-toast';
import AddBarberModal from '@/components/AddBarberModal';

export default function AdminBarbersPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBarbershop, setSelectedBarbershop] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [barbersRes, barbershopsRes] = await Promise.all([
        barberApi.getAll(),
        barbershopApi.getAll(),
      ]);

      setBarbers(barbersRes.data);
      setBarbershops(barbershopsRes.data.barbershops);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error(t('failed_to_load_dashboard_data') as string);
      setBarbers([]);
      setBarbershops([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBarber = async (barberData: any) => {
    try {
      await barberApi.createWithUser(barberData);
      toast.success(t('barber_created_successfully') as string);
      setShowAddModal(false);
      loadData(); // Reload the list
    } catch (error: any) {
      console.error('Error creating barber:', error);
      toast.error(error.message || t('failed_to_create_booking') as string);
    }
  };

  const handleAssignUserAsBarber = async (userId: string, barberShopId: string) => {
    try {
      await barberApi.assignUserAsBarber({ userId, barberShopId });
      toast.success(t('user_assigned_as_barber_successfully') as string);
      loadData(); // Reload the list
    } catch (error: any) {
      console.error('Error assigning user as barber:', error);
      toast.error(error.message || t('failed_to_create_booking') as string);
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">{t('manage_barbers') as string}</h1>
              <p className="text-primary-300 text-lg">
                {t('add_and_manage_barbers') as string}
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              {t('add_new_barber') as string}
            </button>
          </div>
        </div>

        {/* Barbers List */}
        <div className="card">
          <div className="p-6 border-b border-primary-700">
            <h2 className="text-2xl font-bold text-white">{t('all_barbers') as string}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary-700">
                  <th className="text-left p-4 text-primary-300">{t('name') as string}</th>
                  <th className="text-left p-4 text-primary-300">{t('email') as string}</th>
                  <th className="text-left p-4 text-primary-300">{t('barbershop') as string}</th>
                  <th className="text-left p-4 text-primary-300">{t('phone') as string}</th>
                  <th className="text-left p-4 text-primary-300">{t('specialties') as string}</th>
                  <th className="text-left p-4 text-primary-300">{t('actions') as string}</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(barbers) && barbers.map((barber) => (
                  <tr key={barber.id} className="border-b border-primary-700">
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center mr-3">
                          {barber.avatar ? (
                            <img
                              src={barber.avatar}
                              alt={barber.user?.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold">
                              {barber.user?.name?.charAt(0).toUpperCase() || 'B'}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{barber.user?.name || t('unknown_barber') as string}</p>
                          <p className="text-primary-400 text-sm">{barber.bio || t('no_bio') as string}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-white">{barber.user?.email || t('no_email') as string}</td>
                    <td className="p-4 text-white">{barber.barberShop?.name || t('unknown_barbershop') as string}</td>
                    <td className="p-4 text-white">{barber.user?.phone || t('no_phone') as string}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {barber.specialties && typeof barber.specialties === 'string' ? (
                          JSON.parse(barber.specialties).map((specialty: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-accent-600 text-white text-xs rounded-full"
                            >
                              {specialty}
                            </span>
                          ))
                        ) : (
                          <span className="text-primary-400 text-sm">{t('no_specialties') as string}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Link
                          href={`/${locale}/barber/${barber.id}`}
                          className="text-accent-400 hover:text-accent-300 text-sm"
                        >
                          {t('view') as string}
                        </Link>
                        <button
                          onClick={() => {
                            // Handle edit functionality
                          }}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          {t('edit') as string}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(!Array.isArray(barbers) || barbers.length === 0) && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-primary-400">
                      {t('no_barbers_found') as string}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Barber Modal */}
        {showAddModal && (
          <AddBarberModal
            barbershops={barbershops}
            onClose={() => setShowAddModal(false)}
            onAddBarber={handleAddBarber}
            onAssignUserAsBarber={handleAssignUserAsBarber}
          />
        )}
      </main>
    </div>
  );
} 