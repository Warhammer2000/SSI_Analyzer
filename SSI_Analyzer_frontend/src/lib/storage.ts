import { User } from '../types';

const KEYS = {
  TOKEN: 'ssi_token',
  USER: 'ssi_user',
};

// Auth Token
export function getAuthToken(): string | null {
  return localStorage.getItem(KEYS.TOKEN);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(KEYS.TOKEN, token);
}

export function removeAuthToken(): void {
  localStorage.removeItem(KEYS.TOKEN);
}

// Current User
export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem(KEYS.USER);
  return userStr ? JSON.parse(userStr) : null;
}

export function setCurrentUser(user: User): void {
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
}

export function removeCurrentUser(): void {
  localStorage.removeItem(KEYS.USER);
}
