import React from 'react';
import { Link } from 'react-router-dom';
import { useRecentCommunityLogs } from '../hooks/useCommunityLogs';
import { useMyStats, useMyReports } from '../hooks/useAnimals';
import { useAuth } from '../hooks/useAuth';
import CommunityLogCard from '../components/community/CommunityLogCard';
import { MessageSquare, Users, Activity, TrendingUp, Heart, Award, Calendar } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data: recentLogs, isLoading: logsLoading } = useRecentCommunityLogs(5);
  const { data: myStats, isLoading: statsLoading } = useMyStats();
  const { data: myReports, isLoading: reportsLoading } = useMyReports(1, 5);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Welcome back, {user?.name || 'User'}! Here's your impact on the community.
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="w-8 h-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Your Reports
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statsLoading ? '...' : (myStats?.totalReports || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Community Logs
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statsLoading ? '...' : (myStats?.totalCommunityLogs || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Heart className="w-8 h-8 text-red-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Upvotes
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statsLoading ? '...' : (myStats?.totalUpvotes || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Award className="w-8 h-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Animals Helped
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statsLoading ? '...' : (myStats?.animalsHelped || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4">
          {/* Recent Community Updates */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Community Updates
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Latest activities from the community
              </p>
            </div>
            <div className="p-6">
              {logsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : recentLogs && recentLogs.length > 0 ? (
                <div className="space-y-4">
                  {recentLogs.map((log) => (
                    <CommunityLogCard
                      key={log.id}
                      log={log}
                      onUpvote={() => {}} // Simplified for dashboard
                      showAnimalInfo={true}
                    />
                  ))}
                  <div className="text-center pt-4">
                    <Link
                      to="/community"
                      className="text-primary hover:text-primary/80 font-medium"
                    >
                      View all community updates →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No community updates yet
                  </p>
                  <Link
                    to="/community"
                    className="text-primary hover:text-primary/80 font-medium mt-2 inline-block"
                  >
                    Join the community →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Your Recent Reports */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Your Recent Reports
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Animals you've reported recently
              </p>
            </div>
            <div className="p-6">
              {reportsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : myReports && Array.isArray(myReports.content) && myReports.content.length > 0 ? (
                <div className="space-y-3">
                  {myReports.content.map((animal) => (
                    <Link
                      key={animal.id}
                      to={`/animal/${animal.id}`}
                      className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {animal.name || `${animal.species} ${animal.breed || ''}`}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {animal.location?.city || 'Unknown location'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            animal.healthStatus === 'HEALTHY' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            animal.healthStatus === 'INJURED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            animal.healthStatus === 'SICK' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                            {animal.healthStatus}
                          </span>
                          <Calendar className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </Link>
                  ))}
                  <div className="text-center pt-4">
                    <Link
                      to="/animals"
                      className="text-primary hover:text-primary/80 font-medium"
                    >
                      View all your reports →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    You haven't reported any animals yet
                  </p>
                  <Link
                    to="/report"
                    className="text-primary hover:text-primary/80 font-medium mt-2 inline-block"
                  >
                    Report your first animal →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 px-4">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quick Actions
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Common tasks and shortcuts
              </p>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to="/report"
                className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
              >
                <Activity className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Report Animal
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Found a stray animal?
                </p>
              </Link>
              
              <Link
                to="/animals"
                className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
              >
                <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Browse Animals
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  View all reported animals
                </p>
              </Link>
              
              <Link
                to="/map"
                className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
              >
                <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900 dark:text-white">
                  View Map
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  See animals on map
                </p>
              </Link>
              
              <Link
                to="/community"
                className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
              >
                <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Community
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Join the community
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 