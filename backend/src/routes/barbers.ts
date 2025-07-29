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
router.get('/:id', getBarberById);

// Protected routes (authentication required)
router.use(requireAuth);

// Admin/Barbershop owner routes
router.get('/available-users', requireRole(['admin', 'superadmin']), getAvailableUsersForBarber);
router.post('/', requireRole(['admin', 'superadmin']), createBarber);
router.post('/with-user', requireRole(['admin', 'superadmin']), createBarberWithUser);
router.post('/assign-user', requireRole(['admin', 'superadmin']), assignUserAsBarber);
router.put('/:id', requireRole(['admin', 'superadmin']), updateBarber);
router.delete('/:id', requireRole(['admin', 'superadmin']), deleteBarber);

export default router; 