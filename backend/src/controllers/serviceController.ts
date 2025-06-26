import { Request, Response } from 'express';
import { prisma } from '@/prisma/client.js';
import { validateSchema } from '@/utils/validation.js';
import { createServiceSchema, updateServiceSchema } from '@/utils/validation.js';
import { CustomError } from '@/middlewares/errorHandler.js';

export const createService = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = validateSchema(createServiceSchema, req.body);

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

    const isAdmin = barbershop.admins.some((admin: any) => admin.id === req.user!.id);
    if (!isAdmin && req.user.role !== 'superadmin') {
      throw new CustomError('Insufficient permissions to create service', 403);
    }

    const service = await prisma.service.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        durationMin: validatedData.durationMin,
        category: validatedData.category,
        barberShopId: validatedData.barberShopId,
      },
      include: {
        barbers: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
              }
            }
          }
        }
      }
    });

    // Associate barbers if provided
    if (validatedData.barberIds && validatedData.barberIds.length > 0) {
      await prisma.service.update({
        where: { id: service.id },
        data: {
          barbers: {
            connect: validatedData.barberIds.map(id => ({ id }))
          }
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: { service }
    });
  } catch (error) {
    throw error;
  }
};

export const getServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { barbershopId } = req.query;

    const where: any = {};
    if (barbershopId) {
      where.barberShopId = barbershopId as string;
    }

    const services = await prisma.service.findMany({
      where,
      include: {
        barbers: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
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
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json({
      success: true,
      message: 'Services retrieved successfully',
      data: services
    });
  } catch (error) {
    throw error;
  }
};

export const getServiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        barbers: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true,
              }
            },
            bio: true,
            avatar: true,
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

    if (!service) {
      throw new CustomError('Service not found', 404);
    }

    res.json({
      success: true,
      message: 'Service retrieved successfully',
      data: { service }
    });
  } catch (error) {
    throw error;
  }
};

export const updateService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const validatedData = validateSchema(updateServiceSchema, req.body);

    // Check if user is admin of the barbershop or superadmin
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    const service = await prisma.service.findUnique({
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

    if (!service) {
      throw new CustomError('Service not found', 404);
    }

    const isAdmin = service.barberShop.admins.some((admin: any) => admin.id === req.user!.id);
    if (!isAdmin && req.user.role !== 'superadmin') {
      throw new CustomError('Insufficient permissions to update this service', 403);
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: validatedData,
      include: {
        barbers: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: { service: updatedService }
    });
  } catch (error) {
    throw error;
  }
};

export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if user is admin of the barbershop or superadmin
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    const service = await prisma.service.findUnique({
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

    if (!service) {
      throw new CustomError('Service not found', 404);
    }

    const isAdmin = service.barberShop.admins.some((admin: any) => admin.id === req.user!.id);
    if (!isAdmin && req.user.role !== 'superadmin') {
      throw new CustomError('Insufficient permissions to delete this service', 403);
    }

    await prisma.service.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    throw error;
  }
}; 