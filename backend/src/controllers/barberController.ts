import { Request, Response } from 'express';
import { prisma } from '@/prisma/client.js';
import { validateSchema } from '@/utils/validation.js';
import { createBarberSchema, updateBarberSchema } from '@/utils/validation.js';
import { CustomError } from '@/middlewares/errorHandler.js';

export const createBarber = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = validateSchema(createBarberSchema, req.body);

    // Check if user is admin of the barbershop or superadmin
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    const barbershop = await prisma.barberShop.findUnique({
      where: { id: validatedData.barberShopId },
      include: {
        admins: {
          select: { id: true }
        }
      }
    });

    if (!barbershop) {
      throw new CustomError('Barbershop not found', 404);
    }

    const isAdmin = barbershop.admins.some(admin => admin.id === req.user!.id);
    if (!isAdmin && req.user.role !== 'superadmin') {
      throw new CustomError('Insufficient permissions to create barber', 403);
    }

    // Check if user exists and is not already a barber
    const existingUser = await prisma.user.findUnique({
      where: { id: validatedData.userId }
    });

    if (!existingUser) {
      throw new CustomError('User not found', 404);
    }

    if (existingUser.role !== 'barber') {
      throw new CustomError('User must have barber role', 400);
    }

    const existingBarber = await prisma.barber.findFirst({
      where: { userId: validatedData.userId }
    });

    if (existingBarber) {
      throw new CustomError('User is already a barber', 409);
    }

    const barber = await prisma.barber.create({
      data: {
        userId: validatedData.userId,
        barberShopId: validatedData.barberShopId,
        bio: validatedData.bio,
        avatar: validatedData.avatar,
        specialties: JSON.stringify(validatedData.specialties || []),
        workingHours: JSON.stringify(validatedData.workingHours || {}),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        },
        services: {
          select: {
            id: true,
            name: true,
            price: true,
            durationMin: true,
            category: true,
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Barber created successfully',
      data: { barber }
    });
  } catch (error) {
    throw error;
  }
};

export const getBarbers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { barbershopId } = req.query;

    const where: any = {};
    if (barbershopId) {
      where.barberShopId = barbershopId as string;
    }

    const barbers = await prisma.barber.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        },
        services: {
          select: {
            id: true,
            name: true,
            price: true,
            durationMin: true,
            category: true,
          }
        },
        barberShop: {
          select: {
            id: true,
            name: true,
            address: true,
          }
        }
      },
      orderBy: {
        user: {
          name: 'asc'
        }
      }
    });

    res.json({
      success: true,
      message: 'Barbers retrieved successfully',
      data: barbers
    });
  } catch (error) {
    throw error;
  }
};

export const getBarberById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const barber = await prisma.barber.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
          }
        },
        services: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            durationMin: true,
            category: true,
          }
        },
        barberShop: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true,
          }
        }
      }
    });

    if (!barber) {
      throw new CustomError('Barber not found', 404);
    }

    res.json({
      success: true,
      message: 'Barber retrieved successfully',
      data: { barber }
    });
  } catch (error) {
    throw error;
  }
};

export const updateBarber = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const validatedData = validateSchema(updateBarberSchema, req.body);

    // Check if user is admin of the barbershop or superadmin
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    const barber = await prisma.barber.findUnique({
      where: { id },
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
      throw new CustomError('Insufficient permissions to update this barber', 403);
    }

    // Convert specialties and workingHours to string if present
    const updateData: any = { ...validatedData };
    
    if (updateData.specialties && Array.isArray(updateData.specialties)) {
      updateData.specialties = JSON.stringify(updateData.specialties);
    }
    if (updateData.workingHours && typeof updateData.workingHours === 'object') {
      updateData.workingHours = JSON.stringify(updateData.workingHours);
    }
    
    // Remove barberShopId from update data as it shouldn't be updated
    delete updateData.barberShopId;

    const updatedBarber = await prisma.barber.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        },
        services: {
          select: {
            id: true,
            name: true,
            price: true,
            durationMin: true,
            category: true,
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Barber updated successfully',
      data: { barber: updatedBarber }
    });
  } catch (error) {
    throw error;
  }
};

export const deleteBarber = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if user is admin of the barbershop or superadmin
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    const barber = await prisma.barber.findUnique({
      where: { id },
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
      throw new CustomError('Insufficient permissions to delete this barber', 403);
    }

    await prisma.barber.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Barber deleted successfully',
    });
  } catch (error) {
    throw error;
  }
}; 