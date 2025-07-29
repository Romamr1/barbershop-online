export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'client' | 'barber' | 'admin' | 'superadmin';
  barberShopId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Barbershop {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  description: string;
  type: string;
  workingHours: string; // JSON string from backend
  images: string; // JSON string from backend
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  admins?: User[];
  barbers?: Barber[];
  services?: Service[];
  _count?: {
    barbers: number;
    services: number;
    bookings: number;
  };
}

// Parsed barbershop data for frontend use
export interface ParsedBarbershop extends Omit<Barbershop, 'workingHours' | 'images'> {
  workingHours: Record<string, any>;
  images: string[];
}

export interface OpeningHours {
  day: number; // 0-6 (Sunday-Saturday)
  open: string; // HH:MM format
  close: string; // HH:MM format
  isOpen: boolean;
}

export interface Barber {
  id: string;
  userId: string;
  barberShopId: string;
  bio: string;
  avatar?: string;
  specialties: string; // JSON string from backend
  workingHours: string; // JSON string from backend
  user?: {
    name: string;
    email: string;
    phone?: string;
  };
  barberShop?: {
    id: string;
    name: string;
    address: string;
  };
  services?: Service[];
  createdAt: string;
  updatedAt: string;
}

// Parsed barber data for frontend use
export interface ParsedBarber extends Omit<Barber, 'specialties' | 'workingHours'> {
  specialties: string[];
  workingHours: Record<string, any>;
  name: string; // Extracted from user.name
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  durationMin: number; // in minutes
  category?: string;
  barberShopId: string;
  barbers?: Barber[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkingHours {
  day: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isWorking: boolean;
}

export interface TimeSlot {
  id: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  isAvailable: boolean;
  barberId: string;
  barbershopId: string;
}

export interface Booking {
  id: string;
  clientId: string;
  barberId: string;
  barbershopId: string;
  services: Service[];
  startTime: string; // ISO string
  endTime: string; // ISO string
  totalPrice: number;
  totalDuration: number; // in minutes
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  clientPhone: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingWithDetails extends Booking {
  client: User;
  barber: Barber;
  barbershop: Barbershop;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
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

export interface FilterOptions {
  type?: string;
  location?: string;
  priceRange?: [number, number];
  rating?: number;
  date?: string;
}

export interface BookingFormData {
  barbershopId: string;
  barberId: string;
  serviceIds: string[];
  date: string;
  timeSlot: string;
  phone: string;
  notes?: string;
} 