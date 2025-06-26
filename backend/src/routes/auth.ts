import { Router } from 'express';
import * as authController from '@/controllers/authController.js';
import { requireAuth } from '@/middlewares/auth.js';
import { asyncHandler } from '@/middlewares/errorHandler.js';

const router = Router();

// Public routes
router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));
router.post('/refresh', asyncHandler(authController.refresh));
router.post('/logout', asyncHandler(authController.logout));

// Protected routes
router.get('/me', requireAuth, asyncHandler(authController.me));

export default router; 