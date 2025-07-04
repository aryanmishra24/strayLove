import React, { useState, useEffect } from 'react';
import { CareDashboard } from '../components/care';
import AnimalService from '../services/animalService';
import type { Animal } from '../types/animal';

const VolunteerCareLogsPage: React.FC = () => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedAnimalId, setSelectedAnimalId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnimals();
  }, []);

  const loadAnimals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await AnimalService.getAnimals({}, 1, 20); // Reduced from 100 to 20 animals
      setAnimals(response.content);
      if (response.content.length > 0 && !selectedAnimalId) {
        setSelectedAnimalId(Number(response.content[0].id));
      }
    } catch (err: any) {
      console.error('Error loading animals:', err);
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please try again or check your connection.');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError('Failed to load animals. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectedAnimal = animals.find(animal => animal.id === selectedAnimalId?.toString());

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="lg:col-span-3">
                <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                <button
                  onClick={loadAnimals}
                  className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-200 dark:bg-red-800 dark:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (animals.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No animals found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">There are no animals available for care management.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Volunteer Care Management
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Record and manage care activities for animals in need
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Animal Selection Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Select Animal
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {animals.map((animal) => (
                  <button
                    key={animal.id}
                    onClick={() => setSelectedAnimalId(Number(animal.id))}
                    className={`w-full text-left p-3 rounded-md border transition-colors ${
                      selectedAnimalId === Number(animal.id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="font-medium text-sm text-gray-900 dark:text-white">{animal.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {animal.species} • {animal.breed}
                    </div>
                    {animal.location && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        📍 {typeof animal.location === 'string' ? animal.location : `${animal.location.city || ''} ${animal.location.state || ''}`.trim()}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Care Dashboard */}
          <div className="lg:col-span-3">
            {selectedAnimal ? (
              <CareDashboard
                animalId={Number(selectedAnimal.id)}
                animalName={selectedAnimal.name || 'Unknown Animal'}
              />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Select an animal</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Choose an animal from the list to manage their care.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerCareLogsPage; 