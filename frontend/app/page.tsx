'use client';

import { useState, useEffect } from 'react';
import { Barbershop } from '@/types';
import BarbershopList from '@/components/BarbershopList';
import BarbershopMap from '@/components/BarbershopMap';
import FilterBar from '@/components/FilterBar';
import Header from '@/components/Header';
import { barbershopApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function HomePage() {
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
      toast.error('Failed to load barbershops');
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
          <h1 className="text-4xl font-bold text-white mb-4">
            Find Your Perfect Barbershop
          </h1>
          <p className="text-primary-300 text-lg">
            Book appointments at the best barbershops in your area
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
              No barbershops found matching your criteria
            </p>
          </div>
        )}
      </main>
    </div>
  );
} 