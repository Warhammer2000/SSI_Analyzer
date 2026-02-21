import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Recommendation } from '../types';
import { snapshotKeys } from './useSnapshots';

export const analysisKeys = {
  bySnapshot: (snapshotId: string) => ['analysis', snapshotId] as const,
};

export function useAnalysis(snapshotId: string | undefined) {
  return useQuery<Recommendation[]>({
    queryKey: analysisKeys.bySnapshot(snapshotId ?? ''),
    queryFn: async () => {
      const { data } = await api.get<Recommendation[]>(`/analysis/${snapshotId}`);
      return data;
    },
    enabled: !!snapshotId,
  });
}

export function useGenerateAnalysis() {
  const queryClient = useQueryClient();

  return useMutation<Recommendation[], Error, string>({
    mutationFn: async (snapshotId) => {
      const { data } = await api.post<Recommendation[]>('/analysis/generate', { snapshotId });
      return data;
    },
    onSuccess: (_data, snapshotId) => {
      queryClient.invalidateQueries({ queryKey: analysisKeys.bySnapshot(snapshotId) });
      queryClient.invalidateQueries({ queryKey: snapshotKeys.latest });
    },
  });
}
