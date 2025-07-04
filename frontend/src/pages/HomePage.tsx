import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, Users, Activity, ArrowRight } from 'lucide-react';
import Button from '../components/common/Button';
import AnimalsMap from '../components/map/AnimalsMap';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { useNearbyAnimals } from '../hooks/useAnimals';
import { useAuth } from '../hooks/useAuth';
import type { Animal } from '../types/animal';

const HomePage: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { data: nearbyAnimals, isError: animalsError, isLoading: animalsLoading } = useNearbyAnimals(
    userLocation?.lat || 0,
    userLocation?.lng || 0,
    5 // 5km radius
  );
  const { user } = useAuth();

  // Get user location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Error getting location:', error);
        }
      );
    }
  }, []);

  const stats = [
    { label: 'Animals Tracked', value: '1,234', icon: Heart },
    { label: 'Active Volunteers', value: '567', icon: Users },
    { label: 'Care Activities', value: '2,890', icon: Activity },
    { label: 'Cities Covered', value: '45', icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
              Straylove
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold text-blue-100 mb-4">
              Community Stray Animal Tracker
            </h2>
            <p className="text-xl text-blue-200 mb-8 max-w-3xl mx-auto">
              Help track and care for stray animals in your community. Join thousands of volunteers making a difference.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                className="text-lg py-3 px-8"
                as={Link}
                to="/animals"
              >
                Browse Animals
              </Button>
              {user ? (
                <Button
                  variant="primary"
                  className="text-lg py-3 px-8"
                  as={Link}
                  to="/report"
                >
                  Report Animal
                </Button>
              ) : (
                <Button
                  variant="primary"
                  className="text-lg py-3 px-8"
                  as={Link}
                  to="/register"
                >
                  Join Community
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-3">
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Animals Near You
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Explore the interactive map to see animals that need help in your area. 
              Click on markers to learn more about each animal.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="h-96">
              <ErrorBoundary>
                {animalsError ? (
                  <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
                    <div className="text-center p-8">
                      <div className="text-6xl mb-4">🐾</div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Welcome to StrayLove
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Join our community to start tracking and helping stray animals in your area.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <Button
                          variant="primary"
                          as={Link}
                          to="/register"
                          className="text-sm"
                        >
                          Join Community
                        </Button>
                        <Button
                          variant="primary"
                          as={Link}
                          to="/login"
                          className="text-sm"
                        >
                          Sign In
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : animalsLoading ? (
                  <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
                    <div className="text-center p-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-gray-600 dark:text-gray-300">Loading animals near you...</p>
                    </div>
                  </div>
                ) : (
                <AnimalsMap
                  animals={nearbyAnimals || []}
                  center={userLocation || { lat: 20.5937, lng: 78.9629 }}
                  zoom={userLocation ? 12 : 10}
                  height="100%"
                  showPopups={true}
                />
                )}
              </ErrorBoundary>
            </div>
          </div>

          <div className="text-center mt-6">
            <Button
              variant="primary"
              as={Link}
              to="/map"
              className="inline-flex items-center space-x-2"
            >
              <span>View Full Map</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Simple steps to help animals in your community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Report Animals
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Spot a stray animal? Report it with location and details to help track their care.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Provide Care
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Log feeding, medical care, and other activities to help animals in need.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Connect Community
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Coordinate with other volunteers and share updates about animal welfare.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-primary to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join our community of volunteers and start helping animals in your area today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              className="text-lg py-3 px-8"
              as={Link}
              to="/register"
            >
              Get Started
            </Button>
            <Button
              variant="primary"
              className="text-lg py-3 px-8"
              as={Link}
              to="/animals"
            >
              Browse Animals
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 