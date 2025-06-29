import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import { requireRole } from '../middlewares/auth';
import {
  createBarber,
  getBarbers,
  getBarberById,
  updateBarber,
  deleteBarber
} from '../controllers/barberController';

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