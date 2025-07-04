import React, { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ChevronLeft, 
  ChevronRight, 
  Upload, 
  MapPin, 
  Camera, 
  X,
  CheckCircle,
  AlertCircle,
  Save,
  Edit
} from 'lucide-react';
import { useAnimal, useUpdateAnimal } from '../hooks/useAnimals';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import LocationPicker from '../components/common/LocationPicker';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Form validation schema (same as report form)
const editAnimalSchema = z.object({
  species: z.enum(['DOG', 'CAT', 'BIRD', 'OTHER'], {
    required_error: 'Please select a species',
  }),
  breed: z.string().min(1, 'Breed is required'),
  gender: z.enum(['MALE', 'FEMALE', 'UNKNOWN'], {
    required_error: 'Please select gender',
  }),
  healthStatus: z.enum(['HEALTHY', 'INJURED', 'SICK', 'RECOVERING'], {
    required_error: 'Please select health status',
  }),
  location: z.object({
    latitude: z.number().min(-90).max(90).refine(val => val !== undefined, { message: 'Latitude is required' }),
    longitude: z.number().min(-180).max(180).refine(val => val !== undefined, { message: 'Longitude is required' }),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
  }),
  isNeutered: z.boolean().default(false),
  isVaccinated: z.boolean().default(false),
});

type EditAnimalForm = z.infer<typeof editAnimalSchema>;

const EditAnimalPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <EditAnimalPageContent />
    </ErrorBoundary>
  );
};

