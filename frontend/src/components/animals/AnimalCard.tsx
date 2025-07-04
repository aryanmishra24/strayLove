import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, User, Heart, Activity } from 'lucide-react';
import type { Animal } from '../../types/animal';
import { processImageUrls } from '../../utils/imageUtils';

interface AnimalCardProps {
  animal: Animal;
  viewMode?: 'grid' | 'list';
}

const AnimalCard: React.FC<AnimalCardProps> = ({ animal, viewMode = 'grid' }) => {
  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'INJURED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'SICK':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'RECOVERING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getSpeciesIcon = (species: string) => {
    switch (species) {
      case 'DOG':
        return '🐕';
      case 'CAT':
        return '🐱';
      case 'BIRD':
        return '🐦';
      default:
        return '🐾';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getAgeText = (age?: string | number) => {
    if (!age) return 'Unknown';
    if (typeof age === 'number') {
      if (age <= 1) return 'Young';
      if (age <= 3) return 'Adult';
      if (age <= 7) return 'Adult';
      return 'Senior';
    }
    switch (age) {
      case 'PUPPY':
        return 'Puppy';
      case 'YOUNG':
        return 'Young';
      case 'ADULT':
        return 'Adult';
      case 'SENIOR':
        return 'Senior';
      default:
        return age;
    }
  };

  // Safely access nested properties with fallbacks
  const animalName = animal.name || `${animal.species} ${animal.breed || ''}`;
  const animalBreed = animal.breed && animal.breed !== 'Unknown' ? animal.breed : animal.species;
  const animalImages = processImageUrls(animal.images || animal.imageUrls || []);
  const animalLocation = animal.location || {};
  const animalReportedBy = animal.reportedBy || {};
  const animalTags = animal.tags || [];
  const lastSeenAt = animal.lastSeenAt || animal.createdAt || animal.reportedAt || '';
  
  // Handle reportedBy which can be string or object
  const reportedByName = typeof animalReportedBy === 'string' 
    ? animalReportedBy 
    : (animalReportedBy as any)?.name || 'Unknown';
  
  // Get location from either location object or locations array
  let locationCity = (animalLocation as any)?.city || 'Unknown';
  let locationState = (animalLocation as any)?.state || '';
  
  if (!(animalLocation as any)?.city && animal.locations && animal.locations.length > 0) {
    const currentLocation = animal.locations.find(loc => loc.isCurrent) || animal.locations[0];
    locationCity = currentLocation.city || 'Unknown';
    locationState = currentLocation.area || '';
  }
  
  const locationDisplay = locationState ? `${locationCity}, ${locationState}` : locationCity;
  const isNeutered = animal.isNeutered || animal.isSterilized || false;

  if (viewMode === 'list') {
    return (
      <Link
        to={`/animal/${animal.id}`}
        className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center space-x-4">
          {/* Image */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-lg bg-gray-200 dark:bg-gray-700 overflow-hidden">
              {animalImages.length > 0 ? (
                <img
                  src={animalImages[0]}
                  alt={animalName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  {getSpeciesIcon(animal.species)}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {animalName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {animalBreed}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getHealthStatusColor(animal.healthStatus)}`}>
                  {animal.healthStatus}
                </span>
                {isNeutered && (
                  <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full">
                    Neutered
                  </span>
                )}
              </div>
            </div>

            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{locationDisplay}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Last seen {formatDate(lastSeenAt)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{reportedByName}</span>
              </div>
            </div>

            {animal.description && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                {animal.description}
              </p>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // Grid view
  return (
    <Link
      to={`/animal/${animal.id}`}
      className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Image */}
      <div className="aspect-square bg-gray-200 dark:bg-gray-700 overflow-hidden">
        {animalImages.length > 0 ? (
          <img
            src={animalImages[0]}
            alt={animalName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            {getSpeciesIcon(animal.species)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {animalName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {animalBreed}
            </p>
          </div>
          <div className="flex items-center space-x-1 ml-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getHealthStatusColor(animal.healthStatus)}`}>
              {animal.healthStatus}
            </span>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{locationDisplay}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Last seen {formatDate(lastSeenAt)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Activity className="w-4 h-4" />
              <span>{getAgeText(animal.age)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span className="truncate">{reportedByName}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="w-4 h-4" />
              <span>{animal.gender}</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1">
          {isNeutered && (
            <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full">
              Neutered
            </span>
          )}
          {animal.isVaccinated && (
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
              Vaccinated
            </span>
          )}
          {animalTags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default AnimalCard; 