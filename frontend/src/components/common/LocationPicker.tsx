import React, { useState, useCallback, useEffect } from 'react';
import { MapPin, Navigation, X, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import Button from './Button';
import { GoogleMap, Marker } from '@react-google-maps/api';

interface Location {
  address: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  lat?: number;
  lng?: number;
}

interface LocationPickerProps {
  value: Location | null;
  onChange: (location: Location | null) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  onError,
  disabled = false,
  className = ''
}) => {
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempLocation, setTempLocation] = useState<Location | null>(null);
  const [retryTimeout, setRetryTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // Default to India center

  // Initialize address from value
  useEffect(() => {
    if (value) {
      setAddress(value.address || '');
      setTempLocation(value);
      setMapCenter({ lat: value.latitude, lng: value.longitude });
    }
  }, [value]);

  const geocodeAddress = useCallback(async (searchAddress: string): Promise<Location | null> => {
    if (!searchAddress.trim()) {
      return null;
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          searchAddress
        )}&key=${import.meta.env.VITE_GOOGLE_MAPS_API}`
      );

      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }

      const data = await response.json();

      if (data.status === 'REQUEST_DENIED') {
        throw new Error('Google Maps API key is not configured for geocoding. Please contact the administrator.');
      }

      if (data.status === 'ZERO_RESULTS') {
        throw new Error('No results found for this address');
      }

      if (data.status !== 'OK') {
        throw new Error(`Geocoding error: ${data.status}`);
      }

      const result = data.results[0];
      const location = result.geometry.location;
      const addressComponents = result.address_components;

      // Extract city and state from address components
      let city = '';
      let state = '';

      for (const component of addressComponents) {
        if (component.types.includes('locality')) {
          city = component.long_name;
        } else if (component.types.includes('administrative_area_level_1')) {
          state = component.long_name;
        }
      }

      return {
        address: result.formatted_address,
        latitude: location.lat,
        longitude: location.lng,
        city,
        state,
        lat: location.lat,
        lng: location.lng
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  }, []);

  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<Location> => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API}`
      );

      if (!response.ok) {
        throw new Error('Reverse geocoding request failed');
      }

      const data = await response.json();

      if (data.status === 'REQUEST_DENIED') {
        console.warn('Google Maps API key not configured for geocoding');
        // Return location with coordinates but no address
        return {
          address: `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          latitude: lat,
          longitude: lng,
          city: '',
          state: '',
          lat,
          lng
        };
      }

      if (data.status !== 'OK') {
        throw new Error(`Reverse geocoding error: ${data.status}`);
      }

      const result = data.results[0];
      const addressComponents = result.address_components;

      // Extract city and state
      let city = '';
      let state = '';

      for (const component of addressComponents) {
        if (component.types.includes('locality')) {
          city = component.long_name;
        } else if (component.types.includes('administrative_area_level_1')) {
          state = component.long_name;
        }
      }

      return {
        address: result.formatted_address,
        latitude: lat,
        longitude: lng,
        city,
        state,
        lat,
        lng
      };
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      // Return location with coordinates but no address
      return {
        address: `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        latitude: lat,
        longitude: lng,
        city: '',
        state: '',
        lat,
        lng
      };
    }
  }, []);

  const handleAddressSearch = useCallback(async () => {
    if (!address.trim()) {
      setError('Please enter an address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const location = await geocodeAddress(address);
      if (location) {
        setTempLocation(location);
        onChange(location);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to geocode address';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [address, geocodeAddress, onChange, onError]);

  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          const location = await reverseGeocode(latitude, longitude);

          setAddress(location.address);
          setTempLocation(location);
          onChange(location);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to get current location';
          setError(errorMessage);
          onError?.(errorMessage);
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        let errorMessage = 'Failed to get current location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        setError(errorMessage);
        onError?.(errorMessage);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  }, [onChange, onError, reverseGeocode]);

  const handleAddressChange = useCallback((newAddress: string) => {
    setAddress(newAddress);
    setError(null);

    // Clear existing timeout
    if (retryTimeout) {
      clearTimeout(retryTimeout);
    }

    // Set new timeout for auto-search
    const timeout = setTimeout(() => {
      if (newAddress.trim().length > 5) {
        handleAddressSearch();
      }
    }, 1000);

    setRetryTimeout(timeout);
  }, [retryTimeout, handleAddressSearch]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [retryTimeout]);

  const handleConfirmLocation = useCallback(() => {
    console.log('handleConfirmLocation called with tempLocation:', tempLocation);
    if (tempLocation) {
      console.log('Calling onChange with:', tempLocation);
      onChange(tempLocation);
    }
  }, [tempLocation, onChange]);

  const handleClearLocation = useCallback(() => {
    setAddress('');
    setTempLocation(null);
    onChange(null);
    setError(null);
  }, [onChange]);

  const handleMapClick = useCallback(async (event: google.maps.MapMouseEvent) => {
    console.log('Map clicked:', event.latLng);
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      try {
        const location = await reverseGeocode(lat, lng);
        console.log('Reverse geocoded location:', location);
        setTempLocation(location);
        setAddress(location.address);
      } catch (error) {
        console.error('Reverse geocoding failed:', error);
        // Still set the coordinates even if reverse geocoding fails
        const fallbackLocation = {
          address: '',
          latitude: lat,
          longitude: lng,
          city: '',
          state: '',
          lat,
          lng
        };
        console.log('Setting fallback location:', fallbackLocation);
        setTempLocation(fallbackLocation);
      }
    }
  }, [reverseGeocode]);

  const handleMapConfirm = useCallback(() => {
    console.log('handleMapConfirm called with tempLocation:', tempLocation);
    alert('Map confirm button clicked! tempLocation: ' + JSON.stringify(tempLocation));
    if (tempLocation) {
      console.log('Calling onChange from map confirm with:', tempLocation);
      onChange(tempLocation);
      setIsMapOpen(false);
    } else {
      console.log('No tempLocation to confirm');
    }
  }, [tempLocation, onChange]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Address
        </label>
        <div className="flex gap-2">
          <input
            id="address"
            value={address}
            onChange={(e) => handleAddressChange(e.target.value)}
            placeholder="Enter address or location"
            disabled={disabled || isLoading}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <Button
            type="button"
            onClick={handleAddressSearch}
            disabled={disabled || isLoading || !address.trim()}
            variant="outline"
            size="sm"
            title="Search address"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
          </Button>
          <Button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={disabled || isLoading}
            variant="outline"
            size="sm"
            title="Use current location"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
          </Button>
          <Button
            type="button"
            onClick={() => setIsMapOpen(true)}
            disabled={disabled}
            variant="outline"
            size="sm"
            title="Pick location on map"
          >
            <MapPin className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 border border-red-400 rounded-md bg-red-50 dark:bg-red-900/20">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm text-red-800 dark:text-red-200">
              {error.includes('REQUEST_DENIED') 
                ? 'Google Maps API key is not configured properly. Please contact the administrator.'
                : error
              }
            </div>
          </div>
        </div>
      )}

      {tempLocation && (
        <div className="p-4 border border-gray-200 rounded-md bg-gray-50 dark:bg-gray-800">
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Selected Location:</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{tempLocation.address}</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              Lat: {tempLocation.lat?.toFixed(6) || tempLocation.latitude.toFixed(6)}, 
              Lng: {tempLocation.lng?.toFixed(6) || tempLocation.longitude.toFixed(6)}
            </div>
            {tempLocation.city && tempLocation.state && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {tempLocation.city}, {tempLocation.state}
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                onClick={handleConfirmLocation}
                disabled={disabled}
                size="sm"
              >
                Confirm Location
              </Button>
              <Button
                type="button"
                onClick={handleClearLocation}
                disabled={disabled}
                variant="outline"
                size="sm"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {value && !tempLocation && (
        <div className="p-4 border border-gray-200 rounded-md bg-gray-50 dark:bg-gray-800">
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Current Location:</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{value.address}</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              Lat: {value.lat?.toFixed(6) || value.latitude.toFixed(6)}, 
              Lng: {value.lng?.toFixed(6) || value.longitude.toFixed(6)}
            </div>
            {value.city && value.state && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {value.city}, {value.state}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map Modal */}
      {isMapOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Pick Location on Map
              </h3>
              <button
                onClick={() => setIsMapOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden relative">
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={mapCenter}
                zoom={tempLocation ? 15 : 10}
                onClick={handleMapClick}
                options={{
                  zoomControl: true,
                  streetViewControl: false,
                  mapTypeControl: true,
                  fullscreenControl: true,
                }}
                onLoad={() => {
                  console.log('Google Map loaded successfully');
                }}
              >
                {tempLocation && (
                  <Marker
                    position={{ lat: tempLocation.latitude, lng: tempLocation.longitude }}
                    draggable
                    onDragEnd={async (e) => {
                      if (e.latLng) {
                        const lat = e.latLng.lat();
                        const lng = e.latLng.lng();
                        try {
                          const location = await reverseGeocode(lat, lng);
                          setTempLocation(location);
                          setAddress(location.address);
                        } catch (error) {
                          console.error('Reverse geocoding failed:', error);
                          setTempLocation({
                            address: '',
                            latitude: lat,
                            longitude: lng,
                            city: '',
                            state: '',
                            lat,
                            lng
                          });
                        }
                      }
                    }}
                  />
                )}
              </GoogleMap>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {tempLocation ? (
                  <div>
                    <div>Address: {tempLocation.address}</div>
                    <div>Coordinates: {tempLocation.latitude.toFixed(6)}, {tempLocation.longitude.toFixed(6)}</div>
                    {tempLocation.city && tempLocation.state && (
                      <div>{tempLocation.city}, {tempLocation.state}</div>
                    )}
                  </div>
                ) : (
                  <div>Click on the map to select a location</div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => setIsMapOpen(false)}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleMapConfirm}
                  disabled={!tempLocation}
                  size="sm"
                >
                  Confirm Location
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker; 