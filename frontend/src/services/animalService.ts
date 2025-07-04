import apiClient from './apiClient';
import type { 
  Animal, 
  AnimalFilters, 
  AnimalListResponse, 
  AnimalStats,
  CareLog,
  CommunityLog 
} from '../types/animal';

class AnimalService {
  // Get animals with filters and pagination
  async getAnimals(filters: AnimalFilters = {}, page = 1, limit = 12): Promise<AnimalListResponse> {
    const params = new URLSearchParams({
      page: (page - 1).toString(), // Backend uses 0-based pagination
      size: limit.toString(),
    });

    // Add filters if provided
    if (filters.species && filters.species.length > 0) {
      params.append('species', filters.species[0]); // Backend supports single species for now
    }
    
    if (filters.search) {
      params.append('area', filters.search); // Use search term as area filter
    }

    // Add location filter if present
    if (filters.location) {
      if (filters.location.latitude) params.append('latitude', filters.location.latitude.toString());
      if (filters.location.longitude) params.append('longitude', filters.location.longitude.toString());
      if (filters.location.radius) params.append('radius', filters.location.radius.toString());
    }

    const response = await apiClient.get(`/animals?${params}`);
    const data = response.data.data; // Extract data from ApiResponse wrapper

    return {
      content: data.content || [],
      totalElements: data.totalElements || 0,
      page: data.number + 1, // Convert 0-based to 1-based
      totalPages: data.totalPages || 1,
      size: data.size || limit,
      number: data.number || 0,
    };
  }

  // Get a single animal by ID
  async getAnimal(id: string): Promise<Animal> {
    const response = await apiClient.get(`/animals/${id}`);
    return response.data.data; // Extract data from ApiResponse wrapper
  }

  // Get animal statistics
  async getAnimalStats(): Promise<AnimalStats> {
    const response = await apiClient.get('/animals/stats');
    return response.data.data;
  }

  // Report a new animal
  async reportAnimal(formData: FormData): Promise<Animal> {
    const response = await apiClient.post('/animals', formData);
    return response.data.data; // Extract data from ApiResponse wrapper
  }

  // Update animal information
  async updateAnimal(id: string, animalData: Partial<Animal>): Promise<Animal> {
    const response = await apiClient.put(`/animals/${id}`, animalData);
    return response.data.data; // Extract data from ApiResponse wrapper
  }

  // Delete animal (admin only)
  async deleteAnimal(id: string): Promise<void> {
    await apiClient.delete(`/animals/${id}`);
  }

  // Add care log to animal
  async addCareLog(animalId: string, careLog: Omit<CareLog, 'id' | 'performedBy' | 'performedAt'>): Promise<CareLog> {
    const response = await apiClient.post(`/animals/${animalId}/care-logs`, careLog);
    return response.data;
  }

  // Add community log to animal
  async addCommunityLog(animalId: string, communityLog: Omit<CommunityLog, 'id' | 'createdBy' | 'createdAt' | 'upvotes' | 'isUpvoted'>): Promise<CommunityLog> {
    const response = await apiClient.post(`/animals/${animalId}/community-logs`, communityLog);
    return response.data;
  }

  // Upvote a community log
  async upvoteCommunityLog(animalId: string, logId: string): Promise<void> {
    await apiClient.post(`/animals/${animalId}/community-logs/${logId}/upvote`);
  }

  // Remove upvote from a community log
  async removeUpvote(animalId: string, logId: string): Promise<void> {
    await apiClient.delete(`/animals/${animalId}/community-logs/${logId}/upvote`);
  }

  // Search animals by location
  async searchNearby(latitude: number, longitude: number, radius: number = 5): Promise<Animal[]> {
    try {
      const response = await apiClient.get('/animals/nearby', {
        params: { lat: latitude, lon: longitude, radius },
      });
      
      // Handle the ApiResponse wrapper structure
      const data = response.data?.data;
      
      // Ensure we always return an array
      if (Array.isArray(data)) {
        return data;
      } else if (data && typeof data === 'object') {
        // If data is an object but not an array, return empty array
        console.warn('Expected array from nearby search, got:', typeof data, data);
        return [];
      } else {
        // If data is null/undefined, return empty array
        return [];
      }
    } catch (error) {
      console.error('Error searching nearby animals:', error);
      throw error;
    }
  }

  // Get animals needing care
  async getAnimalsNeedingCare(): Promise<Animal[]> {
    const response = await apiClient.get('/animals/needing-care');
    return response.data;
  }

  // Get recently reported animals
  async getRecentlyReported(limit: number = 10): Promise<Animal[]> {
    const response = await apiClient.get('/animals/recent', {
      params: { limit },
    });
    return response.data;
  }

  // Get user's animal reports
  async getMyReports(page: number = 1, limit: number = 10): Promise<AnimalListResponse> {
    const response = await apiClient.get('/animals/my-reports', {
      params: { page: page - 1, size: limit }, // Backend uses 0-based pagination
    });
    const data = response.data.data;
    
    return {
      content: data.content || [],
      totalElements: data.totalElements || 0,
      page: data.number + 1, // Convert 0-based to 1-based
      totalPages: data.totalPages || 1,
      size: data.size || limit,
      number: data.number || 0,
    };
  }

  // Get user statistics
  async getMyStats(): Promise<{ totalReports: number; totalCommunityLogs: number; totalUpvotes: number; animalsHelped: number; recentActivity: number }> {
    const response = await apiClient.get('/animals/my-stats');
    return response.data.data;
  }

  // Get animals pending approval (admin only)
  async getPendingAnimals(page = 1, limit = 10): Promise<AnimalListResponse> {
    const params = new URLSearchParams({
      page: (page - 1).toString(),
      size: limit.toString(),
      approvalStatus: 'PENDING',
    });
    const response = await apiClient.get(`/animals?${params}`);
    const data = response.data.data;
    return {
      content: data.content || [],
      totalElements: data.totalElements || 0,
      page: data.number + 1,
      totalPages: data.totalPages || 1,
      size: data.size || limit,
      number: data.number || 0,
    };
  }

  // Approve an animal (admin only)
  async approveAnimal(id: string | number): Promise<Animal> {
    const response = await apiClient.put(`/animals/${id}/approve`);
    return response.data.data;
  }

  // Reject an animal (admin only)
  async rejectAnimal(id: string | number): Promise<Animal> {
    const response = await apiClient.put(`/animals/${id}/reject`);
    return response.data.data;
  }
}

export default new AnimalService(); 