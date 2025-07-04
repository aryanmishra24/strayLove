import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { MapPin, Heart, Activity, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Animal } from '../../types/animal';
import { processImageUrls } from '../../utils/imageUtils';

interface AnimalsMapProps {
  animals: Animal[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  showPopups?: boolean;
  onMarkerClick?: (animal: Animal) => void;
}

const AnimalsMap: React.FC<AnimalsMapProps> = ({
  animals,
  center = { lat: 20.5937, lng: 78.9629 }, // India center
  zoom = 12,
  height = '600px',
  showPopups = true,
  onMarkerClick,
}) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [mapCenter, setMapCenter] = useState(center);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Get user location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
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

  const handleMarkerClick = useCallback((animal: Animal) => {
    if (onMarkerClick) {
      onMarkerClick(animal);
    } else {
      setSelectedAnimal(animal);
    }
  }, [onMarkerClick]);

  const handleInfoWindowClose = useCallback(() => {
    setSelectedAnimal(null);
  }, []);

  const handleMapLoad = useCallback(() => {
    setIsMapLoaded(true);
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return 'text-green-600';
      case 'INJURED':
        return 'text-red-600';
      case 'SICK':
        return 'text-yellow-600';
      case 'RECOVERING':
        return 'text-blue-600';
      case 'CRITICAL':
        return 'text-dark-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const mapContainerStyle = {
    width: '100%',
    height: height,
  };

  const mapOptions = {
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: true,
    fullscreenControl: true,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }],
      },
    ],
  };

  // Filter animals with valid location data
  const animalsWithLocation = (animals || []).filter(animal => {
    if (animal.location && animal.location.latitude && animal.location.longitude) {
      return true;
    }
    if (animal.locations && animal.locations.length > 0) {
      const currentLocation = animal.locations.find(loc => loc.isCurrent) || animal.locations[0];
      return currentLocation && currentLocation.latitude && currentLocation.longitude;
    }
    return false;
  });

  return (
    <div style={{ height, width: '100%' }} className="rounded-lg overflow-hidden">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={zoom}
        options={mapOptions}
        onLoad={handleMapLoad}
      >
        {/* User location marker */}
        {userLocation && isMapLoaded && (
          <Marker
            position={userLocation}
            icon={{
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
                </svg>
              `)}`,
              scaledSize: new google.maps.Size(20, 20),
              anchor: new google.maps.Point(10, 10),
            }}
          />
        )}

        {/* Animal markers */}
        {isMapLoaded && animalsWithLocation.map((animal) => {
          // Get location from either location object or locations array
          let lat = 0;
          let lng = 0;
          
          if (animal.location && animal.location.latitude && animal.location.longitude) {
            lat = animal.location.latitude;
            lng = animal.location.longitude;
          } else if (animal.locations && animal.locations.length > 0) {
            const currentLocation = animal.locations.find(loc => loc.isCurrent) || animal.locations[0];
            if (currentLocation && currentLocation.latitude && currentLocation.longitude) {
              lat = currentLocation.latitude;
              lng = currentLocation.longitude;
            }
          }
          
          const getIconColor = (healthStatus: string) => {
            if (!healthStatus) return '#6B7280'; // gray
            switch (healthStatus) {
              case 'HEALTHY':
                return '#10B981'; // green
              case 'INJURED':
                return '#EF4444'; // red
              case 'SICK':
                return '#F59E0B'; // yellow
              case 'RECOVERING':
                return '#3B82F6'; // blue
              case 'CRITICAL':
                return '#DC2626'; // dark red
              default:
                return '#6B7280'; // gray
            }
          };

          const getSpeciesIcon = (species: string) => {
            if (!species) return '🐾';
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
          
          return (
            <Marker
              key={animal.id}
              position={{ lat, lng }}
              icon={{
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                  <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="18" fill="${getIconColor(animal.healthStatus)}" stroke="white" stroke-width="2"/>
                    <text x="20" y="25" text-anchor="middle" font-size="16" fill="white" font-family="Arial, sans-serif">
                      ${getSpeciesIcon(animal.species)}
                    </text>
                  </svg>
                `)}`,
                scaledSize: new google.maps.Size(40, 40),
                anchor: new google.maps.Point(20, 20),
              }}
              onClick={() => handleMarkerClick(animal)}
            />
          );
        })}

        {/* Info Window for selected animal */}
        {selectedAnimal && showPopups && isMapLoaded && (() => {
          // Get location from either location object or locations array
          let lat = 0;
          let lng = 0;
          
          if (selectedAnimal.location && selectedAnimal.location.latitude && selectedAnimal.location.longitude) {
            lat = selectedAnimal.location.latitude;
            lng = selectedAnimal.location.longitude;
          } else if (selectedAnimal.locations && selectedAnimal.locations.length > 0) {
            const currentLocation = selectedAnimal.locations.find(loc => loc.isCurrent) || selectedAnimal.locations[0];
            if (currentLocation && currentLocation.latitude && currentLocation.longitude) {
              lat = currentLocation.latitude;
              lng = currentLocation.longitude;
            }
          }
          
          // Only show InfoWindow if we have valid coordinates
          if (lat === 0 && lng === 0) {
            return null;
          }
          
          return (
            <InfoWindow
              position={{ lat, lng }}
              onCloseClick={handleInfoWindowClose}
            >
              <div className="min-w-[250px] p-2">
                <div className="flex items-start space-x-3">
                  {/* Animal image */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden">
                      {(() => {
                        const animalImages = processImageUrls(selectedAnimal.imageUrls || selectedAnimal.images || []);
                        return animalImages.length > 0 ? (
                          <img
                            src={animalImages[0]}
                            alt={selectedAnimal.name || selectedAnimal.species}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            {selectedAnimal.species === 'DOG' ? '🐕' : 
                             selectedAnimal.species === 'CAT' ? '🐱' : 
                             selectedAnimal.species === 'BIRD' ? '🐦' : '🐾'}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Animal info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {selectedAnimal.name || `${selectedAnimal.species} ${selectedAnimal.breed || ''}`}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedAnimal.breed && selectedAnimal.breed !== 'Unknown' ? selectedAnimal.breed : selectedAnimal.species}
                    </p>
                    
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center space-x-1 text-sm">
                        <Heart className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-300">{selectedAnimal.gender}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm">
                        <Activity className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-300">
                          {selectedAnimal.age || 'Unknown'} age
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-300">
                          Last seen {formatDate(selectedAnimal.lastSeenAt || selectedAnimal.updatedAt)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(selectedAnimal.healthStatus)} bg-opacity-10`}>
                        {selectedAnimal.healthStatus}
                      </span>
                    </div>

                    <div className="mt-3">
                      <Link
                        to={`/animal/${selectedAnimal.id}`}
                        className="inline-flex items-center px-3 py-1 bg-primary text-white text-sm rounded-md hover:bg-primary/90 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </InfoWindow>
          );
        })()}
      </GoogleMap>

      {/* Animals count */}
      <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg px-2 py-1 text-xs z-10">
        <div className="flex items-center space-x-1">
          <MapPin className="w-3 h-3 text-blue-600" />
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            {animalsWithLocation.length} animals
          </span>
        </div>
      </div>
    </div>
  );
};

export default AnimalsMap; 