import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { validateSchema } from '../utils/validation';
import { createBarberSchema, updateBarberSchema, createBarberWithUserSchema, assignUserAsBarberSchema } from '../utils/validation';
import { CustomError } from '../middlewares/errorHandler';
import { hashPassword } from '../utils/password';

export const createBarberWithUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = validateSchema(createBarberWithUserSchema, req.body);

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

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      throw new CustomError('User with this email already exists', 409);
    }

    // Hash the password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user and barber in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the user
      const user = await tx.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          passwordHash: hashedPassword,
          phone: validatedData.phone,
          role: 'barber',
          barberShopId: validatedData.barberShopId,
        }
      });

      // Create the barber profile
      const barber = await tx.barber.create({
        data: {
          userId: user.id,
          barberShopId: validatedData.barberShopId,
          bio: validatedData.bio || '',
          avatar: validatedData.avatar || null,
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
              phone: true,
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

      return { user, barber };
    });

    res.status(201).json({
      success: true,
      message: 'Barber created successfully with user account',
      data: { 
        barber: result.barber,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          phone: result.user.phone,
        }
      }
    });
  } catch (error) {
    throw error;
  }
};

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

export const getAvailableUsersForBarber = async (req: Request, res: Response): Promise<void> => {
  try {
    const { barbershopId } = req.query;

    if (!barbershopId) {
      throw new CustomError('Barbershop ID is required', 400);
    }

    // Check if user is admin of the barbershop or superadmin
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    const barbershop = await prisma.barberShop.findUnique({
      where: { id: barbershopId as string },
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
      throw new CustomError('Insufficient permissions', 403);
    }

    // Get users who are clients and not already barbers
    const availableUsers = await prisma.user.findMany({
      where: {
        role: 'client',
        barber: null, // Not already a barber
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json({
      success: true,
      message: 'Available users retrieved successfully',
      data: { users: availableUsers }
    });
  } catch (error) {
    throw error;
  }
};

export const assignUserAsBarber = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = validateSchema(assignUserAsBarberSchema, req.body);

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
      throw new CustomError('Insufficient permissions to assign barber', 403);
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: validatedData.userId }
    });

    if (!existingUser) {
      throw new CustomError('User not found', 404);
    }

    // Check if user is already a barber
    const existingBarber = await prisma.barber.findFirst({
      where: { userId: validatedData.userId }
    });

    if (existingBarber) {
      throw new CustomError('User is already a barber', 409);
    }

    // Update user role to barber and assign to barbershop
    const updatedUser = await prisma.user.update({
      where: { id: validatedData.userId },
      data: {
        role: 'barber',
        barberShopId: validatedData.barberShopId,
      }
    });

    // Create barber profile
    const barber = await prisma.barber.create({
      data: {
        userId: validatedData.userId,
        barberShopId: validatedData.barberShopId,
        bio: '',
        specialties: JSON.stringify([]),
        workingHours: JSON.stringify({}),
      },
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
            price: true,
            durationMin: true,
            category: true,
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'User assigned as barber successfully',
      data: { 
        barber,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          phone: updatedUser.phone,
        }
      }
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