'use client';

import { useState, useEffect } from 'react';
import { Barbershop, Barber, Service, TimeSlot } from '@/types';
import { timeSlotApi, bookingApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { useTranslation } from '@/lib/useTranslation';

interface BookingFormProps {
  barbershop: Barbershop;
  barbers: Barber[];
  services: Service[];
  onClose: () => void;
}

export default function BookingForm({ barbershop, barbers, services, onClose }: BookingFormProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.durationMin, 0);

  useEffect(() => {
    if (selectedBarber && selectedDate) {
      loadTimeSlots();
    }
  }, [selectedBarber, selectedDate]);

  const loadTimeSlots = async () => {
    if (!selectedBarber) return;

    try {
      const response = await timeSlotApi.getAvailable(selectedBarber.id, selectedDate);
      setAvailableTimeSlots(response.data);
    } catch (error) {
      console.error('Error loading time slots:', error);
      toast.error(t('failed_to_load_time_slots') as string);
    }
  };

  const handleServiceToggle = (service: Service) => {
    setSelectedServices(prev => 
      prev.find(s => s.id === service.id)
        ? prev.filter(s => s.id !== service.id)
        : [...prev, service]
    );
  };

  const handleSubmit = async () => {
    if (!selectedBarber || selectedServices.length === 0 || !selectedTimeSlot || !phone) {
      toast.error(t('please_fill_all_required_fields') as string);
      return;
    }

    setLoading(true);

    try {
      await bookingApi.create({
        barberId: selectedBarber.id,
        serviceIds: selectedServices.map(s => s.id),
        startTime: selectedTimeSlot.startTime,
        endTime: selectedTimeSlot.endTime,
        phone,
        notes: notes || undefined,
      });

      toast.success(t('booking_created_successfully') as string);
      onClose();
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error(error.message || t('failed_to_create_booking') as string);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-primary-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-primary-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">{t('book_appointment') as string}</h2>
            <button
              onClick={onClose}
              className="text-primary-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-primary-400 mt-2">{barbershop.name}</p>
        </div>

        <div className="p-6">
          {/* Step 1: Select Barber */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">{t('choose_your_barber') as string}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {barbers.map((barber) => (
                  <button
                    key={barber.id}
                    onClick={() => setSelectedBarber(barber)}
                    className={`card p-4 text-left transition-colors ${
                      selectedBarber?.id === barber.id ? 'border-accent-500 bg-primary-700' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                        {barber.avatar ? (
                          <img
                            src={barber.avatar}
                            alt={barber.user?.name || t('unknown_barber') as string}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-bold text-white">
                            {barber.user?.name?.charAt(0).toUpperCase() || 'B'}
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{barber.user?.name || t('unknown_barber') as string}</h4>
                        <p className="text-primary-400 text-sm">{barber.bio}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {selectedBarber && (
                <button
                  onClick={() => setStep(2)}
                  className="btn-primary mt-6 w-full"
                >
                  {t('continue') as string}
                </button>
              )}
            </div>
          )}

          {/* Step 2: Select Services */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">{t('select_services') as string}</h3>
              <div className="space-y-3">
                {services.map((service) => (
                  <label
                    key={service.id}
                    className="card p-4 cursor-pointer hover:bg-primary-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedServices.some(s => s.id === service.id)}
                          onChange={() => handleServiceToggle(service)}
                          className="w-4 h-4 text-accent-600 bg-primary-700 border-primary-600 rounded focus:ring-accent-500"
                        />
                        <div>
                          <h4 className="font-semibold text-white">{service.name}</h4>
                          <p className="text-primary-400 text-sm">{service.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-accent-400 font-semibold">${service.price}</div>
                        <div className="text-primary-400 text-sm">{service.durationMin} {t('min') as string}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="btn-outline flex-1"
                >
                  {t('back') as string}
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={selectedServices.length === 0}
                  className="btn-primary flex-1"
                >
                  {t('continue') as string}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Select Date and Time */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">{t('select_date_and_time') as string}</h3>
              
              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-primary-300 text-sm font-medium mb-2">
                  {t('select_date') as string}
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input w-full"
                >
                  <option value="">{t('choose_date') as string}</option>
                  {getAvailableDates().map((date) => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div className="mb-6">
                  <label className="block text-primary-300 text-sm font-medium mb-2">
                    {t('select_time') as string}
                  </label>
                  {availableTimeSlots.length === 0 ? (
                    <p className="text-primary-400">{t('no_available_times') as string}</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {availableTimeSlots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedTimeSlot(slot)}
                          className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                            selectedTimeSlot?.id === slot.id
                              ? 'bg-accent-600 text-white'
                              : 'bg-primary-700 text-primary-300 hover:bg-primary-600'
                          }`}
                        >
                          {new Date(slot.startTime).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={() => setStep(2)}
                  className="btn-outline flex-1"
                >
                  {t('back') as string}
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!selectedTimeSlot}
                  className="btn-primary flex-1"
                >
                  {t('continue') as string}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Contact Information */}
          {step === 4 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">{t('contact_information') as string}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-primary-300 text-sm font-medium mb-2">
                    {t('phone') as string} *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t('enter_phone_number') as string}
                    className="input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-primary-300 text-sm font-medium mb-2">
                    {t('notes') as string}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('additional_notes_optional') as string}
                    className="input w-full h-24 resize-none"
                    rows={3}
                  />
                </div>

                {/* Summary */}
                <div className="card p-4">
                  <h4 className="font-semibold text-white mb-3">{t('booking_summary') as string}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-primary-400">{t('barber') as string}:</span>
                      <span className="text-white">{selectedBarber?.user?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-primary-400">{t('services') as string}:</span>
                      <span className="text-white">{selectedServices.map(s => s.name).join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-primary-400">{t('date') as string}:</span>
                      <span className="text-white">
                        {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : ''}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-primary-400">{t('time') as string}:</span>
                      <span className="text-white">
                        {selectedTimeSlot ? new Date(selectedTimeSlot.startTime).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        }) : ''}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-primary-400">{t('duration') as string}:</span>
                      <span className="text-white">{totalDuration} {t('min') as string}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold border-t border-primary-600 pt-2">
                      <span className="text-primary-400">{t('total') as string}:</span>
                      <span className="text-accent-400">${totalPrice}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => setStep(3)}
                  className="btn-outline flex-1"
                >
                  {t('back') as string}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !phone}
                  className="btn-primary flex-1"
                >
                  {loading ? t('creating_booking') as string : t('confirm_booking') as string}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 