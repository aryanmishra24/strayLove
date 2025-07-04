import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAnimal } from '../hooks/useAnimals';
import { useAuth } from '../hooks/useAuth';
import { useAnimalCommunityLogs, useAddCommunityLog, useUpvoteCommunityLog } from '../hooks/useCommunityLogs';
import { MapPin, Calendar, User, Heart, Activity, Phone, Mail, Clock, AlertTriangle, CheckCircle, XCircle, HelpCircle, Edit, Trash2, Plus, MessageSquare } from 'lucide-react';
import Button from '../components/common/Button';
import AnimalsMap from '../components/map/AnimalsMap';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { processImageUrls } from '../utils/imageUtils';
import CommunityLogsList from '../components/community/CommunityLogsList';
import AddCommunityLogForm from '../components/community/AddCommunityLogForm';
import { CareDashboard } from '../components/care';
import type { CommunityLogFilters } from '../types/community';

const AnimalDetailPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <AnimalDetailPageContent />
    </ErrorBoundary>
  );
};

const AnimalDetailPageContent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: animal, isLoading, isError } = useAnimal(id || '');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showCareDashboard, setShowCareDashboard] = useState(false);
  const [communityLogFilters, setCommunityLogFilters] = useState<CommunityLogFilters>({
    page: 0,
    size: 10
  });
  const { user } = useAuth();

  // Community logs hooks
  const { 
    data: communityLogsData, 
    isLoading: communityLogsLoading, 
    refetch: refetchCommunityLogs 
  } = useAnimalCommunityLogs(Number(id), communityLogFilters);
  
  const addCommunityLogMutation = useAddCommunityLog();
  const upvoteCommunityLogMutation = useUpvoteCommunityLog();

  const handleAddCommunityLog = (logData: any) => {
    if (id) {
      addCommunityLogMutation.mutate({
        animalId: Number(id),
        logData
      });
    }
  };

  const handleUpvoteLog = (logId: number) => {
    if (id) {
      upvoteCommunityLogMutation.mutate({
        animalId: Number(id),
        logId
      });
    }
  };

  const handleCommunityLogFiltersChange = (filters: CommunityLogFilters) => {
    setCommunityLogFilters(filters);
  };

  const handleCommunityLogPageChange = (page: number) => {
    setCommunityLogFilters(prev => ({ ...prev, page }));
  };

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
          <Link
            to="/animals"
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Animals
          </Link>
        </div>
      </div>
    );
  }

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'INJURED':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'SICK':
        return <XCircle className="w-5 h-5 text-yellow-500" />;
      case 'RECOVERING':
        return <HelpCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <HelpCircle className="w-5 h-5 text-gray-500" />;
    }
  };

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
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
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
  const reportedAt = animal.reportedAt || animal.createdAt || '';
  
  // Handle reportedBy which could be string or object
  const reportedByName = typeof animalReportedBy === 'string' ? animalReportedBy : (animalReportedBy as any)?.name || 'Unknown';
  const reportedByEmail = typeof animalReportedBy === 'string' ? '' : (animalReportedBy as any)?.email || '';
  const reportedById = typeof animalReportedBy === 'string' ? '' : (animalReportedBy as any)?.id || '';
  
  // Check if current user is the reporter
  const isCurrentUserReporter = user && (
    reportedById === user.id || 
    reportedByEmail === user.email || 
    reportedByName === user.name
  );
  
  // Get location from either location object or locations array
  let locationCity = (animalLocation as any)?.city || 'Unknown';
  let locationState = (animalLocation as any)?.state || '';
  let locationAddress = (animalLocation as any)?.address || '';
  let locationLat = (animalLocation as any)?.latitude || 0;
  let locationLng = (animalLocation as any)?.longitude || 0;
  
  if (!(animalLocation as any)?.city && animal.locations && animal.locations.length > 0) {
    const currentLocation = animal.locations.find(loc => loc.isCurrent) || animal.locations[0];
    locationCity = currentLocation.city || 'Unknown';
    locationState = currentLocation.area || '';
    locationAddress = currentLocation.address || '';
    locationLat = currentLocation.latitude || 0;
    locationLng = currentLocation.longitude || 0;
  }
  
  const locationDisplay = locationState ? `${locationCity}, ${locationState}` : locationCity;
  const isNeutered = animal.isNeutered || animal.isSterilized || false;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                to="/animals"
                className="inline-flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary"
              >
                Animals
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {animalName}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
                {animalImages.length > 0 ? (
                  <div className="relative w-full h-96">
                    <img
                      src={animalImages[selectedImageIndex]}
                      alt={animalName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-96 flex items-center justify-center text-6xl">
                    {getSpeciesIcon(animal.species)}
                  </div>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              {animalImages.length > 1 && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-2 overflow-x-auto">
                    {animalImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                          selectedImageIndex === index
                            ? 'border-primary'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${animalName} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Animal Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {animalName}
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    {animalBreed}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {isCurrentUserReporter && (
                    <Button
                      variant="outline"
                      size="sm"
                      as={Link}
                      to={`/edit-animal/${animal.id}`}
                      className="flex items-center"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  {getHealthStatusIcon(animal.healthStatus)}
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getHealthStatusColor(animal.healthStatus)}`}>
                    {animal.healthStatus}
                  </span>
                </div>
              </div>

              {/* Description */}
              {animal.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {animal.description}
                  </p>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Activity className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Age</p>
                      <p className="font-medium text-gray-900 dark:text-white">{getAgeText(animal.age)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Heart className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Gender</p>
                      <p className="font-medium text-gray-900 dark:text-white">{animal.gender}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Last Seen</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatDate(lastSeenAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {locationDisplay}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {locationAddress}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Reported By</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {reportedByName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(reportedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Status */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Medical Status
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    isNeutered 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {isNeutered ? 'Neutered' : 'Not Neutered'}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    animal.isVaccinated 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {animal.isVaccinated ? 'Vaccinated' : 'Not Vaccinated'}
                  </span>
                </div>
              </div>

              {/* Tags */}
              {animalTags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {animalTags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Care Management */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Care Management
                </h3>
                <Button
                  variant="outline"
                  onClick={() => setShowCareDashboard(!showCareDashboard)}
                  className="text-sm"
                >
                  {showCareDashboard ? 'Hide Care Dashboard' : 'Show Care Dashboard'}
                </Button>
              </div>
              
              {showCareDashboard ? (
                <CareDashboard
                  animalId={Number(animal.id)}
                  animalName={animalName}
                />
              ) : (
                <div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Manage care activities, feeding logs, and track care history for {animalName}.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => setShowCareDashboard(true)}
                    className="w-full"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Open Care Dashboard
                  </Button>
                </div>
              )}
            </div>

            {/* Community Logs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Community Updates
                </h3>
                {user && (
                  <AddCommunityLogForm
                    animalId={Number(id)}
                    onSubmit={handleAddCommunityLog}
                    onCancel={() => {}}
                    isSubmitting={addCommunityLogMutation.isPending}
                  />
                )}
              </div>
              
              <CommunityLogsList
                logs={communityLogsData?.data || []}
                isLoading={communityLogsLoading}
                onUpvote={handleUpvoteLog}
                onRefresh={() => refetchCommunityLogs()}
                showAnimalInfo={false}
                filters={communityLogFilters}
                onFiltersChange={handleCommunityLogFiltersChange}
                totalPages={communityLogsData?.total ? Math.ceil(communityLogsData.total / communityLogsData.size) : 1}
                currentPage={communityLogsData?.page || 0}
                onPageChange={handleCommunityLogPageChange}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Reporter */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Contact Reporter
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900 dark:text-white font-medium">
                    {reportedByName}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">
                    {reportedByEmail}
                  </span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Button variant="primary" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  Call (if available)
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button variant="primary" className="w-full">
                  Report Sighting
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowCareDashboard(true)}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Log Care Activity
                </Button>
                <Button variant="outline" className="w-full">
                  Share Location
                </Button>
                <Button variant="outline" className="w-full">
                  Add to Favorites
                </Button>
              </div>
            </div>

            {/* Location Map */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Location
              </h3>
              <div className="h-64 rounded-lg overflow-hidden">
                <ErrorBoundary>
                  <AnimalsMap
                    animals={[animal]}
                    center={{ lat: locationLat, lng: locationLng }}
                    zoom={15}
                    height="100%"
                    showPopups={false}
                  />
                </ErrorBoundary>
              </div>
              <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                <p>{locationAddress}</p>
                <p>{locationDisplay}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalDetailPage;