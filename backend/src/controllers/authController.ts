import { Request, Response } from 'express';
import { prisma } from '@/prisma/client.js';
import { hashPassword, verifyPassword } from '@/utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@/utils/jwt.js';
import { validateSchema } from '@/utils/validation.js';
import { loginSchema, registerSchema } from '@/utils/validation.js';
import { config } from '@/config/index.js';
import { CustomError } from '@/middlewares/errorHandler.js';
import { Role } from '@/types/index.js';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = validateSchema(registerSchema, req.body);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      throw new CustomError('User with this email already exists', 409);
    }

    // Hash password
    const passwordHash = await hashPassword(validatedData.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        passwordHash,
        name: validatedData.name,
        phone: validatedData.phone,
        role: validatedData.role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        barberShopId: true,
        createdAt: true,
      }
    });

    // Generate tokens
    const userPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
      barberShopId: user.barberShopId,
    };

    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.cookie.secure,
      sameSite: config.cookie.sameSite,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userPayload,
        accessToken,
      }
    });
  } catch (error) {
    throw error;
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = validateSchema(loginSchema, req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (!user) {
      throw new CustomError('Invalid email or password', 401);
    }

    // Verify password
    const isPasswordValid = await verifyPassword(validatedData.password, user.passwordHash);
    
    if (!isPasswordValid) {
      throw new CustomError('Invalid email or password', 401);
    }

    // Generate tokens
    const userPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
      barberShopId: user.barberShopId,
    };

    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.cookie.secure,
      sameSite: config.cookie.sameSite,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userPayload,
        accessToken,
      }
    });
  } catch (error) {
    throw error;
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new CustomError('Refresh token not found', 401);
    }

    // Verify refresh token
    const userPayload = verifyRefreshToken(refreshToken);

    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: userPayload.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        barberShopId: true,
      }
    });

    if (!user) {
      throw new CustomError('User not found', 401);
    }

    // Generate new tokens
    const newUserPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
      barberShopId: user.barberShopId,
    };

    const newAccessToken = generateAccessToken(newUserPayload);
    const newRefreshToken = generateRefreshToken(newUserPayload);

    // Set new refresh token in HTTP-only cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: config.cookie.secure,
      sameSite: config.cookie.sameSite,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        user: newUserPayload,
        accessToken: newAccessToken,
      }
    });
  } catch (error) {
    throw error;
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: config.cookie.secure,
      sameSite: config.cookie.sameSite,
    });

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    throw error;
  }
};

export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new CustomError('User not authenticated', 401);
    }

    // Get fresh user data
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        barberShopId: true,
        phone: true,
        createdAt: true,
        barber: {
          select: {
            id: true,
            bio: true,
            avatar: true,
            specialties: true,
          }
        }
      }
    });

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    res.json({
      success: true,
      message: 'User profile retrieved successfully',
      data: { user }
    });
  } catch (error) {
    throw error;
  }
}; 