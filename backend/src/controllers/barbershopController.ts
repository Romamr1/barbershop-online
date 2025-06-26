import { Request, Response } from 'express';
import { prisma } from '@/prisma/client.js';
import { validateSchema, validateSchemaSafe } from '@/utils/validation.js';
import { createBarbershopSchema, updateBarbershopSchema, barbershopFiltersSchema } from '@/utils/validation.js';
import { CustomError } from '@/middlewares/errorHandler.js';
import { Role } from '@/types/index.js';

export const createBarbershop = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = validateSchema(createBarbershopSchema, req.body);

    // Check if user is admin or superadmin
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
      throw new CustomError('Insufficient permissions to create barbershop', 403);
    }

    const barbershop = await prisma.barberShop.create({
      data: {
        name: validatedData.name,
        address: validatedData.address,
        description: validatedData.description,
        type: validatedData.type,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        phone: validatedData.phone,
        email: validatedData.email,
        workingHours: JSON.stringify(validatedData.workingHours),
        images: JSON.stringify(validatedData.images || []),
      },
      include: {
        admins: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        },
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
            specialties: true,
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
        _count: {
          select: {
            barbers: true,
            services: true,
            bookings: true,
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Barbershop created successfully',
      data: { barbershop }
    });
  } catch (error) {
    throw error;
  }
};

export const getBarbershops = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedFilters = validateSchema(barbershopFiltersSchema, req.query);
    
    const { page, limit, type, location, rating } = validatedFilters;
    const safePage: number = page ?? 1;
    const safeLimit: number = limit ?? 10;
    const skip = (safePage - 1) * safeLimit;

    // Build where clause
    const where: any = {};
    
    if (type) {
      where.type = type;
    }
    
    if (rating) {
      where.rating = {
        gte: rating
      };
    }

    // Get barbershops with pagination
    const [barbershops, total] = await Promise.all([
      prisma.barberShop.findMany({
        where,
        skip,
        take: safeLimit,
        include: {
          admins: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            }
          },
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
              specialties: true,
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
          _count: {
            select: {
              barbers: true,
              services: true,
              bookings: true,
            }
          }
        },
        orderBy: {
          rating: 'desc'
        }
      }),
      prisma.barberShop.count({ where })
    ]);

    const totalPages = Math.ceil(total / safeLimit);

    res.json({
      success: true,
      message: 'Barbershops retrieved successfully',
      data: {
        barbershops,
        pagination: {
          page: safePage,
          limit: safeLimit,
          total,
          totalPages,
        }
      }
    });
  } catch (error) {
    throw error;
  }
};

export const getBarbershopById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const barbershop = await prisma.barberShop.findUnique({
      where: { id },
      include: {
        admins: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        },
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
            specialties: true,
            workingHours: true,
            services: {
              select: {
                id: true,
                name: true,
                price: true,
                durationMin: true,
                category: true,
              }
            },
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
        },
        _count: {
          select: {
            barbers: true,
            services: true,
            bookings: true,
          }
        }
      }
    });

    if (!barbershop) {
      throw new CustomError('Barbershop not found', 404);
    }

    res.json({
      success: true,
      message: 'Barbershop retrieved successfully',
      data: { barbershop }
    });
  } catch (error) {
    throw error;
  }
};

export const updateBarbershop = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const validatedData = validateSchema(updateBarbershopSchema, req.body);

    // Check if user is admin of this barbershop or superadmin
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    const barbershop = await prisma.barberShop.findUnique({
      where: { id },
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
      throw new CustomError('Insufficient permissions to update this barbershop', 403);
    }

    // Convert images array to JSON string if present
    const updateData: any = { ...validatedData };
    if (updateData.images && Array.isArray(updateData.images)) {
      updateData.images = JSON.stringify(updateData.images);
    }
    if (updateData.workingHours && typeof updateData.workingHours === 'object') {
      updateData.workingHours = JSON.stringify(updateData.workingHours);
    }

    const updatedBarbershop = await prisma.barberShop.update({
      where: { id },
      data: updateData,
      include: {
        admins: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        },
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
            specialties: true,
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
        _count: {
          select: {
            barbers: true,
            services: true,
            bookings: true,
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Barbershop updated successfully',
      data: { barbershop: updatedBarbershop }
    });
  } catch (error) {
    throw error;
  }
};

export const deleteBarbershop = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if user is admin of this barbershop or superadmin
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    const barbershop = await prisma.barberShop.findUnique({
      where: { id },
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
      throw new CustomError('Insufficient permissions to delete this barbershop', 403);
    }

    await prisma.barberShop.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Barbershop deleted successfully',
    });
  } catch (error) {
    throw error;
  }
};

export const getBarbershopAdmins = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const barbershop = await prisma.barberShop.findUnique({
      where: { id },
      include: {
        admins: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          }
        }
      }
    });

    if (!barbershop) {
      throw new CustomError('Barbershop not found', 404);
    }

    res.json({
      success: true,
      message: 'Barbershop admins retrieved successfully',
      data: { admins: barbershop.admins }
    });
  } catch (error) {
    throw error;
  }
}; 