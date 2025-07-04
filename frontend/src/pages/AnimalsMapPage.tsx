import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Filter, Search, Navigation, Layers } from 'lucide-react';
import AnimalsMap from '../components/map/AnimalsMap';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { useAnimals, useNearbyAnimals } from '../hooks/useAnimals';
import type { Animal, AnimalFilters } from '../types/animal';
import Button from '../components/common/Button';

const AnimalsMapPage: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<AnimalFilters>({});
  const [searchRadius, setSearchRadius] = useState(5); // km
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 20.5937, lng: 78.9629 }); // India center
  const [showFilters, setShowFilters] = useState(false);
  const [nearbyMode, setNearbyMode] = useState(false);

  const { data: animalsData, isLoading: animalsLoading, isError: animalsError, error: animalsErrorObj } = useAnimals(filters, 1, 50);
  const { data: nearbyData, isLoading: nearbyLoading, isError: nearbyError, error: nearbyErrorObj } = useNearbyAnimals(
    userLocation ? userLocation.lat : undefined,
    userLocation ? userLocation.lng : undefined,
    searchRadius
  );

  // Get user location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos: { lat: number; lng: number } = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(userPos);
          setMapCenter(userPos);
        },
        (error) => {
          console.log('Error getting location:', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    console.log('[DEBUG] userLocation:', userLocation);
  }, [userLocation]);

  useEffect(() => {
    if (nearbyMode) {
      console.log('[DEBUG] Nearby mode activated');
      console.log('[DEBUG] useNearbyAnimals args:', userLocation ? userLocation.lat : undefined, userLocation ? userLocation.lng : undefined, searchRadius);
    }
  }, [nearbyMode, userLocation, searchRadius]);

  useEffect(() => {
    if (nearbyMode) {
      console.log('[DEBUG] nearbyData:', nearbyData);
      console.log('[DEBUG] nearbyLoading:', nearbyLoading);
      console.log('[DEBUG] nearbyError:', nearbyError);
      console.log('[DEBUG] nearbyErrorObj:', nearbyErrorObj);
    }
  }, [nearbyData, nearbyLoading, nearbyError, nearbyErrorObj, nearbyMode]);

  const handleMarkerClick = (animal: Animal) => {
    navigate(`/animal/${animal.id}`);
  };

  const handleSearchNearby = () => {
    if (userLocation) {
      setMapCenter(userLocation);
      setNearbyMode(true);
    } else {
      alert('Location not available. Please allow location access in your browser.');
    }
  };

  const handleClearFilters = () => {
    setFilters({});
    setNearbyMode(false);
  };

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value || undefined }));
  };

  const handleSpeciesFilter = (species: string) => {
    setFilters(prev => {
      const currentSpecies = prev.species || [];
      const newSpecies = currentSpecies.includes(species)
        ? currentSpecies.filter(s => s !== species)
        : [...currentSpecies, species];
      
      return {
        ...prev,
        species: newSpecies.length > 0 ? newSpecies : undefined,
      };
    });
  };

  const handleHealthFilter = (status: string) => {
    setFilters(prev => {
      const currentStatus = prev.healthStatus || [];
      const newStatus = currentStatus.includes(status)
        ? currentStatus.filter(s => s !== status)
        : [...currentStatus, status];
      
      return {
        ...prev,
        healthStatus: newStatus.length > 0 ? newStatus : undefined,
      };
    });
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof AnimalFilters];
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== '';
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Animals Map
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Interactive map showing all reported animals
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Search nearby button */}
              {userLocation && (
                <Button
                  variant="outline"
                  onClick={handleSearchNearby}
                  className="flex items-center space-x-2"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Search Nearby</span>
                </Button>
              )}

              {/* Filters toggle */}
              <Button
                variant={hasActiveFilters ? "primary" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search animals..."
                    value={filters.search || ''}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Species Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Species
                </label>
                <div className="space-y-2">
                  {['DOG', 'CAT', 'BIRD', 'OTHER'].map((species) => (
                    <label key={species} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={(filters.species || []).includes(species)}
                        onChange={() => handleSpeciesFilter(species)}
                        className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {species === 'DOG' ? '🐕 Dogs' : 
                         species === 'CAT' ? '🐱 Cats' : 
                         species === 'BIRD' ? '🐦 Birds' : '🐾 Other'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Health Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Health Status
                </label>
                <div className="space-y-2">
                  {['HEALTHY', 'INJURED', 'SICK', 'RECOVERING'].map((status) => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={(filters.healthStatus || []).includes(status)}
                        onChange={() => handleHealthFilter(status)}
                        className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {status}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Search Radius */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search Radius ({searchRadius} km)
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>1km</span>
                  <span>20km</span>
                </div>
              </div>
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="text-sm"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Map Container */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {nearbyMode ? (
            !userLocation ? (
              <div className="h-96 flex flex-col items-center justify-center text-center p-8">
                <div className="text-6xl mb-4">📍</div>
                <h3 className="text-lg font-semibold text-red-600 mb-2">Location not available</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Please allow location access in your browser to use the Nearby feature.
                </p>
                <Button variant="primary" onClick={() => setNearbyMode(false)}>Back to All</Button>
              </div>
            ) : nearbyLoading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
              </div>
            ) : nearbyError ? (
              <div className="h-96 flex flex-col items-center justify-center text-center p-8">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-red-600 mb-2">Failed to load nearby animals</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {nearbyErrorObj?.message || 'An error occurred while fetching nearby animals. Please try again.'}
                </p>
                <Button variant="primary" onClick={() => setNearbyMode(false)}>Back to All</Button>
              </div>
            ) : (
              <ErrorBoundary>
                <AnimalsMap
                  animals={nearbyData || []}
                  center={userLocation}
                  zoom={12}
                  height="600px"
                  showPopups={true}
                  onMarkerClick={handleMarkerClick}
                />
              </ErrorBoundary>
            )
          ) : (
            animalsLoading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
              </div>
            ) : animalsError ? (
              <div className="h-96 flex flex-col items-center justify-center text-center p-8">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-red-600 mb-2">Failed to load animals</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {animalsErrorObj?.message || 'An error occurred while fetching animals. Please try again.'}
                </p>
                <Button variant="primary" onClick={() => window.location.reload()}>Retry</Button>
              </div>
            ) : (
              <ErrorBoundary>
                <AnimalsMap
                  animals={animalsData?.content || []}
                  center={mapCenter}
                  zoom={12}
                  height="600px"
                  showPopups={true}
                  onMarkerClick={handleMarkerClick}
                />
              </ErrorBoundary>
            )
          )}
        </div>

        {/* Map Legend */}
        <div className="mt-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Map Legend
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Healthy</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Injured</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Sick</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Recovering</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Your Location</span>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          {nearbyMode ? (
            <>
              Showing {nearbyData?.length || 0} animals near you within {searchRadius}km
              <Button variant="outline" className="ml-2" onClick={() => setNearbyMode(false)}>Show All</Button>
            </>
          ) : (
            <>
              Showing {animalsData?.content?.length || 0} animals on the map
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimalsMapPage; 