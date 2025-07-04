import React, { useState } from 'react';
import AnimalFilters from '../components/animals/AnimalFilters';
import AnimalCard from '../components/animals/AnimalCard';
import Pagination from '../components/common/Pagination';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { useAnimals } from '../hooks/useAnimals';
import type { AnimalFilters as AnimalFiltersType } from '../types/animal';

const PAGE_SIZE = 12;

const AnimalListPage: React.FC = () => {
  const [filters, setFilters] = useState<AnimalFiltersType>({});
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data, isLoading, isError } = useAnimals(filters, page, PAGE_SIZE);

  const handleFiltersChange = (newFilters: AnimalFiltersType) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page on filter change
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <AnimalFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        totalResults={data?.totalElements || 0}
      />

      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
        </div>
      ) : isError ? (
        <div className="text-center text-red-500 py-16">
          Failed to load animals. Please try again later.
        </div>
      ) : data && data.content && data.content.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-16">
          No animals found matching your criteria.
        </div>
      ) : (
        <>
          {/* Animal cards */}
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {data?.content?.map((animal) => (
              <ErrorBoundary key={animal.id}>
                <AnimalCard animal={animal} viewMode={viewMode} />
              </ErrorBoundary>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8">
            <Pagination
              currentPage={page}
              totalPages={data?.totalPages || 1}
              onPageChange={handlePageChange}
              totalItems={data?.totalElements || 0}
              itemsPerPage={PAGE_SIZE}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AnimalListPage; 