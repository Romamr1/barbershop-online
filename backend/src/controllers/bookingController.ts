import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { validateSchema } from '../utils/validation';
import { createBookingSchema, updateBookingSchema, bookingFiltersSchema } from '../utils/validation';
import { CustomError } from '../middlewares/errorHandler';
import { addMinutes, isAfter, isBefore, parseISO } from 'date-fns';

export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = validateSchema(createBookingSchema, req.body);

    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    // Get the slot and verify it's available
    const slot = await prisma.slot.findUnique({
      where: { id: validatedData.slotId },
      include: {
        barber: {
          include: {
            barberShop: true,
            services: true,
          }
        }
      }
    });

    if (!slot) {
      throw new CustomError('Slot not found', 404);
    }

    if (slot.isBooked || slot.isBlocked) {
      throw new CustomError('Slot is not available', 400);
    }

    // Get services and calculate total
    const services = await prisma.service.findMany({
      where: {
        id: { in: validatedData.serviceIds },
        barberShopId: slot.barber.barberShopId,
      }
    });

    if (services.length !== validatedData.serviceIds.length) {
      throw new CustomError('Some services not found', 404);
    }

    // Verify barber can perform these services
    const barberServiceIds = slot.barber.services.map((s: any) => s.id);
    const canPerformAll = validatedData.serviceIds.every(serviceId => 
      barberServiceIds.includes(serviceId)
    );

    if (!canPerformAll) {
      throw new CustomError('Barber cannot perform all selected services', 400);
    }

    // Calculate total price and duration
    const totalPrice = services.reduce((sum: number, service: any) => sum + service.price, 0);
    const totalDuration = services.reduce((sum: number, service: any) => sum + service.durationMin, 0);

    // Verify slot duration is sufficient
    const slotDuration = Math.round((slot.endTime.getTime() - slot.startTime.getTime()) / (1000 * 60));
    if (slotDuration < totalDuration) {
      throw new CustomError('Slot duration is insufficient for selected services', 400);
    }

    // Create booking with transaction
    const booking = await prisma.$transaction(async (tx: any) => {
      // Mark slot as booked
      await tx.slot.update({
        where: { id: validatedData.slotId },
        data: { isBooked: true }
      });

      // Create booking
      const newBooking = await tx.booking.create({
        data: {
          userId: req.user!.id,
          barberId: validatedData.barberId,
          barberShopId: slot.barber.barberShopId,
          slotId: validatedData.slotId,
          totalPrice,
          totalDuration,
          phone: validatedData.phone,
          notes: validatedData.notes,
        }
      });

      // Create booking-service relationships
      await tx.bookingService.createMany({
        data: services.map((service: any) => ({
          bookingId: newBooking.id,
          serviceId: service.id,
          price: service.price,
          duration: service.durationMin,
        }))
      });

      return newBooking;
    });

    // Get the complete booking with relations
    const completeBooking = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        barber: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        },
        barberShop: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
          }
        },
        slot: true,
      }
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking: completeBooking }
    });
  } catch (error) {
    throw error;
  }
};

export const getBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedFilters = validateSchema(bookingFiltersSchema, req.query);
    const { page: pageParam, limit: limitParam, status, barberId, barbershopId, startDate, endDate } = validatedFilters;
    const page: number = pageParam ?? 1;
    const limit: number = limitParam ?? 10;
    const skip = (page - 1) * limit;

    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    // Build where clause based on user role
    const where: any = {};

    if (req.user.role === 'client') {
      where.userId = req.user.id;
    } else if (req.user.role === 'barber') {
      where.barberId = req.user.id;
    } else if (req.user.role === 'admin' && req.user.barberShopId) {
      where.barberShopId = req.user.barberShopId;
    }

    if (status) where.status = status;
    if (barberId) where.barberId = barberId;
    if (barbershopId) where.barberShopId = barbershopId;
    if (startDate) where.createdAt = { gte: new Date(startDate) };
    if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate) };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            }
          },
          barber: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                }
              }
            }
          },
          barberShop: {
            select: {
              id: true,
              name: true,
              address: true,
            }
          },
          slot: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.booking.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    const bookingsWithDetails = bookings.map((slot: any) => ({
      ...slot,
      booking: slot.booking ? {
        id: slot.booking.id,
        status: slot.booking.status,
      } : null,
    }));

    res.json({
      success: true,
      message: 'Bookings retrieved successfully',
      data: {
        bookings: bookingsWithDetails,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        }
      }
    });
  } catch (error) {
    throw error;
  }
};

