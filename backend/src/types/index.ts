// User types
export type Role = 'superadmin' | 'admin' | 'barber' | 'client';

export interface UserPayload {
  id: string;
  email: string;
  name: string;
  role: Role;
  barberShopId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Request types
export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

// Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Validation schemas
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: Role;
}

export interface CreateBarbershopRequest {
  name: string;
  address: string;
  description?: string;
  type: string;
  latitude?: number;
  longitude?: number;
  phone: string;
  email: string;
  workingHours: Record<string, any>;
  images?: string[];
}

export interface CreateServiceRequest {
  name: string;
  description?: string;
  price: number;
  durationMin: number;
  category?: string;
  barberIds?: string[];
}

export interface CreateBookingRequest {
  barberId: string;
  serviceIds: string[];
  slotId: string;
  phone: string;
  notes?: string;
}

export interface CreateSlotRequest {
  barberId: string;
  startTime: string;
  endTime: string;
  isBlocked?: boolean;
}

// Working hours structure
export interface WorkingHours {
  [day: string]: {
    isOpen: boolean;
    open?: string;
    close?: string;
  };
}

// Calendar types
export interface CalendarSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBooked: boolean;
  isBlocked: boolean;
}

export interface BarberCalendar {
  barberId: string;
  barberName: string;
  slots: CalendarSlot[];
}

// Filter types
export interface BarbershopFilters {
  type?: string;
  location?: string;
  rating?: number;
  page?: number;
  limit?: number;
}

export interface BookingFilters {
  status?: string;
  barberId?: string;
  barbershopId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
} 