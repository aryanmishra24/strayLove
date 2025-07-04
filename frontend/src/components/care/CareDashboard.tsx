import React, { useState, useEffect } from 'react';
import { CareRecordForm } from './CareRecordForm';
import { FeedingLogForm } from './FeedingLogForm';
import { CareRecordList } from './CareRecordList';
import { FeedingLogList } from './FeedingLogList';
import { CareService } from '../../services/careService';
import type { 
  CareRecordRequest, 
  CareRecordResponse, 
  FeedingLogRequest, 
  FeedingLogResponse 
} from '../../types/care';

interface CareDashboardProps {
  animalId: number;
  animalName: string;
}

type TabType = 'care-records' | 'feeding-logs' | 'add-care' | 'add-feeding';

export const CareDashboard: React.FC<CareDashboardProps> = ({
  animalId,
  animalName
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('care-records');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Care Records State
  const [careRecords, setCareRecords] = useState<CareRecordResponse[]>([]);
  const [careRecordsPage, setCareRecordsPage] = useState(0);
  const [careRecordsTotal, setCareRecordsTotal] = useState(0);
  const [careRecordsTotalPages, setCareRecordsTotalPages] = useState(0);

  // Feeding Logs State
  const [feedingLogs, setFeedingLogs] = useState<FeedingLogResponse[]>([]);
  const [feedingLogsPage, setFeedingLogsPage] = useState(0);
  const [feedingLogsTotal, setFeedingLogsTotal] = useState(0);
  const [feedingLogsTotalPages, setFeedingLogsTotalPages] = useState(0);

  // Load care records
  const loadCareRecords = async (page = 0) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await CareService.getCareRecordsByAnimal(animalId, page, 10);
      setCareRecords(response.content || []);
      setCareRecordsTotal(response.totalElements || 0);
      setCareRecordsTotalPages(response.totalPages || 0);
      setCareRecordsPage(response.currentPage || 0);
    } catch (err) {
      console.error('Error loading care records:', err);
      setError('Failed to load care records');
      setCareRecords([]);
      setCareRecordsTotal(0);
      setCareRecordsTotalPages(0);
      setCareRecordsPage(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Load feeding logs
  const loadFeedingLogs = async (page = 0) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await CareService.getFeedingLogsByAnimal(animalId, page, 10);
      setFeedingLogs(response.content || []);
      setFeedingLogsTotal(response.totalElements || 0);
      setFeedingLogsTotalPages(response.totalPages || 0);
      setFeedingLogsPage(response.currentPage || 0);
    } catch (err) {
      console.error('Error loading feeding logs:', err);
      setError('Failed to load feeding logs');
      setFeedingLogs([]);
      setFeedingLogsTotal(0);
      setFeedingLogsTotalPages(0);
      setFeedingLogsPage(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle care record submission
  const handleCareRecordSubmit = async (careRecord: CareRecordRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      await CareService.createCareRecord(animalId, careRecord);
      await loadCareRecords(0); // Reload first page
      setActiveTab('care-records');
    } catch (err) {
      setError('Failed to record care activity');
      console.error('Error creating care record:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle feeding log submission
  const handleFeedingLogSubmit = async (feedingLog: FeedingLogRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      await CareService.createFeedingLog(animalId, feedingLog);
      await loadFeedingLogs(0); // Reload first page
      setActiveTab('feeding-logs');
    } catch (err) {
      setError('Failed to log feeding activity');
      console.error('Error creating feeding log:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when component mounts or animal changes
  useEffect(() => {
    loadCareRecords();
    loadFeedingLogs();
  }, [animalId]);

  const tabs = [
    { id: 'care-records' as TabType, label: 'Care Records', icon: '📋' },
    { id: 'feeding-logs' as TabType, label: 'Feeding Logs', icon: '🍽️' },
    { id: 'add-care' as TabType, label: 'Record Care', icon: '➕' },
    { id: 'add-feeding' as TabType, label: 'Log Feeding', icon: '🥄' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Care Management
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Managing care activities for <span className="font-medium">{animalName}</span>
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'care-records' && (
          <div className="relative">
            <CareRecordList
              careRecords={careRecords}
              totalElements={careRecordsTotal}
              totalPages={careRecordsTotalPages}
              currentPage={careRecordsPage}
              onPageChange={loadCareRecords}
              isLoading={isLoading}
            />
          </div>
        )}

        {activeTab === 'feeding-logs' && (
          <div className="relative">
            <FeedingLogList
              feedingLogs={feedingLogs}
              totalElements={feedingLogsTotal}
              totalPages={feedingLogsTotalPages}
              currentPage={feedingLogsPage}
              onPageChange={loadFeedingLogs}
              isLoading={isLoading}
            />
          </div>
        )}

        {activeTab === 'add-care' && (
          <div className="relative">
            <CareRecordForm
              animalId={animalId}
              animalName={animalName}
              onSubmit={handleCareRecordSubmit}
              onCancel={() => setActiveTab('care-records')}
              isLoading={isLoading}
            />
          </div>
        )}

        {activeTab === 'add-feeding' && (
          <div className="relative">
            <FeedingLogForm
              animalId={animalId}
              animalName={animalName}
              onSubmit={handleFeedingLogSubmit}
              onCancel={() => setActiveTab('feeding-logs')}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
}; 