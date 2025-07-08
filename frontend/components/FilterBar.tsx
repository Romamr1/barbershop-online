'use client';

import { useTranslation } from '@/lib/useTranslation';

interface FilterBarProps {
  filters: {
    type: string;
    location: string;
    rating: number;
  };
  onFilterChange: (filters: any) => void;
  viewMode: 'list' | 'map';
  onViewModeChange: (mode: 'list' | 'map') => void;
}

export default function FilterBar({ filters, onFilterChange, viewMode, onViewModeChange }: FilterBarProps) {
  const { t } = useTranslation();

  const handleTypeChange = (type: string) => {
    onFilterChange({ ...filters, type: filters.type === type ? '' : type });
  };

  const handleLocationChange = (location: string) => {
    onFilterChange({ ...filters, location });
  };

  const handleRatingChange = (rating: number) => {
    onFilterChange({ ...filters, rating: filters.rating === rating ? 0 : rating });
  };

  return (
    <div className="bg-primary-800 border border-primary-700 rounded-lg p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Type Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-primary-300 text-sm font-medium">{t('type') as string}:</span>
            <div className="flex space-x-2">
              {['male', 'female', 'premium', 'family'].map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    filters.type === type
                      ? 'bg-accent-600 text-white'
                      : 'bg-primary-700 text-primary-300 hover:bg-primary-600'
                  }`}
                >
                  {t(type) as string}
                </button>
              ))}
            </div>
          </div>

          {/* Location Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-primary-300 text-sm font-medium">{t('location') as string}:</span>
            <input
              type="text"
              placeholder={t('enter_location') as string}
              value={filters.location}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="input text-sm w-40"
            />
          </div>

          {/* Rating Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-primary-300 text-sm font-medium">{t('min_rating') as string}:</span>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRatingChange(rating)}
                  className={`p-1 rounded transition-colors ${
                    filters.rating >= rating
                      ? 'text-yellow-400'
                      : 'text-primary-500 hover:text-primary-400'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2">
          <span className="text-primary-300 text-sm font-medium">{t('view') as string}:</span>
          <div className="flex bg-primary-700 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-accent-600 text-white'
                  : 'text-primary-300 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => onViewModeChange('map')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'map'
                  ? 'bg-accent-600 text-white'
                  : 'text-primary-300 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 