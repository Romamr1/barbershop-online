import { Router } from 'express';
import * as barbershopController from '../controllers/barbershopController';
import { requireAuth, requireAdmin, requireSuperAdmin } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/errorHandler';

const router = Router();

// Public routes
router.get('/', asyncHandler(barbershopController.getBarbershops));
router.get('/:id', asyncHandler(barbershopController.getBarbershopById));

// Protected routes
router.post('/', requireAdmin, asyncHandler(barbershopController.createBarbershop));
router.put('/:id', requireAuth, asyncHandler(barbershopController.updateBarbershop));
router.delete('/:id', requireAuth, asyncHandler(barbershopController.deleteBarbershop));
router.get('/:id/admins', requireAuth, asyncHandler(barbershopController.getBarbershopAdmins));

export default router; 