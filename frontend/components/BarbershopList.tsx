'use client';

import Link from 'next/link';
import { Barbershop } from '@/types';
import { useLocale } from '@/lib/locale-context';

interface BarbershopListProps {
  barbershops: Barbershop[];
}

export default function BarbershopList({ barbershops }: BarbershopListProps) {
  const { locale } = useLocale();

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400' : 'text-primary-600'
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'premium':
        return 'bg-purple-600';
      case 'male':
        return 'bg-blue-600';
      case 'female':
        return 'bg-pink-600';
      case 'family':
        return 'bg-green-600';
      default:
        return 'bg-primary-600';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {barbershops.map((barbershop) => (
        <Link
          key={barbershop.id}
          href={`/${locale}/barbershop/${barbershop.id}`}
          className="card-hover group"
        >
          <div className="relative">
            {/* Image */}
            <div className="aspect-video bg-primary-700 rounded-t-lg overflow-hidden">
              {barbershop.images && barbershop.images.length > 0 ? (
                <img
                  src={barbershop.images[0]}
                  alt={barbershop.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              )}
            </div>

            {/* Type Badge */}
            <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium text-white ${getTypeColor(barbershop.type)}`}>
              {barbershop.type.charAt(0).toUpperCase() + barbershop.type.slice(1)}
            </div>

            {/* Rating Badge */}
            <div className="absolute top-3 right-3 bg-primary-900 bg-opacity-90 px-2 py-1 rounded-full text-xs font-medium text-white">
              {barbershop.rating.toFixed(1)}
            </div>
          </div>

          <div className="p-4">
            {/* Name */}
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-accent-400 transition-colors">
              {barbershop.name}
            </h3>

            {/* Address */}
            <p className="text-primary-400 text-sm mb-3 flex items-start">
              <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {barbershop.address}
            </p>

            {/* Rating and Reviews */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-1">
                {renderStars(barbershop.rating)}
                <span className="text-primary-400 text-sm ml-1">
                  ({barbershop.reviewCount} reviews)
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-primary-300 text-sm line-clamp-2">
              {barbershop.description}
            </p>

            {/* Book Now Button */}
            <div className="mt-4">
              <span className="inline-flex items-center text-accent-400 text-sm font-medium group-hover:text-accent-300 transition-colors">
                Book Now
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 