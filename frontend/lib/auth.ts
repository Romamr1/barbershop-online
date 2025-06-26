import { User } from '@/types';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Check if user is authenticated (client-side)
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check if we have access token
  const token = localStorage.getItem('accessToken');
  return !!token;
}

// Get current user from localStorage
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
}

// Set user data in localStorage
export function setCurrentUser(user: User | null): void {
  if (typeof window === 'undefined') return;
  
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
}

// Get access token
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

// Set access token
export function setAccessToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  
  if (token) {
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
  }
}

// Clear all auth data
export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
}

// Check if user has required role
export function hasRole(user: User | null, requiredRoles: string[]): boolean {
  if (!user) return false;
  return requiredRoles.includes(user.role);
}

// Check if user can access admin features
export function isAdmin(user: User | null): boolean {
  return hasRole(user, ['admin', 'superadmin']);
}

// Check if user can access barber features
export function isBarber(user: User | null): boolean {
  return hasRole(user, ['barber', 'admin', 'superadmin']);
}

// Check if user is super admin
export function isSuperAdmin(user: User | null): boolean {
  return hasRole(user, ['superadmin']);
}

// Get user's barbershop ID (for barbers/admins)
export function getUserBarbershopId(user: User | null): string | null {
  if (!user) return null;
  return user.barberShopId || null;
}

// Redirect based on user role
export function getRedirectPath(user: User | null): string {
  if (!user) return '/login';
  
  switch (user.role) {
    case 'client':
      return '/';
    case 'barber':
      return '/barber/dashboard';
    case 'admin':
      return '/admin/dashboard';
    case 'superadmin':
      return '/admin/dashboard';
    default:
      return '/';
  }
}

// Check if token is expired (basic check)
export function isTokenExpired(): boolean {
  const token = getAccessToken();
  if (!token) return true;
  
  try {
    // Decode JWT token (without verification)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    return payload.exp < currentTime;
  } catch {
    return true;
  }
} 