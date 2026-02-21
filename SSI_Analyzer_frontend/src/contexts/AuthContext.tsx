import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { getAuthToken, getCurrentUser, setAuthToken, setCurrentUser, removeAuthToken, removeCurrentUser } from '../lib/storage';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, userId: string, email: string) => void;
  signup: (token: string, userId: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = getAuthToken();
    const storedUser = getCurrentUser();

    if (token && storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = useCallback((token: string, userId: string, email: string) => {
    const userObj: User = {
      id: userId,
      email,
      createdAt: new Date().toISOString(),
    };

    setAuthToken(token);
    setCurrentUser(userObj);
    setUser(userObj);
    setIsAuthenticated(true);
  }, []);

  const login = useCallback((token: string, userId: string, email: string) => {
    handleAuthSuccess(token, userId, email);
  }, [handleAuthSuccess]);

  const signup = useCallback((token: string, userId: string, email: string) => {
    handleAuthSuccess(token, userId, email);
  }, [handleAuthSuccess]);

  const logout = useCallback(() => {
    removeAuthToken();
    removeCurrentUser();
    setUser(null);
    setIsAuthenticated(false);
    queryClient.clear();
  }, [queryClient]);

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
