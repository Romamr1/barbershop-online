import { Router } from 'express';
import { requireAuth } from '@/middlewares/auth.js';
import { requireRole } from '@/middlewares/auth.js';
import {
  createBarber,
  getBarbers,
  getBarberById,
  updateBarber,
  deleteBarber,
} from '@/controllers/barberController.js';

const router = Router();

// Public routes (no authentication required)
router.get('/', getBarbers);
router.get('/:id', getBarberById);

// Protected routes (authentication required)
router.use(requireAuth);

// Admin/Barbershop owner routes
router.post('/', requireRole(['admin', 'superadmin']), createBarber);
router.put('/:id', requireRole(['admin', 'superadmin']), updateBarber);
router.delete('/:id', requireRole(['admin', 'superadmin']), deleteBarber);

export default router; 