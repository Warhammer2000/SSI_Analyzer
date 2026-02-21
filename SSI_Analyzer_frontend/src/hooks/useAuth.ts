import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import { AuthResponse } from '../types';

interface AuthCredentials {
  email: string;
  password: string;
}

export function useLoginMutation() {
  return useMutation<AuthResponse, Error, AuthCredentials>({
    mutationFn: async (credentials) => {
      const { data } = await api.post<AuthResponse>('/auth/login', credentials);
      return data;
    },
  });
}

export function useRegisterMutation() {
  return useMutation<AuthResponse, Error, AuthCredentials>({
    mutationFn: async (credentials) => {
      const { data } = await api.post<AuthResponse>('/auth/register', credentials);
      return data;
    },
  });
}
