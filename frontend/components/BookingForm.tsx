'use client';

import { useState, useEffect } from 'react';
import { Barbershop, Barber, Service, TimeSlot } from '@/types';
import { timeSlotApi, bookingApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface BookingFormProps {
  barbershop: Barbershop;
  barbers: Barber[];
  services: Service[];
  onClose: () => void;
}

export default function BookingForm({ barbershop, barbers, services, onClose }: BookingFormProps) {
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
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0);

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
      toast.error('Failed to load available time slots');
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
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      await bookingApi.create({
        barbershopId: barbershop.id,
        barberId: selectedBarber.id,
        serviceIds: selectedServices.map(s => s.id),
        date: selectedDate,
        timeSlot: selectedTimeSlot.startTime,
        phone,
        notes: notes || undefined,
      });

      toast.success('Booking created successfully!');
      onClose();
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error(error.message || 'Failed to create booking');
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
            <h2 className="text-2xl font-bold text-white">Book Appointment</h2>
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
              <h3 className="text-lg font-semibold text-white mb-4">Choose Your Barber</h3>
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
                            alt={barber.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-bold text-white">
                            {barber.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{barber.name}</h4>
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
                  Continue
                </button>
              )}
            </div>
          )}

          {/* Step 2: Select Services */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Select Services</h3>
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
                        <div className="text-primary-400 text-sm">{service.duration} min</div>
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
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={selectedServices.length === 0}
                  className="btn-primary flex-1"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Select Date and Time */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Choose Date & Time</h3>
              
              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-primary-300 mb-2">
                  Select Date
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Choose a date</option>
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
                  <label className="block text-sm font-medium text-primary-300 mb-2">
                    Select Time
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {availableTimeSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`time-slot ${
                          selectedTimeSlot?.id === slot.id ? 'selected' : ''
                        } ${!slot.isAvailable ? 'unavailable' : ''}`}
                        disabled={!slot.isAvailable}
                      >
                        {new Date(slot.startTime).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={() => setStep(2)}
                  className="btn-outline flex-1"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!selectedDate || !selectedTimeSlot}
                  className="btn-primary flex-1"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Contact Info and Confirmation */}
          {step === 4 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input w-full"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="input w-full h-24 resize-none"
                    placeholder="Any special requests or notes..."
                  />
                </div>
              </div>

              {/* Booking Summary */}
              <div className="card p-4 mb-6">
                <h4 className="font-semibold text-white mb-3">Booking Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-primary-400">Barber:</span>
                    <span className="text-white">{selectedBarber?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-400">Services:</span>
                    <span className="text-white">{selectedServices.map(s => s.name).join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-400">Date:</span>
                    <span className="text-white">
                      {new Date(selectedDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-400">Time:</span>
                    <span className="text-white">
                      {selectedTimeSlot && new Date(selectedTimeSlot.startTime).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-400">Duration:</span>
                    <span className="text-white">{totalDuration} minutes</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t border-primary-700 pt-2">
                    <span className="text-primary-400">Total:</span>
                    <span className="text-accent-400">${totalPrice}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setStep(3)}
                  className="btn-outline flex-1"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !phone}
                  className="btn-primary flex-1"
                >
                  {loading ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 