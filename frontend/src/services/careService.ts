import apiClient from './apiClient';
import { CareType } from '../types/care';
import type {
  CareRecordRequest,
  CareRecordResponse,
  FeedingLogRequest,
  FeedingLogResponse
} from '../types/care';

export class CareService {
  // Care Records
  static async getAllCareRecords(page = 0, size = 10): Promise<{
    content: CareRecordResponse[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
  }> {
    const response = await apiClient.get(`/care/records?page=${page}&size=${size}`);
    return response.data.data;
  }

  static async getCareRecordsByAnimal(
    animalId: number,
    page = 0,
    size = 10
  ): Promise<{
    content: CareRecordResponse[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
  }> {
    const response = await apiClient.get(`/animals/${animalId}/care/history?page=${page}&size=${size}`);
    return response.data.data;
  }

  static async getCareRecordsByVolunteer(
    volunteerId: number,
    page = 0,
    size = 10
  ): Promise<{
    content: CareRecordResponse[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
  }> {
    const response = await apiClient.get(`/volunteers/${volunteerId}/care/records?page=${page}&size=${size}`);
    return response.data.data;
  }

  static async createCareRecord(
    animalId: number,
    careRecord: CareRecordRequest
  ): Promise<CareRecordResponse> {
    const response = await apiClient.post(`/animals/${animalId}/care/records`, careRecord);
    return response.data.data;
  }

  static async getRecentCareRecords(limit = 5): Promise<CareRecordResponse[]> {
    const response = await apiClient.get(`/care/records/recent?limit=${limit}`);
    return response.data.data;
  }

  // Feeding Logs
  static async getFeedingLogsByAnimal(
    animalId: number,
    page = 0,
    size = 10
  ): Promise<{
    content: FeedingLogResponse[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
  }> {
    const response = await apiClient.get(`/animals/${animalId}/care/feeding?page=${page}&size=${size}`);
    return response.data.data;
  }

  static async getFeedingSchedule(animalId: number): Promise<FeedingLogResponse[]> {
    const response = await apiClient.get(`/animals/${animalId}/care/feeding/schedule`);
    return response.data.data;
  }

  static async createFeedingLog(
    animalId: number,
    feedingLog: FeedingLogRequest
  ): Promise<FeedingLogResponse> {
    const response = await apiClient.post(`/animals/${animalId}/care/feeding`, feedingLog);
    return response.data.data;
  }

  // Statistics
  static async getCareStatistics(): Promise<{
    totalCareRecords: number;
    totalFeedingLogs: number;
    careRecordsThisMonth: number;
    feedingLogsThisMonth: number;
  }> {
    // This would need to be implemented in the backend
    // For now, we'll return mock data
    return {
      totalCareRecords: 0,
      totalFeedingLogs: 0,
      careRecordsThisMonth: 0,
      feedingLogsThisMonth: 0
    };
  }

  // Utility methods
  static getCareTypeLabel(careType: CareType): string {
    const labels: Record<CareType, string> = {
      [CareType.VACCINATION]: 'Vaccination',
      [CareType.STERILIZATION]: 'Sterilization',
      [CareType.FEEDING]: 'Feeding',
      [CareType.MEDICAL_TREATMENT]: 'Medical Treatment',
      [CareType.GROOMING]: 'Grooming',
      [CareType.CHECKUP]: 'Checkup'
    };
    return labels[careType];
  }

  static getCareTypeColor(careType: CareType): string {
    const colors: Record<CareType, string> = {
      [CareType.VACCINATION]: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      [CareType.STERILIZATION]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      [CareType.FEEDING]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      [CareType.MEDICAL_TREATMENT]: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      [CareType.GROOMING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      [CareType.CHECKUP]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400'
    };
    return colors[careType];
  }

  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  static formatDateTime(dateTimeString: string): string {
    return new Date(dateTimeString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
} 