export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        barber: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        },
        barberShop: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
          }
        },
        slot: true,
      }
    });

    if (!booking) {
      throw new CustomError('Booking not found', 404);
    }

    // Check permissions
    const canAccess = 
      req.user.role === 'superadmin' ||
      req.user.role === 'admin' ||
      booking.userId === req.user.id ||
      booking.barberId === req.user.id;

    if (!canAccess) {
      throw new CustomError('Insufficient permissions to view this booking', 403);
    }

    res.json({
      success: true,
      message: 'Booking retrieved successfully',
      data: { booking }
    });
  } catch (error) {
    throw error;
  }
};

export const updateBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const validatedData = validateSchema(updateBookingSchema, req.body);

    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        barber: true,
        slot: true,
      }
    });

    if (!booking) {
      throw new CustomError('Booking not found', 404);
    }

    // Check permissions
    const canUpdate = 
      req.user.role === 'superadmin' ||
      req.user.role === 'admin' ||
      booking.barberId === req.user.id;

    if (!canUpdate) {
      throw new CustomError('Insufficient permissions to update this booking', 403);
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: validatedData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        barber: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        },
        barberShop: {
          select: {
            id: true,
            name: true,
            address: true,
          }
        },
        slot: true,
      }
    });

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: { booking: updatedBooking }
    });
  } catch (error) {
    throw error;
  }
};

export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        slot: true,
      }
    });

    if (!booking) {
      throw new CustomError('Booking not found', 404);
    }

    // Check permissions
    const canCancel = 
      req.user.role === 'superadmin' ||
      req.user.role === 'admin' ||
      booking.userId === req.user.id;

    if (!canCancel) {
      throw new CustomError('Insufficient permissions to cancel this booking', 403);
    }

    // Check if booking can be cancelled (not too close to appointment)
    const now = new Date();
    const appointmentTime = booking.slot.startTime;
    const hoursUntilAppointment = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilAppointment < 2) {
      throw new CustomError('Cannot cancel booking within 2 hours of appointment', 400);
    }

    // Cancel booking with transaction
    await prisma.$transaction(async (tx: any) => {
      await tx.booking.update({
        where: { id },
        data: { status: 'cancelled' }
      });

      await tx.slot.update({
        where: { id: booking.slotId },
        data: { isBooked: false }
      });
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
    });
  } catch (error) {
    throw error;
  }
};

export const getCalendar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { barberId, date } = req.query;

    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    if (!barberId || !date) {
      throw new CustomError('Barber ID and date are required', 400);
    }

    const targetDate = new Date(date as string);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const slots = await prisma.slot.findMany({
      where: {
        barberId: barberId as string,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        }
      },
      include: {
        booking: {
          select: {
            id: true,
            status: true,
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    const calendarSlots = slots.map((slot: any) => ({
      id: slot.id,
      startTime: slot.startTime.toISOString(),
      endTime: slot.endTime.toISOString(),
      isAvailable: !slot.isBooked && !slot.isBlocked,
      isBooked: slot.isBooked,
      isBlocked: slot.isBlocked,
      booking: slot.booking ? {
        id: slot.booking.id,
        status: slot.booking.status,
      } : null,
    }));

    res.json({
      success: true,
      message: 'Calendar retrieved successfully',
      data: {
        barberId,
        date: targetDate.toISOString(),
        slots: calendarSlots,
      }
    });
  } catch (error) {
    throw error;
  }
}; 