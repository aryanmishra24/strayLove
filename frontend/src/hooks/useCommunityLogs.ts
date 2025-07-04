import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import communityService from '../services/communityService';
import type { CreateCommunityLogRequest, CommunityLogFilters } from '../types/community';
import toast from 'react-hot-toast';

// Query keys
export const communityLogKeys = {
  all: ['communityLogs'] as const,
  lists: () => [...communityLogKeys.all, 'list'] as const,
  list: (filters: CommunityLogFilters) => [...communityLogKeys.lists(), filters] as const,
  animal: (animalId: number) => [...communityLogKeys.all, 'animal', animalId] as const,
  animalList: (animalId: number, filters: CommunityLogFilters) => 
    [...communityLogKeys.animal(animalId), 'list', filters] as const,
  recent: () => [...communityLogKeys.all, 'recent'] as const,
};

// Hook to get all community logs
export const useCommunityLogs = (filters: CommunityLogFilters = {}) => {
  return useQuery({
    queryKey: communityLogKeys.list(filters),
    queryFn: () => communityService.getAllCommunityLogs(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get community logs for a specific animal
export const useAnimalCommunityLogs = (animalId: number, filters: CommunityLogFilters = {}) => {
  return useQuery({
    queryKey: communityLogKeys.animalList(animalId, filters),
    queryFn: () => communityService.getCommunityLogsForAnimal(animalId, filters),
    enabled: !!animalId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get recent community logs
export const useRecentCommunityLogs = (limit: number = 5) => {
  return useQuery({
    queryKey: communityLogKeys.recent(),
    queryFn: () => communityService.getRecentLogs(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to add a community log
export const useAddCommunityLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ animalId, logData }: { animalId: number; logData: CreateCommunityLogRequest }) =>
      communityService.addCommunityLog(animalId, logData),
    onSuccess: (data, { animalId }) => {
      // Invalidate and refetch community logs for this animal
      queryClient.invalidateQueries({ queryKey: communityLogKeys.animal(animalId) });
      // Invalidate recent logs
      queryClient.invalidateQueries({ queryKey: communityLogKeys.recent() });
      // Invalidate all community logs
      queryClient.invalidateQueries({ queryKey: communityLogKeys.lists() });
      
      toast.success('Community log added successfully!');
    },
    onError: (error: any) => {
      console.error('Error adding community log:', error);
      toast.error(error.response?.data?.message || 'Failed to add community log');
    },
  });
};

// Hook to upvote a community log
export const useUpvoteCommunityLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ animalId, logId }: { animalId: number; logId: number }) =>
      communityService.upvoteLog(animalId, logId),
    onSuccess: (data, { animalId }) => {
      // Invalidate and refetch community logs for this animal
      queryClient.invalidateQueries({ queryKey: communityLogKeys.animal(animalId) });
      // Invalidate recent logs
      queryClient.invalidateQueries({ queryKey: communityLogKeys.recent() });
      // Invalidate all community logs
      queryClient.invalidateQueries({ queryKey: communityLogKeys.lists() });
      
      toast.success('Log upvoted successfully!');
    },
    onError: (error: any) => {
      console.error('Error upvoting community log:', error);
      toast.error(error.response?.data?.message || 'Failed to upvote log');
    },
  });
}; 