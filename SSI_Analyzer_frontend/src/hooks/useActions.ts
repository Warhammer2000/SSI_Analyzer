import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { ActionItem, StreakInfo } from '../types';

export const actionKeys = {
  all: ['actions'] as const,
  streak: ['actions', 'streak'] as const,
};

export function useActions() {
  return useQuery<ActionItem[]>({
    queryKey: actionKeys.all,
    queryFn: async () => {
      const { data } = await api.get<ActionItem[]>('/actions');
      return data;
    },
  });
}

export function useStreak() {
  return useQuery<StreakInfo>({
    queryKey: actionKeys.streak,
    queryFn: async () => {
      const { data } = await api.get<StreakInfo>('/actions/streak');
      return data;
    },
  });
}

export function useCompleteAction() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.patch(`/actions/${id}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: actionKeys.all });
      queryClient.invalidateQueries({ queryKey: actionKeys.streak });
    },
  });
}
