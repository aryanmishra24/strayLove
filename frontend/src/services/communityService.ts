import apiService from './api';
import type { CommunityLog, CreateCommunityLogRequest, CommunityLogFilters, LogType } from '../types/community';

class CommunityService {
  // Get all community logs with optional filtering
  async getAllCommunityLogs(filters: CommunityLogFilters = {}): Promise<{ data: CommunityLog[]; total: number; page: number; size: number }> {
    const params = new URLSearchParams();
    
    if (filters.logType) params.append('type', filters.logType);
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.size !== undefined) params.append('size', filters.size.toString());

    const response = await apiService.get<{ data: { content: CommunityLog[]; totalElements: number; number: number; size: number } }>(
      `/community/logs?${params.toString()}`
    );
    
    return {
      data: response.data.content,
      total: response.data.totalElements,
      page: response.data.number,
      size: response.data.size
    };
  }

  // Get community logs for a specific animal
  async getCommunityLogsForAnimal(
    animalId: number, 
    filters: CommunityLogFilters = {}
  ): Promise<{ data: CommunityLog[]; total: number; page: number; size: number }> {
    const params = new URLSearchParams();
    
    if (filters.logType) params.append('type', filters.logType);
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.size !== undefined) params.append('size', filters.size.toString());

    const response = await apiService.get<{ data: { content: CommunityLog[]; totalElements: number; number: number; size: number } }>(
      `/animals/${animalId}/community/logs?${params.toString()}`
    );
    
    return {
      data: response.data.content,
      total: response.data.totalElements,
      page: response.data.number,
      size: response.data.size
    };
  }

  // Add a new community log
  async addCommunityLog(animalId: number, logData: CreateCommunityLogRequest): Promise<CommunityLog> {
    const response = await apiService.post<{ data: CommunityLog }>(
      `/animals/${animalId}/community/logs`,
      logData
    );
    return response.data;
  }

  // Upvote a community log
  async upvoteLog(animalId: number, logId: number): Promise<CommunityLog> {
    const response = await apiService.post<{ data: CommunityLog }>(
      `/animals/${animalId}/community/logs/${logId}/upvote`
    );
    return response.data;
  }

  // Get recent community logs for dashboard
  async getRecentLogs(limit: number = 5): Promise<CommunityLog[]> {
    const response = await apiService.get<{ data: CommunityLog[] }>(
      `/community/logs/recent?limit=${limit}`
    );
    return response.data;
  }
}

export default new CommunityService(); 