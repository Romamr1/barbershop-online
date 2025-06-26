import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/utils/jwt.js';
import { UserPayload } from '@/types/index.js';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access token required',
        error: 'No authorization header'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const userPayload = verifyAccessToken(token);
      req.user = userPayload;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired access token',
        error: 'Token verification failed'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: 'Internal server error'
    });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'User not authenticated'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        error: `Access denied. Required roles: ${allowedRoles.join(', ')}`
      });
      return;
    }

    next();
  };
};

export const requireSuperAdmin = requireRole(['superadmin']);
export const requireAdmin = requireRole(['admin', 'superadmin']);
export const requireBarber = requireRole(['barber', 'admin', 'superadmin']);
export const requireClient = requireRole(['client', 'barber', 'admin', 'superadmin']);

// Optional auth middleware - doesn't fail if no token
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const userPayload = verifyAccessToken(token);
        req.user = userPayload;
      } catch (error) {
        // Token is invalid, but we don't fail the request
        console.warn('Invalid token in optional auth:', error);
      }
    }
    
    next();
  } catch (error) {
    next();
  }
}; 