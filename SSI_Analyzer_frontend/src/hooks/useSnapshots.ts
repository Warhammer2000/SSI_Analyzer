import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { SsiSnapshot, CreateSnapshotRequest, TrendDataPoint } from '../types';

export const snapshotKeys = {
  all: ['snapshots'] as const,
  latest: ['snapshots', 'latest'] as const,
  trends: ['snapshots', 'trends'] as const,
};

export function useSnapshots() {
  return useQuery<SsiSnapshot[]>({
    queryKey: snapshotKeys.all,
    queryFn: async () => {
      const { data } = await api.get<SsiSnapshot[]>('/ssi/snapshots');
      return data;
    },
  });
}

export function useLatestSnapshot() {
  return useQuery<SsiSnapshot>({
    queryKey: snapshotKeys.latest,
    queryFn: async () => {
      const { data } = await api.get<SsiSnapshot>('/ssi/latest');
      return data;
    },
  });
}

export function useTrends() {
  return useQuery<TrendDataPoint[]>({
    queryKey: snapshotKeys.trends,
    queryFn: async () => {
      const { data } = await api.get<TrendDataPoint[]>('/ssi/trends');
      return data;
    },
  });
}

export function useCreateSnapshot() {
  const queryClient = useQueryClient();

  return useMutation<{ id: string }, Error, CreateSnapshotRequest>({
    mutationFn: async (payload) => {
      const { data } = await api.post<{ id: string }>('/ssi/snapshot', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: snapshotKeys.all });
      queryClient.invalidateQueries({ queryKey: snapshotKeys.latest });
      queryClient.invalidateQueries({ queryKey: snapshotKeys.trends });
    },
  });
}

export function useDeleteSnapshot() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/ssi/snapshot/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: snapshotKeys.all });
      queryClient.invalidateQueries({ queryKey: snapshotKeys.latest });
      queryClient.invalidateQueries({ queryKey: snapshotKeys.trends });
    },
  });
}
