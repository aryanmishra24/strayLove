import React from 'react';
import type { FeedingLogResponse } from '../../types/care';
import { CareService } from '../../services/careService';

interface FeedingLogListProps {
  feedingLogs: FeedingLogResponse[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export const FeedingLogList: React.FC<FeedingLogListProps> = ({
  feedingLogs,
  totalElements,
  totalPages,
  currentPage,
  onPageChange,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (feedingLogs.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No feeding logs found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by logging the first feeding activity.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Feeding Logs ({totalElements})
        </h3>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {feedingLogs.map((log) => (
          <div key={log.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200">
                    Feeding
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {CareService.formatDateTime(log.feedingTime)}
                  </span>
                </div>
                
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  {log.animalName} ({log.animalSpecies})
                </h4>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <span>
                    <span className="font-medium">Food:</span> {log.foodType}
                  </span>
                  <span>
                    <span className="font-medium">Quantity:</span> {log.quantity}
                  </span>
                </div>
                
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <span>By {log.fedByName}</span>
                  <span className="mx-2">•</span>
                  <span>{CareService.formatDateTime(log.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing page {currentPage + 1} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-3 py-1 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className="px-3 py-1 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 