'use client';

import { useState, useEffect } from 'react';
import { Barbershop } from '@/types';
import BarbershopList from '@/components/BarbershopList';
import BarbershopMap from '@/components/BarbershopMap';
import FilterBar from '@/components/FilterBar';
import { barbershopApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { useTranslation } from '@/lib/useTranslation';

interface HomePageContentProps {
  locale: string;
}

export default function HomePageContent({ locale }: HomePageContentProps) {
  const { t } = useTranslation();
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [filteredBarbershops, setFilteredBarbershops] = useState<Barbershop[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    rating: 0,
  });

  useEffect(() => {
    loadBarbershops();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [barbershops, filters]);

  const loadBarbershops = async () => {
    try {
      setLoading(true);
      const response = await barbershopApi.getAll();
      // Parse JSON strings from backend - response.data.barbershops contains the array
      const parsedBarbershops = response.data.barbershops.map((shop: any) => ({
        ...shop,
        workingHours: shop.workingHours ? JSON.parse(shop.workingHours) : {},
        images: shop.images ? JSON.parse(shop.images) : [],
      }));
      setBarbershops(parsedBarbershops);
    } catch (error) {
      console.error('Error loading barbershops:', error);
      toast.error(t('failed_to_load_barbershops') as string);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...barbershops];

    if (filters.type) {
      filtered = filtered.filter(shop => shop.type === filters.type);
    }

    if (filters.location) {
      filtered = filtered.filter(shop => 
        shop.address.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.rating > 0) {
      filtered = filtered.filter(shop => shop.rating >= filters.rating);
    }

    setFilteredBarbershops(filtered);
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          {t('find_your_perfect_barbershop') as string}
        </h1>
        <p className="text-primary-300 text-lg">
          {t('book_appointments_at_the_best_barbershops') as string}
        </p>
      </div>

      <FilterBar 
        filters={filters} 
        onFilterChange={handleFilterChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="mt-8">
        {viewMode === 'list' ? (
          <BarbershopList barbershops={filteredBarbershops} />
        ) : (
          <BarbershopMap barbershops={filteredBarbershops} />
        )}
      </div>

      {filteredBarbershops.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-primary-400 text-lg">
            {t('no_barbershops_matching_criteria') as string}
          </p>
        </div>
      )}
    </main>
  );
} 