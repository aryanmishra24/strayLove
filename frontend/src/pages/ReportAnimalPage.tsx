import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Send
} from 'lucide-react';
import { useReportAnimal } from '../hooks/useAnimals';
import Button from '../components/common/Button';
import LocationPicker from '../components/common/LocationPicker';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Form validation schema
const reportAnimalSchema = z.object({
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
    latitude: z.number(),
    longitude: z.number(),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
  }),
  isNeutered: z.boolean().optional().default(false),
  isVaccinated: z.boolean().optional().default(false),
});

type ReportAnimalForm = z.infer<typeof reportAnimalSchema>;

const steps = [
  { id: 1, title: 'Basic Information', description: 'Animal details' },
  { id: 2, title: 'Location', description: 'Where you found the animal' },
  { id: 3, title: 'Photos', description: 'Upload photos' },
  { id: 4, title: 'Review & Submit', description: 'Review and submit report' },
];

const ReportAnimalPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  const reportAnimalMutation = useReportAnimal();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<ReportAnimalForm>({
    resolver: zodResolver(reportAnimalSchema),
    mode: 'onChange',
    defaultValues: {
      species: undefined,
      breed: '',
      gender: undefined,
      healthStatus: undefined,
      location: {
        latitude: 0,
        longitude: 0,
        address: '',
        city: '',
        state: '',
      },
      isNeutered: false,
      isVaccinated: false,
    },
  });

  const watchedValues = watch();

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
        return true; // Photos are optional for now
      case 4:
        // For the final step, check if all required fields are filled
        return watchedValues.species && watchedValues.breed && watchedValues.gender && 
               watchedValues.healthStatus && watchedValues.location.address && 
               watchedValues.location.city && watchedValues.location.state && 
               watchedValues.location.latitude && watchedValues.location.longitude;
      default:
        return false;
    }
  };

  // Check if form is ready for submission
  const isFormReadyForSubmission = () => {
    return watchedValues.species && watchedValues.breed && watchedValues.gender && 
           watchedValues.healthStatus && watchedValues.location.address && 
           watchedValues.location.city && watchedValues.location.state && 
           watchedValues.location.latitude && watchedValues.location.longitude;
  };

  // Debug form state
  console.log('Form state:', {
    isValid,
    errors,
    watchedValues,
    currentStep,
    canProceed: canProceed(),
    isFormReadyForSubmission: isFormReadyForSubmission()
  });

  // Get user location on component mount
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('location.latitude', position.coords.latitude);
          setValue('location.longitude', position.coords.longitude);
        },
        (error) => {
          console.log('Error getting location:', error);
        }
      );
    }
  }, [setValue]);

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
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNextClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    nextStep();
  };

  const handlePrevClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    prevStep();
  };

  const onSubmit = async (data: ReportAnimalForm) => {
    try {
      console.log('Submitting form with data:', data);
      console.log('Images to upload:', images);
      
      // Create FormData for multipart/form-data request
      const formData = new FormData();
      
      // Add animal data as individual form fields
      formData.append('species', data.species);
      formData.append('breed', data.breed);
      formData.append('color', data.breed); // Using breed as color for now
      formData.append('gender', data.gender);
      formData.append('temperament', 'FRIENDLY'); // Default value
      formData.append('healthStatus', data.healthStatus);
      formData.append('latitude', data.location.latitude.toString());
      formData.append('longitude', data.location.longitude.toString());
      formData.append('address', data.location.address);
      formData.append('area', data.location.city); // Using city as area
      formData.append('city', data.location.city);
      
      // Add images if any
      if (images && images.length > 0) {
        images.forEach((image, index) => {
          formData.append('images', image, `image_${index}.${image.name.split('.').pop()}`);
        });
      }

      console.log('FormData created with data:', {
        species: data.species,
        breed: data.breed,
        gender: data.gender,
        healthStatus: data.healthStatus,
        location: data.location
      });
      console.log('FormData contains images:', images.length);
      
      // Debug FormData contents
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
        if (value && typeof value === 'object' && 'type' in value && 'size' in value) {
          console.log(`  - Type: ${(value as any).type}`);
          console.log(`  - Size: ${(value as any).size} bytes`);
        }
      }
      
      // Check if FormData is actually FormData
      console.log('FormData type:', formData.constructor.name);
      console.log('FormData is FormData:', formData && typeof formData === 'object' && 'entries' in formData);

      // Use the reportAnimalMutation with FormData
      await reportAnimalMutation.mutateAsync(formData);
      console.log('Report submitted successfully');
      navigate('/animals');
    } catch (error) {
      console.error('Error reporting animal:', error);
      // You could show a toast notification here
      alert('Failed to submit report. Please try again.');
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
                    Basic Information
                  </h3>
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                    Please provide the essential details about the animal you found. This helps other volunteers identify and care for them.
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
                If you know the animal's medical status, please provide this information to help with their care.
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
                    Location Details
                  </h3>
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                    Provide the exact location where you found the animal. Use the location picker for easy coordinate selection.
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
                    Upload Photos
                  </h3>
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                    Clear photos help other volunteers identify the animal. Upload 1-5 images in JPG, PNG, or GIF format.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Animal Photos {images.length > 0 ? `(${images.length}/5)` : ''}
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Photos are optional but highly recommended for better identification.
              </p>

              {/* Upload Area */}
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

              {/* Image Previews */}
              {imagePreviewUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
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
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Review Your Report
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
                {images.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {images.length} photo(s) uploaded
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {imagePreviewUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No photos uploaded
                  </p>
                )}
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Report a Stray Animal
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Help us track and care for stray animals in your community
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
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
                {index < steps.length - 1 && (
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
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevClick}
              disabled={currentStep === 1}
              className="flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center space-x-4">
              {currentStep < steps.length ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleNextClick}
                  disabled={!canProceed()}
                  className="flex items-center"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <form onSubmit={handleSubmit(onSubmit as any)} className="inline">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!isFormReadyForSubmission() || reportAnimalMutation.isPending}
                    className="flex items-center"
                  >
                    {reportAnimalMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Report
                        <Send className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportAnimalPage; 