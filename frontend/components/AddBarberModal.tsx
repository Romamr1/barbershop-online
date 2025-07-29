'use client';

import { useState, useEffect } from 'react';
import { Barbershop } from '@/types';
import { useTranslation } from '@/lib/useTranslation';
import { barberApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface AddBarberModalProps {
  barbershops: Barbershop[];
  onClose: () => void;
  onAddBarber: (data: any) => Promise<void>;
  onAssignUserAsBarber: (userId: string, barberShopId: string) => Promise<void>;
}

export default function AddBarberModal({ barbershops, onClose, onAddBarber, onAssignUserAsBarber }: AddBarberModalProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'create' | 'assign'>('create');
  const [loading, setLoading] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedBarbershop, setSelectedBarbershop] = useState('');
  const [selectedUser, setSelectedUser] = useState('');

  // Form data for creating new barber
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    barberShopId: '',
    bio: '',
    avatar: '',
    specialties: [] as string[],
    workingHours: {} as Record<string, any>,
  });

  useEffect(() => {
    if (mode === 'assign' && selectedBarbershop) {
      loadAvailableUsers();
    }
  }, [mode, selectedBarbershop]);

  const loadAvailableUsers = async () => {
    try {
      const response = await barberApi.getAvailableUsers(selectedBarbershop);
      setAvailableUsers(response.data || []);
    } catch (error) {
      console.error('Error loading available users:', error);
      toast.error(t('failed_to_load_available_users') as string);
      setAvailableUsers([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'create') {
        // Clean up the form data before submission
        const cleanData = {
          ...formData,
          avatar: formData.avatar.trim() || undefined, // Convert empty string to undefined
          bio: formData.bio.trim() || undefined,
          phone: formData.phone.trim() || undefined,
        };
        await onAddBarber(cleanData);
      } else {
        await onAssignUserAsBarber(selectedUser, selectedBarbershop);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSpecialty = () => {
    const specialty = prompt(t('enter_specialty') as string);
    if (specialty) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, specialty]
      }));
    }
  };

  const removeSpecialty = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-primary-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-primary-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">{t('add_new_barber') as string}</h2>
            <button
              onClick={onClose}
              className="text-primary-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Mode Toggle */}
          <div className="mb-6">
            <div className="flex bg-primary-700 rounded-lg p-1">
              <button
                onClick={() => setMode('create')}
                className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                  mode === 'create'
                    ? 'bg-accent-600 text-white'
                    : 'text-primary-300 hover:text-white'
                }`}
              >
                {t('create_new_user') as string}
              </button>
              <button
                onClick={() => setMode('assign')}
                className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                  mode === 'assign'
                    ? 'bg-accent-600 text-white'
                    : 'text-primary-300 hover:text-white'
                }`}
              >
                {t('assign_existing_user') as string}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Barbershop Selection */}
            <div className="mb-6">
              <label className="block text-primary-300 text-sm font-medium mb-2">
                {t('select_barbershop') as string} *
              </label>
              <select
                value={mode === 'create' ? formData.barberShopId : selectedBarbershop}
                onChange={(e) => {
                  if (mode === 'create') {
                    handleInputChange('barberShopId', e.target.value);
                  } else {
                    setSelectedBarbershop(e.target.value);
                  }
                }}
                className="input w-full"
                required
              >
                <option value="">{t('choose_barbershop') as string}</option>
                {barbershops.map((barbershop) => (
                  <option key={barbershop.id} value={barbershop.id}>
                    {barbershop.name}
                  </option>
                ))}
              </select>
            </div>

            {mode === 'create' ? (
              /* Create New User Form */
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-primary-300 text-sm font-medium mb-2">
                      {t('name') as string} *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-primary-300 text-sm font-medium mb-2">
                      {t('email') as string} *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="input w-full"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-primary-300 text-sm font-medium mb-2">
                      {t('password') as string} *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="input w-full"
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label className="block text-primary-300 text-sm font-medium mb-2">
                      {t('phone') as string}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="input w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-primary-300 text-sm font-medium mb-2">
                    {t('bio') as string}
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="input w-full h-24 resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-primary-300 text-sm font-medium mb-2">
                    {t('avatar_url') as string}
                  </label>
                  <input
                    type="url"
                    value={formData.avatar}
                    onChange={(e) => handleInputChange('avatar', e.target.value)}
                    className="input w-full"
                    placeholder="https://example.com/avatar.jpg (optional)"
                  />
                  <p className="text-primary-400 text-xs mt-1">
                    {t('avatar_url_optional') as string}
                  </p>
                </div>

                <div>
                  <label className="block text-primary-300 text-sm font-medium mb-2">
                    {t('specialties') as string}
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-accent-600 text-white text-sm rounded-full flex items-center"
                      >
                        {specialty}
                        <button
                          type="button"
                          onClick={() => removeSpecialty(index)}
                          className="ml-2 text-white hover:text-red-300"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addSpecialty}
                    className="btn-outline text-sm"
                  >
                    {t('add_specialty') as string}
                  </button>
                </div>
              </div>
            ) : (
              /* Assign Existing User Form */
              <div>
                <label className="block text-primary-300 text-sm font-medium mb-2">
                  {t('select_user') as string} *
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="input w-full"
                  required
                >
                  <option value="">{t('choose_user') as string}</option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                {availableUsers.length === 0 && (
                  <p className="text-primary-400 text-sm mt-2">
                    {t('no_available_users') as string}
                  </p>
                )}
              </div>
            )}

            <div className="flex space-x-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="btn-outline flex-1"
              >
                {t('cancel') as string}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? t('creating_barber') as string : t('add_barber') as string}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 