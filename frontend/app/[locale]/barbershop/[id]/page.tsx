'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Barbershop, Barber, Service, ParsedBarbershop, ParsedBarber } from '@/types';
import { barbershopApi, barberApi, serviceApi } from '@/lib/api';
import Header from '@/components/Header';
import BookingForm from '@/components/BookingForm';
import toast from 'react-hot-toast';

export default function BarbershopDetailPage() {
  const params = useParams();
  const barbershopId = params.id as string;
  
  const [barbershop, setBarbershop] = useState<ParsedBarbershop | null>(null);
  const [barbers, setBarbers] = useState<ParsedBarber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    loadBarbershopData();
  }, [barbershopId]);

  const loadBarbershopData = async () => {
    try {
      setLoading(true);
      const [barbershopRes, barbersRes, servicesRes] = await Promise.all([
        barbershopApi.getById(barbershopId),
        barberApi.getAll(barbershopId),
        serviceApi.getAll(barbershopId),
      ]);

      // Parse JSON strings from backend
      const parsedBarbershop: ParsedBarbershop = {
        ...barbershopRes.data,
        workingHours: barbershopRes.data.workingHours ? JSON.parse(barbershopRes.data.workingHours) : {},
        images: barbershopRes.data.images ? JSON.parse(barbershopRes.data.images) : [],
      };

      const parsedBarbers: ParsedBarber[] = barbersRes.data.map((barber: any) => ({
        ...barber,
        specialties: barber.specialties ? JSON.parse(barber.specialties) : [],
        workingHours: barber.workingHours ? JSON.parse(barber.workingHours) : {},
        name: barber.user?.name || 'Unknown Barber',
      }));

      setBarbershop(parsedBarbershop);
      setBarbers(parsedBarbers);
      setServices(servicesRes.data);
    } catch (error) {
      console.error('Error loading barbershop data:', error);
      toast.error('Failed to load barbershop information');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${
          i < rating ? 'text-yellow-400' : 'text-primary-600'
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
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

  if (!barbershop) {
    return (
      <div className="min-h-screen bg-primary-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Barbershop not found</h1>
            <p className="text-primary-400">The barbershop you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Barbershop Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-4">{barbershop.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {renderStars(barbershop.rating || 0)}
                  <span className="text-primary-300 ml-2">
                    {(barbershop.rating || 0).toFixed(1)} ({barbershop.reviewCount || 0} reviews)
                  </span>
                </div>
                <span className="px-3 py-1 bg-accent-600 text-white text-sm rounded-full">
                  {(barbershop.type || 'Unknown').charAt(0).toUpperCase() + (barbershop.type || 'Unknown').slice(1)}
                </span>
              </div>
              <p className="text-primary-300 text-lg mb-4">{barbershop.description || 'No description available'}</p>
              <div className="flex items-center space-x-6 text-primary-400">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{barbershop.address}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{barbershop.phone}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 lg:mt-0 lg:ml-8">
              <button
                onClick={() => setShowBookingForm(true)}
                className="btn-primary px-8 py-3 text-lg"
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>

        {/* Images */}
        {barbershop.images && barbershop.images.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Gallery</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {barbershop.images.map((image, index) => (
                <div key={index} className="aspect-video bg-primary-700 rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`${barbershop.name || 'Barbershop'} - Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Services */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services && services.length > 0 ? (
              services.map((service) => (
                <div key={service.id} className="card p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">{service.name}</h3>
                  <p className="text-primary-400 text-sm mb-3">{service.description || 'No description available'}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-accent-400 font-semibold">${service.price}</span>
                    <span className="text-primary-400 text-sm">{service.durationMin} min</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-primary-400">No services available</p>
              </div>
            )}
          </div>
        </div>

        {/* Barbers */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Our Barbers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {barbers && barbers.length > 0 ? (
              barbers.map((barber) => (
                <div key={barber.id} className="card p-6 text-center">
                  <div className="w-20 h-20 bg-primary-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    {barber.avatar ? (
                      <img
                        src={barber.avatar}
                        alt={barber.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-white">
                        {(barber.name || 'B').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{barber.name || 'Unknown Barber'}</h3>
                  <p className="text-primary-400 text-sm mb-3">{barber.bio || 'No bio available'}</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {barber.specialties && barber.specialties.length > 0 ? (
                      barber.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-primary-700 text-primary-300 text-xs rounded-full"
                        >
                          {specialty}
                        </span>
                      ))
                    ) : (
                      <span className="text-primary-400 text-xs">No specialties listed</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-primary-400">No barbers available</p>
              </div>
            )}
          </div>
        </div>

        {/* Working Hours */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Working Hours</h2>
          <div className="card p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {barbershop.workingHours && Object.keys(barbershop.workingHours).length > 0 ? (
                Object.entries(barbershop.workingHours).map(([day, hours]: [string, any], index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-primary-300">
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </span>
                    <span className="text-white">
                      {hours && hours.isOpen ? `${hours.open} - ${hours.close}` : 'Closed'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-4">
                  <p className="text-primary-400">Working hours not available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <BookingForm
          barbershop={barbershop as any}
          barbers={barbers as any}
          services={services}
          onClose={() => setShowBookingForm(false)}
        />
      )}
    </div>
  );
} 