import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { CustomError } from '../middlewares/errorHandler';

export const getAvailableSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { barberId, date } = req.query;

    if (!barberId || !date) {
      throw new CustomError('Barber ID and date are required', 400);
    }

    // Parse the date
    const targetDate = new Date(date as string);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get existing slots for the barber on the specified date
    const existingSlots = await prisma.slot.findMany({
      where: {
        barberId: barberId as string,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // Get barber's working hours
    const barber = await prisma.barber.findUnique({
      where: { id: barberId as string },
      select: {
        workingHours: true,
        barberShopId: true,
      },
    });

    if (!barber) {
      throw new CustomError('Barber not found', 404);
    }

    const workingHours = JSON.parse(barber.workingHours || '{}');
    const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const daySchedule = workingHours[dayOfWeek];

    if (!daySchedule || !daySchedule.isOpen) {
      res.json({
        success: true,
        message: 'Barber is not working on this day',
        data: []
      });
      return;
    }

    // Generate available time slots
    const availableSlots = [];
    const slotDuration = 60; // 60 minutes per slot
    
    // Parse the time strings (e.g., "09:00", "17:00")
    const [openHour, openMinute] = daySchedule.open.split(':').map(Number);
    const [closeHour, closeMinute] = daySchedule.close.split(':').map(Number);
    
    // Create Date objects for the target date with the working hours
    const startTime = new Date(targetDate);
    startTime.setHours(openHour, openMinute, 0, 0);
    
    const endTime = new Date(targetDate);
    endTime.setHours(closeHour, closeMinute, 0, 0);

    let currentTime = new Date(startTime);
    
    while (currentTime < endTime) {
      const slotStart = new Date(currentTime);
      const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);

      // Check if this slot conflicts with existing bookings
      const conflictingSlot = existingSlots.find((slot: any) => {
        const existingStart = new Date(slot.startTime);
        const existingEnd = new Date(slot.endTime);
        return (
          (slotStart >= existingStart && slotStart < existingEnd) ||
          (slotEnd > existingStart && slotEnd <= existingEnd) ||
          (slotStart <= existingStart && slotEnd >= existingEnd)
        );
      });

      if (!conflictingSlot) {
        availableSlots.push({
          id: `slot_${Date.now()}_${Math.random()}`,
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          isAvailable: true,
          barberId: barberId as string,
          barbershopId: barber.barberShopId,
        });
      }

      currentTime = new Date(currentTime.getTime() + slotDuration * 60000);
    }

    res.json({
      success: true,
      message: 'Available slots retrieved successfully',
      data: availableSlots
    });
  } catch (error) {
    throw error;
  }
};

export const blockSlot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { barberId, startTime, endTime, reason } = req.body;

    if (!barberId || !startTime || !endTime) {
      throw new CustomError('Barber ID, start time, and end time are required', 400);
    }

    // Check if user is admin of the barbershop or superadmin
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    const barber = await prisma.barber.findUnique({
      where: { id: barberId },
      include: {
        barberShop: {
          include: {
            admins: {
              select: { id: true }
            }
          }
        }
      }
    });

    if (!barber) {
      throw new CustomError('Barber not found', 404);
    }

    const isAdmin = barber.barberShop.admins.some((admin: any) => admin.id === req.user!.id);
    if (!isAdmin && req.user.role !== 'superadmin') {
      throw new CustomError('Insufficient permissions to block slot', 403);
    }

    const slot = await prisma.slot.create({
      data: {
        barberId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        isBlocked: true,
        isBooked: false
      },
    });

    res.status(201).json({
      success: true,
      message: 'Slot blocked successfully',
      data: { slot }
    });
  } catch (error) {
    throw error;
  }
};

export const unblockSlot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if user is admin of the barbershop or superadmin
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    const slot = await prisma.slot.findUnique({
      where: { id },
      include: {
        barber: {
          include: {
            barberShop: {
              include: {
                admins: {
                  select: { id: true }
                }
              }
            }
          }
        }
      }
    });

    if (!slot) {
      throw new CustomError('Slot not found', 404);
    }

    const isAdmin = slot.barber.barberShop.admins.some((admin: any) => admin.id === req.user!.id);
    if (!isAdmin && req.user.role !== 'superadmin') {
      throw new CustomError('Insufficient permissions to unblock slot', 403);
    }

    await prisma.slot.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Slot unblocked successfully',
    });
  } catch (error) {
    throw error;
  }
}; 