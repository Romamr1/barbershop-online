import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import { requireRole } from '../middlewares/auth';
import {
  createBarber,
  createBarberWithUser,
  getBarbers,
  getBarberById,
  updateBarber,
  deleteBarber,
  getAvailableUsersForBarber,
  assignUserAsBarber
} from '../controllers/barberController';

const router = Router();

// Public routes (no authentication required)
router.get('/', getBarbers);

// Protected routes (authentication required)
router.use(requireAuth);

// Admin/Barbershop owner routes - specific routes first
router.get('/available-users', requireRole(['admin', 'superadmin']), getAvailableUsersForBarber);
router.post('/with-user', requireRole(['admin', 'superadmin']), createBarberWithUser);
router.post('/assign-user', requireRole(['admin', 'superadmin']), assignUserAsBarber);

// Parameterized routes last
router.get('/:id', getBarberById);
router.post('/', requireRole(['admin', 'superadmin']), createBarber);
router.put('/:id', requireRole(['admin', 'superadmin']), updateBarber);
router.delete('/:id', requireRole(['admin', 'superadmin']), deleteBarber);

export default router; 