import React from 'react';
import type { CareRecordResponse } from '../../types/care';
import { CareService } from '../../services/careService';

interface CareRecordListProps {
  careRecords: CareRecordResponse[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export const CareRecordList: React.FC<CareRecordListProps> = ({
  careRecords = [],
  totalElements = 0,
  totalPages = 0,
  currentPage = 0,
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

  if (!careRecords || careRecords.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No care records found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by recording the first care activity.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Care Records ({totalElements})
        </h3>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {careRecords.map((record) => {
          try {
            return (
              <div key={record.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CareService.getCareTypeColor(record.careType)}`}>
                        {CareService.getCareTypeLabel(record.careType)}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {CareService.formatDate(record.careDate)}
                      </span>
                    </div>
                    
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {record.animalName || 'Unknown Animal'} ({record.animalSpecies || 'Unknown Species'})
                    </h4>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {record.description || 'No description provided'}
                    </p>
                    
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <span>By {record.performedByName || 'Unknown'}</span>
                      <span className="mx-2">•</span>
                      <span>{CareService.formatDateTime(record.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          } catch (error) {
            console.error('Error rendering care record:', error, record);
            return (
              <div key={record.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="text-sm text-red-600 dark:text-red-400">
                  Error displaying care record
                </div>
              </div>
            );
          }
        })}
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