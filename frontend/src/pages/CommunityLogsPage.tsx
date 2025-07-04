import React, { useState } from 'react';
import { useCommunityLogs, useUpvoteCommunityLog } from '../hooks/useCommunityLogs';
import { useAuth } from '../hooks/useAuth';
import CommunityLogsList from '../components/community/CommunityLogsList';
import type { CommunityLogFilters } from '../types/community';
import { Users, MessageSquare, TrendingUp } from 'lucide-react';

const CommunityLogsPage: React.FC = () => {
  const [filters, setFilters] = useState<CommunityLogFilters>({
    page: 0,
    size: 20
  });
  const { user } = useAuth();

  const { 
    data: communityLogsData, 
    isLoading, 
    refetch 
  } = useCommunityLogs(filters);
  
  const upvoteCommunityLogMutation = useUpvoteCommunityLog();

  const handleUpvoteLog = (logId: number) => {
    // For the global community logs page, we need to get the animal ID from the log
    // This is a simplified version - in a real app you'd need to handle this differently
    const log = communityLogsData?.data.find(l => l.id === logId);
    if (log) {
      upvoteCommunityLogMutation.mutate({
        animalId: log.animalId,
        logId
      });
    }
  };

  const handleFiltersChange = (newFilters: CommunityLogFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Community Updates
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Stay updated with the latest community activities and animal sightings
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Users className="w-5 h-5" />
                <span className="text-sm">Community</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <MessageSquare className="w-5 h-5" />
                <span className="text-sm">Updates</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm">Real-time</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Updates
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {communityLogsData?.total || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="w-8 h-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Active Community
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  Growing
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Recent Activity
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {communityLogsData?.data?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Community Logs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <CommunityLogsList
            logs={communityLogsData?.data || []}
            isLoading={isLoading}
            onUpvote={handleUpvoteLog}
            onRefresh={() => refetch()}
            showAnimalInfo={true}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            totalPages={communityLogsData?.total ? Math.ceil(communityLogsData.total / communityLogsData.size) : 1}
            currentPage={communityLogsData?.page || 0}
            onPageChange={handlePageChange}
          />
        </div>

        {/* Community Guidelines */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Community Guidelines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
            <div>
              <h4 className="font-medium mb-2">✅ What to share:</h4>
              <ul className="space-y-1">
                <li>• Animal sightings and updates</li>
                <li>• Health concerns and observations</li>
                <li>• Care activities and feeding</li>
                <li>• Adoption progress and success stories</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">❌ What to avoid:</h4>
              <ul className="space-y-1">
                <li>• Personal information or contact details</li>
                <li>• Offensive or inappropriate content</li>
                <li>• Spam or promotional content</li>
                <li>• False or misleading information</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityLogsPage; 