import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { getAuthToken, getCurrentUser, setAuthToken, setCurrentUser, removeAuthToken, removeCurrentUser, migrateDataIfNeeded } from '../lib/storage';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string) => void;
  signup: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    const storedUser = getCurrentUser();
    
    if (token && storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = (email: string) => {
    // Mock login
    const mockToken = `mock_jwt_${uuidv4()}`;
    // In a real app, we'd fetch the user from backend. Here we simulate it or create if not exists locally for demo
    // For the requirement "Mock users for testing", we'll just create/update the user object based on email
    // But wait, the requirement says "On submit: create mock JWT token, store in localStorage".
    // It also says "Mock users for testing: email: 'test@example.com'".
    
    // Let's try to find if we have this user stored somewhere? 
    // The prompt implies we just store the *current* user in localStorage.ssi_user.
    // But if I logout and login as another user, I should probably not lose data.
    // The data is stored in ssi_snapshots with userId. So as long as I generate a stable ID for the email, it works.
    
    const userId = btoa(email); // Simple stable ID from email
    const userObj: User = {
      id: userId,
      email,
      createdAt: new Date().toISOString()
    };

    setAuthToken(mockToken);
    setCurrentUser(userObj);
    setUser(userObj);
    setIsAuthenticated(true);
    
    // Attempt migration of old anonymous data to this user
    migrateDataIfNeeded(userObj.id);
  };

  const signup = (email: string) => {
    login(email); // For this mock implementation, signup and login are effectively the same
  };

  const logout = () => {
    removeAuthToken();
    removeCurrentUser();
    setUser(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return null; // Or a loading spinner
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
