import { ApiResponse, PaginatedResponse } from '@/types';
import { config } from './config';

const API_BASE_URL = config.api.baseUrl;

// Log the API base URL in development for debugging
if (process.env.NODE_ENV === 'development') {
  console.log('🌐 API Base URL:', API_BASE_URL);
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

// Get auth token from localStorage
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
}

// Add auth headers to requests
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
}

export async function apiGet<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include',
  });

  return handleResponse<T>(response);
}

export async function apiPost<T>(endpoint: string, data?: any): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: data ? JSON.stringify(data) : undefined,
  });

  return handleResponse<T>(response);
}

export async function apiPut<T>(endpoint: string, data?: any): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: getHeaders(),
    credentials: 'include',
    body: data ? JSON.stringify(data) : undefined,
  });

  return handleResponse<T>(response);
}

export async function apiDelete<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers: getHeaders(),
    credentials: 'include',
  });

  return handleResponse<T>(response);
}

// Auth API functions
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiPost<ApiResponse<{ user: any; accessToken: string }>>('/auth/login', { email, password });
    // Store access token
    if (response.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    return response;
  },
  
  register: async (userData: { name: string; email: string; password: string; phone?: string }) => {
    const response = await apiPost<ApiResponse<{ user: any; accessToken: string }>>('/auth/register', userData);
    // Store access token
    if (response.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    return response;
  },
  
  logout: async () => {
    const response = await apiPost<ApiResponse<null>>('/auth/logout');
    // Clear access token
    localStorage.removeItem('accessToken');
    return response;
  },
  
  me: () => apiGet<ApiResponse<any>>('/auth/me'),
  
  refresh: () => apiPost<ApiResponse<{ user: any; accessToken: string }>>('/auth/refresh'),
};

// Barbershop API functions
export const barbershopApi = {
  getAll: (filters?: any) => apiGet<ApiResponse<{ barbershops: any[]; pagination: any }>>('/barbershops', filters),
  getById: (id: string) => apiGet<ApiResponse<any>>(`/barbershops/${id}`),
  create: (data: any) => apiPost<ApiResponse<any>>('/barbershops', data),
  update: (id: string, data: any) => apiPut<ApiResponse<any>>(`/barbershops/${id}`, data),
  delete: (id: string) => apiDelete<ApiResponse<null>>(`/barbershops/${id}`),
  getAdmins: (id: string) => apiGet<ApiResponse<any[]>>(`/barbershops/${id}/admins`),
};

// Barber API functions
export const barberApi = {
  getAll: (barbershopId?: string) => apiGet<ApiResponse<any[]>>('/barbers', { barbershopId }),
  getById: (id: string) => apiGet<ApiResponse<any>>(`/barbers/${id}`),
  create: (data: any) => apiPost<ApiResponse<any>>('/barbers', data),
  update: (id: string, data: any) => apiPut<ApiResponse<any>>(`/barbers/${id}`, data),
  delete: (id: string) => apiDelete<ApiResponse<null>>(`/barbers/${id}`),
};

// Service API functions
export const serviceApi = {
  getAll: (barbershopId?: string) => apiGet<ApiResponse<any[]>>('/services', { barbershopId }),
  getById: (id: string) => apiGet<ApiResponse<any>>(`/services/${id}`),
  create: (data: any) => apiPost<ApiResponse<any>>('/services', data),
  update: (id: string, data: any) => apiPut<ApiResponse<any>>(`/services/${id}`, data),
  delete: (id: string) => apiDelete<ApiResponse<null>>(`/services/${id}`),
};

// Booking API functions
export const bookingApi = {
  getAll: (filters?: any) => apiGet<PaginatedResponse<any>>('/bookings', filters),
  getById: (id: string) => apiGet<ApiResponse<any>>(`/bookings/${id}`),
  create: (data: any) => apiPost<ApiResponse<any>>('/bookings', data),
  update: (id: string, data: any) => apiPut<ApiResponse<any>>(`/bookings/${id}`, data),
  cancel: (id: string) => apiDelete<ApiResponse<null>>(`/bookings/${id}`),
  getCalendar: (barberId: string, date: string) => 
    apiGet<ApiResponse<any>>('/bookings/calendar', { barberId, date }),
};

// Calendar/Slots API functions
export const calendarApi = {
  getSlots: (barberId: string, date: string) => 
    apiGet<ApiResponse<any>>('/bookings/calendar', { barberId, date }),
};

// Time slot API functions
export const timeSlotApi = {
  getAvailable: (barberId: string, date: string) =>
    apiGet<ApiResponse<any[]>>('/timeslots/available', { barberId, date }),
  block: (data: any) => apiPost<ApiResponse<any>>('/timeslots/block', data),
  unblock: (id: string) => apiDelete<ApiResponse<null>>(`/timeslots/${id}`),
}; 