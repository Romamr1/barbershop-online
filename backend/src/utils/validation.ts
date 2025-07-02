import { z } from 'zod';
import { Role } from '../types';

// User validation schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  role: z.enum(['superadmin', 'admin', 'barber', 'client'] as const).optional().default('client'),
});

// Barbershop validation schemas
export const createBarbershopSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  description: z.string().optional(),
  type: z.string().min(1, 'Type is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  email: z.string().email('Invalid email address'),
  workingHours: z.record(z.any()),
  images: z.array(z.string().url()).optional(),
});

export const updateBarbershopSchema = createBarbershopSchema.partial();

// Service validation schemas
export const createServiceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  durationMin: z.number().int().positive('Duration must be a positive integer'),
  category: z.string().optional(),
  barberShopId: z.string().uuid('Invalid barbershop ID'),
  barberIds: z.array(z.string().uuid()).optional(),
});

export const updateServiceSchema = createServiceSchema.partial();

// Barber validation schemas
export const createBarberSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  barberShopId: z.string().uuid('Invalid barbershop ID'),
  bio: z.string().optional(),
  avatar: z.string().url().optional(),
  specialties: z.array(z.string()).optional(),
  workingHours: z.record(z.any()),
});

export const updateBarberSchema = createBarberSchema.partial();

// Booking validation schemas
export const createBookingSchema = z.object({
  barberId: z.string().uuid('Invalid barber ID'),
  serviceIds: z.array(z.string().uuid('Invalid service ID')).min(1, 'At least one service is required'),
  startTime: z.string().datetime('Invalid start time'),
  endTime: z.string().datetime('Invalid end time'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  notes: z.string().optional(),
});

export const updateBookingSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
  notes: z.string().optional(),
});

// Slot validation schemas
export const createSlotSchema = z.object({
  barberId: z.string().uuid('Invalid barber ID'),
  startTime: z.string().datetime('Invalid start time'),
  endTime: z.string().datetime('Invalid end time'),
  isBlocked: z.boolean().optional().default(false),
});

export const updateSlotSchema = createSlotSchema.partial();

// Filter validation schemas
export const barbershopFiltersSchema = z.object({
  type: z.string().optional(),
  location: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(10),
});

export const bookingFiltersSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
  barberId: z.string().uuid().optional(),
  barbershopId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(10),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(10),
});

// Validation helper function
export const validateSchema = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  return schema.parse(data);
};

export const validateSchemaSafe = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Validation failed' };
    }
    return { success: false, error: 'Validation failed' };
  }
}; 