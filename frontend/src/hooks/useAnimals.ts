import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import animalService from '../services/animalService';
import type { Animal, AnimalFilters, CareLog, CommunityLog } from '../types/animal';
import toast from 'react-hot-toast';

// Query keys
export const animalKeys = {
  all: ['animals'] as const,
  lists: () => [...animalKeys.all, 'list'] as const,
  list: (filters: AnimalFilters, page: number, limit: number) => 
    [...animalKeys.lists(), { filters, page, limit }] as const,
  details: () => [...animalKeys.all, 'detail'] as const,
  detail: (id: string) => [...animalKeys.details(), id] as const,
  stats: () => [...animalKeys.all, 'stats'] as const,
  nearby: (lat: number, lng: number, radius: number) => 
    [...animalKeys.all, 'nearby', { lat, lng, radius }] as const,
  needingCare: () => [...animalKeys.all, 'needing-care'] as const,
  recent: (limit: number) => [...animalKeys.all, 'recent', limit] as const,
  myReports: () => [...animalKeys.all, 'my-reports'] as const,
  myStats: () => [...animalKeys.all, 'my-stats'] as const,
};

// Get animals with filters and pagination
export const useAnimals = (filters: AnimalFilters = {}, page = 1, limit = 12) => {
  return useQuery({
    queryKey: animalKeys.list(filters, page, limit),
    queryFn: () => animalService.getAnimals(filters, page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get a single animal
export const useAnimal = (id: string) => {
  return useQuery({
    queryKey: animalKeys.detail(id),
    queryFn: () => animalService.getAnimal(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get animal statistics
export const useAnimalStats = () => {
  return useQuery({
    queryKey: animalKeys.stats(),
    queryFn: () => animalService.getAnimalStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get nearby animals
export const useNearbyAnimals = (latitude: number, longitude: number, radius: number = 5) => {
  return useQuery({
    queryKey: animalKeys.nearby(latitude, longitude, radius),
    queryFn: () => animalService.searchNearby(latitude, longitude, radius),
    enabled: !!latitude && !!longitude,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get animals needing care
export const useAnimalsNeedingCare = () => {
  return useQuery({
    queryKey: animalKeys.needingCare(),
    queryFn: () => animalService.getAnimalsNeedingCare(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get recently reported animals
export const useRecentlyReported = (limit: number = 10) => {
  return useQuery({
    queryKey: animalKeys.recent(limit),
    queryFn: () => animalService.getRecentlyReported(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mutations
export const useReportAnimal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (formData: FormData) => animalService.reportAnimal(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: animalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: animalKeys.stats() });
      queryClient.invalidateQueries({ queryKey: animalKeys.recent(10) });
      toast.success('Animal reported successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to report animal');
    },
  });
};

export const useUpdateAnimal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Animal> }) => 
      animalService.updateAnimal(id, data),
    onSuccess: (updatedAnimal) => {
      queryClient.invalidateQueries({ queryKey: animalKeys.detail(updatedAnimal.id) });
      queryClient.invalidateQueries({ queryKey: animalKeys.lists() });
      toast.success('Animal updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update animal');
    },
  });
};

export const useDeleteAnimal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => animalService.deleteAnimal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: animalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: animalKeys.stats() });
      toast.success('Animal deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete animal');
    },
  });
};

export const useAddCareLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ animalId, careLog }: { animalId: string; careLog: Omit<CareLog, 'id' | 'performedBy' | 'performedAt'> }) => 
      animalService.addCareLog(animalId, careLog),
    onSuccess: (_, { animalId }) => {
      queryClient.invalidateQueries({ queryKey: animalKeys.detail(animalId) });
      toast.success('Care log added successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add care log');
    },
  });
};

export const useAddCommunityLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ animalId, communityLog }: { animalId: string; communityLog: Omit<CommunityLog, 'id' | 'createdBy' | 'createdAt' | 'upvotes' | 'isUpvoted'> }) => 
      animalService.addCommunityLog(animalId, communityLog),
    onSuccess: (_, { animalId }) => {
      queryClient.invalidateQueries({ queryKey: animalKeys.detail(animalId) });
      toast.success('Community log added successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add community log');
    },
  });
};

export const useUpvoteCommunityLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ animalId, logId }: { animalId: string; logId: string }) => 
      animalService.upvoteCommunityLog(animalId, logId),
    onSuccess: (_, { animalId }) => {
      queryClient.invalidateQueries({ queryKey: animalKeys.detail(animalId) });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upvote');
    },
  });
};

export const useRemoveUpvote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ animalId, logId }: { animalId: string; logId: string }) => 
      animalService.removeUpvote(animalId, logId),
    onSuccess: (_, { animalId }) => {
      queryClient.invalidateQueries({ queryKey: animalKeys.detail(animalId) });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove upvote');
    },
  });
};

// Get user's animal reports
export const useMyReports = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: [...animalKeys.myReports(), { page, limit }],
    queryFn: () => animalService.getMyReports(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get user statistics
export const useMyStats = () => {
  return useQuery({
    queryKey: animalKeys.myStats(),
    queryFn: () => animalService.getMyStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Admin: Get animals pending approval
export const usePendingAnimals = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['pending-animals', page, limit],
    queryFn: () => animalService.getPendingAnimals(page, limit),
    staleTime: 2 * 60 * 1000,
  });
};

// Admin: Approve animal
export const useApproveAnimal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => animalService.approveAnimal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-animals'] });
      queryClient.invalidateQueries({ queryKey: animalKeys.lists() });
    },
  });
};

// Admin: Reject animal
export const useRejectAnimal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => animalService.rejectAnimal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-animals'] });
      queryClient.invalidateQueries({ queryKey: animalKeys.lists() });
    },
  });
}; 