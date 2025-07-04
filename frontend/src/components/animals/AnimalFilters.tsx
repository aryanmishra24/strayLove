import React, { useState } from 'react';
import { Search, Filter, X, Grid, List } from 'lucide-react';
import type { AnimalFilters } from '../../types/animal';

interface AnimalFiltersProps {
  filters: AnimalFilters;
  onFiltersChange: (filters: AnimalFilters) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  totalResults: number;
}

const AnimalFilters: React.FC<AnimalFiltersProps> = ({
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
  totalResults,
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const speciesOptions = [
    { value: 'DOG', label: 'Dog' },
    { value: 'CAT', label: 'Cat' },
    { value: 'BIRD', label: 'Bird' },
    { value: 'OTHER', label: 'Other' },
  ];

  const healthStatusOptions = [
    { value: 'HEALTHY', label: 'Healthy' },
    { value: 'INJURED', label: 'Injured' },
    { value: 'SICK', label: 'Sick' },
    { value: 'RECOVERING', label: 'Recovering' },
  ];

  const genderOptions = [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
    { value: 'UNKNOWN', label: 'Unknown' },
  ];

  const ageOptions = [
    { value: 'PUPPY', label: 'Puppy' },
    { value: 'YOUNG', label: 'Young' },
    { value: 'ADULT', label: 'Adult' },
    { value: 'SENIOR', label: 'Senior' },
  ];

  const statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'ADOPTED', label: 'Adopted' },
    { value: 'DECEASED', label: 'Deceased' },
    { value: 'RELOCATED', label: 'Relocated' },
  ];

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value || undefined });
  };

  const handleMultiSelectChange = (field: keyof AnimalFilters, value: string) => {
    const currentValues = (filters[field] as string[]) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onFiltersChange({
      ...filters,
      [field]: newValues.length > 0 ? newValues : undefined,
    });
  };

  const handleBooleanChange = (field: keyof AnimalFilters, value: boolean) => {
    onFiltersChange({
      ...filters,
      [field]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof AnimalFilters];
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== '';
  });

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Animals ({totalResults})
          </h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
              <span>Clear filters</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Filters toggle */}
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
              hasActiveFilters
                ? 'border-primary text-primary bg-primary/10'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-primary rounded-full"></span>
            )}
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search animals by name, breed, or location..."
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent pl-12"
        />
      </div>

      {/* Filters panel */}
      {isFiltersOpen && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Species */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Species
              </label>
              <div className="space-y-2">
                {speciesOptions.map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={(filters.species || []).includes(option.value)}
                      onChange={() => handleMultiSelectChange('species', option.value)}
                      className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Health Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Health Status
              </label>
              <div className="space-y-2">
                {healthStatusOptions.map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={(filters.healthStatus || []).includes(option.value)}
                      onChange={() => handleMultiSelectChange('healthStatus', option.value)}
                      className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gender
              </label>
              <div className="space-y-2">
                {genderOptions.map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={(filters.gender || []).includes(option.value)}
                      onChange={() => handleMultiSelectChange('gender', option.value)}
                      className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Age
              </label>
              <div className="space-y-2">
                {ageOptions.map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={(filters.age || []).includes(option.value)}
                      onChange={() => handleMultiSelectChange('age', option.value)}
                      className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <div className="space-y-2">
                {statusOptions.map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={(filters.status || []).includes(option.value)}
                      onChange={() => handleMultiSelectChange('status', option.value)}
                      className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Medical Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Medical Status
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.isNeutered === true}
                    onChange={(e) => handleBooleanChange('isNeutered', e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Neutered
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.isVaccinated === true}
                    onChange={(e) => handleBooleanChange('isVaccinated', e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Vaccinated
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimalFilters; 