const EditAnimalPageContent: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: animal, isLoading, isError } = useAnimal(id || '');
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  const updateAnimalMutation = useUpdateAnimal();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<EditAnimalForm>({
    resolver: zodResolver(editAnimalSchema),
    mode: 'onChange',
  });

  const watchedValues = watch();

  // Debug form validation
  React.useEffect(() => {
    console.log('Form validation state:', {
      isValid,
      errors,
      watchedValues,
      currentStep
    });
  }, [isValid, errors, watchedValues, currentStep]);

  // Helper function to check if form is ready to submit
  const isFormReadyToSubmit = () => {
    const hasRequiredFields = watchedValues.species && 
                             watchedValues.breed && 
                             watchedValues.gender && 
                             watchedValues.healthStatus &&
                             watchedValues.location?.address &&
                             watchedValues.location?.city &&
                             watchedValues.location?.state;
    
    const hasValidCoordinates = watchedValues.location?.latitude !== undefined && 
                               watchedValues.location?.longitude !== undefined;
    
    const hasNoErrors = Object.keys(errors).length === 0;
    
    console.log('Form validation check:', {
      hasRequiredFields,
      hasValidCoordinates,
      hasNoErrors,
      coordinates: watchedValues.location,
      errors: Object.keys(errors)
    });
    
    return hasRequiredFields && hasValidCoordinates && hasNoErrors;
  };

  // Check if user is authorized to edit this animal
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !animal) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Animal Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The animal you're looking for doesn't exist or has been removed.
          </p>
          <Button
            variant="primary"
            as="button"
            onClick={() => navigate('/animals')}
          >
            Back to Animals
          </Button>
        </div>
      </div>
    );
  }

  // Check if current user is the reporter
  const animalReportedBy = animal.reportedBy || {};
  const reportedById = typeof animalReportedBy === 'string' ? '' : (animalReportedBy as any)?.id || '';
  const reportedByEmail = typeof animalReportedBy === 'string' ? '' : (animalReportedBy as any)?.email || '';
  const reportedByName = typeof animalReportedBy === 'string' ? animalReportedBy : (animalReportedBy as any)?.name || '';

  const isCurrentUserReporter = user && (
    reportedById === user.id || 
    reportedByEmail === user.email || 
    reportedByName === user.name
  );

  if (!isCurrentUserReporter) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You can only edit animals that you reported.
          </p>
          <Button
            variant="primary"
            as="button"
            onClick={() => navigate(`/animals/${id}`)}
          >
            Back to Animal
          </Button>
        </div>
      </div>
    );
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return watchedValues.species && watchedValues.breed && watchedValues.gender && 
               watchedValues.healthStatus && !errors.species && 
               !errors.breed && !errors.gender && !errors.healthStatus;
      case 2:
        return watchedValues.location.address && watchedValues.location.city && 
               watchedValues.location.state && watchedValues.location.latitude && 
               watchedValues.location.longitude;
      case 3:
        return true; // Photos are optional
      case 4:
        return isValid;
      default:
        return false;
    }
  };

  // Initialize form with animal data
  React.useEffect(() => {
    if (animal) {
      // Set basic animal info
      setValue('species', animal.species);
      setValue('breed', animal.breed || '');
      setValue('gender', animal.gender);
      setValue('healthStatus', animal.healthStatus);
      setValue('isNeutered', animal.isNeutered || animal.isSterilized || false);
      setValue('isVaccinated', animal.isVaccinated);
      
      // Set location data with fallbacks
      const location = animal.location || {};
      const latitude = (location as any)?.latitude || 0;
      const longitude = (location as any)?.longitude || 0;
      const address = (location as any)?.address || '';
      const city = (location as any)?.city || '';
      const state = (location as any)?.state || '';
      
      setValue('location.latitude', latitude);
      setValue('location.longitude', longitude);
      setValue('location.address', address);
      setValue('location.city', city);
      setValue('location.state', state);
      
      // Trigger validation after setting values
      setTimeout(() => {
        // This ensures the form validates after all values are set
      }, 100);
    }
  }, [animal, setValue]);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length + images.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    setImages(prev => [...prev, ...validFiles]);

    // Create preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviewUrls(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }, [images]);

  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  }, []);

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: EditAnimalForm) => {
    try {
      const updateData = {
        species: data.species,
        breed: data.breed,
        color: data.breed, // Using breed as color for now
        gender: data.gender,
        temperament: 'FRIENDLY' as const, // Use proper enum value
        healthStatus: data.healthStatus,
        latitude: data.location.latitude,
        longitude: data.location.longitude,
        address: data.location.address,
        area: data.location.state, // Using state as area (backend expects area to be state/region)
        city: data.location.city
      };

      await updateAnimalMutation.mutateAsync({ id: animal.id.toString(), data: updateData });
      navigate(`/animals/${animal.id}`);
    } catch (error) {
      console.error('Error updating animal:', error);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Edit Basic Information
                  </h3>
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                    Update the essential details about the animal.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Species */}
              <Controller
                name="species"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Species *
                    </label>
                    <select
                      value={field.value}
                      onChange={field.onChange}
                      className={`mt-1 block w-full rounded-md text-gray-900 dark:text-gray-300 ${
                        errors.species 
                          ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary'
                      }`}
                    >
                      <option value="">Select species</option>
                      <option value="DOG">🐕 Dog</option>
                      <option value="CAT">🐱 Cat</option>
                      <option value="BIRD">🐦 Bird</option>
                      <option value="OTHER">🐾 Other</option>
                    </select>
                    {errors.species && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.species.message}</p>
                    )}
                  </div>
                )}
              />

              {/* Breed */}
              <Controller
                name="breed"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Breed *
                    </label>
                    <input
                      {...field}
                      placeholder="e.g., Golden Retriever, Persian, etc."
                      className={`mt-1 block w-full rounded-md text-gray-900 dark:text-gray-300 ${
                        errors.breed 
                          ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary'
                      }`}
                    />
                    {errors.breed && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.breed.message}</p>
                    )}
                  </div>
                )}
              />

              {/* Gender */}
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Gender *
                    </label>
                    <select
                      value={field.value}
                      onChange={field.onChange}
                      className={`mt-1 block w-full rounded-md text-gray-900 dark:text-gray-300 ${
                        errors.gender 
                          ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary'
                      }`}
                    >
                      <option value="">Select gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="UNKNOWN">Unknown</option>
                    </select>
                    {errors.gender && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.gender.message}</p>
                    )}
                  </div>
                )}
              />

              {/* Health Status */}
              <Controller
                name="healthStatus"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Health Status *
                    </label>
                    <select
                      value={field.value}
                      onChange={field.onChange}
                      className={`mt-1 block w-full rounded-md text-gray-900 dark:text-gray-300 ${
                        errors.healthStatus 
                          ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary'
                      }`}
                    >
                      <option value="">Select health status</option>
                      <option value="HEALTHY">🟢 Healthy</option>
                      <option value="INJURED">🔴 Injured</option>
                      <option value="SICK">🟡 Sick</option>
                      <option value="RECOVERING">🔵 Recovering</option>
                    </select>
                    {errors.healthStatus && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.healthStatus.message}</p>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Medical Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Medical Information (Optional)
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Update the animal's medical status if you have new information.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  name="isNeutered"
                  control={control}
                  render={({ field }) => (
                    <label className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Neutered/Spayed
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Animal has been sterilized
                        </p>
                      </div>
                    </label>
                  )}
                />
                <Controller
                  name="isVaccinated"
                  control={control}
                  render={({ field }) => (
                    <label className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Vaccinated
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Animal has received vaccinations
                        </p>
                      </div>
                    </label>
                  )}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <MapPin className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Update Location
                  </h3>
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                    Update the animal's current location if it has moved. Use the location picker for easy coordinate selection.
                  </p>
                </div>
              </div>
            </div>

            {/* Location Picker */}
            <LocationPicker
              value={{
                latitude: watchedValues.location?.latitude || 0,
                longitude: watchedValues.location?.longitude || 0,
                address: watchedValues.location?.address || '',
                city: watchedValues.location?.city || '',
                state: watchedValues.location?.state || '',
              }}
              onChange={(location) => {
                setValue('location.latitude', location.latitude);
                setValue('location.longitude', location.longitude);
                setValue('location.address', location.address);
                setValue('location.city', location.city);
                setValue('location.state', location.state);
              }}
              onError={(error) => {
                console.error('Location error:', error);
                // You could show a toast notification here
              }}
            />

            {/* Location Troubleshooting Guide */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Having trouble with location?
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    <p><strong>Common solutions:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Enable location permissions in your browser settings</li>
                      <li>Make sure you're using HTTPS (required for location access)</li>
                      <li>Check if your device's GPS is enabled</li>
                      <li>Try refreshing the page and allowing location access when prompted</li>
                      <li>If location still doesn't work, you can enter coordinates manually below</li>
                    </ul>
                    <p className="mt-2 text-xs">
                      <strong>Note:</strong> Location services require internet connection and may take a few seconds to work.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Address */}
              <Controller
                name="location.address"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Street Address *
                    </label>
                    <input
                      {...field}
                      placeholder="e.g., 123 Main Street"
                      className={`mt-1 block w-full rounded-md text-gray-900 dark:text-gray-300 placeholder-gray-600 dark:placeholder-gray-400 ${
                        errors.location?.address 
                          ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary'
                      }`}
                    />
                    {errors.location?.address && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.location.address.message}</p>
                    )}
                  </div>
                )}
              />

              {/* City */}
              <Controller
                name="location.city"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      City *
                    </label>
                    <input
                      {...field}
                      placeholder="e.g., Mumbai"
                      className={`mt-1 block w-full rounded-md text-gray-900 dark:text-gray-300 placeholder-gray-600 dark:placeholder-gray-400 ${
                        errors.location?.city 
                          ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary'
                      }`}
                    />
                    {errors.location?.city && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.location.city.message}</p>
                    )}
                  </div>
                )}
              />

              {/* State */}
              <Controller
                name="location.state"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      State *
                    </label>
                    <input
                      {...field}
                      placeholder="e.g., Maharashtra"
                      className={`mt-1 block w-full rounded-md text-gray-900 dark:text-gray-300 placeholder-gray-600 dark:placeholder-gray-400 ${
                        errors.location?.state 
                          ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary'
                      }`}
                    />
                    {errors.location?.state && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.location.state.message}</p>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Manual Coordinates (Optional) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Manual Coordinates (Optional)
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Only needed if location picker doesn't work. Use "Use My Location" above for automatic coordinates.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  name="location.latitude"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Latitude
                      </label>
                      <input
                        {...field}
                        type="number"
                        step="any"
                        placeholder="e.g., 19.0760"
                        className={`mt-1 block w-full rounded-md text-gray-900 dark:text-gray-300 placeholder-gray-600 dark:placeholder-gray-400 ${
                          errors.location?.latitude 
                            ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary'
                        }`}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                      {errors.location?.latitude && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.location.latitude.message}</p>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name="location.longitude"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Longitude
                      </label>
                      <input
                        {...field}
                        type="number"
                        step="any"
                        placeholder="e.g., 72.8777"
                        className={`mt-1 block w-full rounded-md text-gray-900 dark:text-gray-300 placeholder-gray-600 dark:placeholder-gray-400 ${
                          errors.location?.longitude 
                            ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary'
                        }`}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                      {errors.location?.longitude && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.location.longitude.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>
              
              {watchedValues.location.latitude && watchedValues.location.longitude && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                    <span className="text-sm text-green-800 dark:text-green-200">
                      Location set: {watchedValues.location.latitude.toFixed(6)}, {watchedValues.location.longitude.toFixed(6)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Camera className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Update Photos
                  </h3>
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                    Add new photos or keep existing ones. Note: Photo updates may require backend support.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Photos
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Existing photos will be preserved. You can add new ones if needed.
              </p>

              {/* Show existing images */}
              {(animal.images || animal.imageUrls || []).length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Current Photos</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {(animal.images || animal.imageUrls || []).map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Current photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          Existing
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload new images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Add New Photos {images.length > 0 ? `(${images.length}/5)` : ''}
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      PNG, JPG, GIF up to 10MB each
                    </p>
                  </label>
                </div>

                {/* New Image Previews */}
                {imagePreviewUrls.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">New Photos</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {imagePreviewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`New preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Review Your Changes
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Animal Details</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500 dark:text-gray-400">Species:</dt>
                      <dd className="text-gray-900 dark:text-white">{watchedValues.species}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500 dark:text-gray-400">Breed:</dt>
                      <dd className="text-gray-900 dark:text-white">{watchedValues.breed}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500 dark:text-gray-400">Gender:</dt>
                      <dd className="text-gray-900 dark:text-white">{watchedValues.gender}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500 dark:text-gray-400">Health Status:</dt>
                      <dd className="text-gray-900 dark:text-white">{watchedValues.healthStatus}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Location</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500 dark:text-gray-400">Address:</dt>
                      <dd className="text-gray-900 dark:text-white">{watchedValues.location?.address}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500 dark:text-gray-400">City:</dt>
                      <dd className="text-gray-900 dark:text-white">{watchedValues.location?.city}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500 dark:text-gray-400">State:</dt>
                      <dd className="text-gray-900 dark:text-white">{watchedValues.location?.state}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Photos</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {images.length} new photo(s) to add
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Edit Animal Report
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Update information for {animal.name || `${animal.species} ${animal.breed || ''}`}
              </p>
            </div>
            <Button
              variant="outline"
              as="button"
              onClick={() => navigate(`/animals/${animal.id}`)}
              className="flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Animal
            </Button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { id: 1, title: 'Basic Info', description: 'Animal details' },
              { id: 2, title: 'Location', description: 'Update location' },
              { id: 3, title: 'Photos', description: 'Add photos' },
              { id: 4, title: 'Review', description: 'Review changes' },
            ].map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id
                    ? 'bg-primary border-primary text-white'
                    : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
                {index < 3 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.id
                      ? 'bg-primary'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center space-x-4">
              {currentStep < 4 ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="flex items-center"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <div className="flex flex-col items-end space-y-2">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!isFormReadyToSubmit() || updateAnimalMutation.isPending}
                    className="flex items-center"
                    title={!isFormReadyToSubmit() ? `Missing required fields or validation errors` : ''}
                  >
                    {updateAnimalMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Updating...
                      </>
                    ) : (
                      <>
                        Save Changes
                        <Save className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                  {!isFormReadyToSubmit() && !updateAnimalMutation.isPending && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      Please fill in all required fields
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAnimalPage;