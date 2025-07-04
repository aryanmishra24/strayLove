import React, { useState } from 'react';
import { Filter, RefreshCw } from 'lucide-react';
import type { CommunityLog, CommunityLogFilters } from '../../types/community';
import { LogType, LOG_TYPE_LABELS, URGENCY_LEVEL_LABELS } from '../../types/community';
import CommunityLogCard from './CommunityLogCard';
import Button from '../common/Button';

interface CommunityLogsListProps {
  logs: CommunityLog[];
  isLoading: boolean;
  onUpvote: (logId: number) => void;
  onRefresh: () => void;
  showAnimalInfo?: boolean;
  filters?: CommunityLogFilters;
  onFiltersChange?: (filters: CommunityLogFilters) => void;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

const CommunityLogsList: React.FC<CommunityLogsListProps> = ({
  logs,
  isLoading,
  onUpvote,
  onRefresh,
  showAnimalInfo = false,
  filters = {},
  onFiltersChange,
  totalPages = 1,
  currentPage = 0,
  onPageChange,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: keyof CommunityLogFilters, value: any) => {
    if (onFiltersChange) {
      onFiltersChange({
        ...filters,
        [key]: value,
        page: 0, // Reset to first page when filters change
      });
    }
  };

  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
                </div>
              </div>
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filters and refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Community Logs ({logs.length})
          </h3>
          {onFiltersChange && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </Button>
          )}
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center space-x-1"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Filters */}
      {showFilters && onFiltersChange && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-white">Filter Logs</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Log Type
              </label>
              <select
                value={filters.logType || ''}
                onChange={(e) => handleFilterChange('logType', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white text-sm"
              >
                <option value="">All types</option>
                {Object.entries(LOG_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Urgency Level
              </label>
              <select
                value={filters.urgencyLevel || ''}
                onChange={(e) => handleFilterChange('urgencyLevel', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white text-sm"
              >
                <option value="">All levels</option>
                {Object.entries(URGENCY_LEVEL_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Logs List */}
      {logs.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 dark:text-gray-500 mb-2">
            <Filter className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            No community logs found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {filters.logType || filters.urgencyLevel 
              ? 'Try adjusting your filters or be the first to add a log!'
              : 'Be the first to add a community log!'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <CommunityLogCard
              key={log.id}
              log={log}
              onUpvote={onUpvote}
              showAnimalInfo={showAnimalInfo}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-center space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage + 1} of {totalPages}
          </span>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default CommunityLogsList; 