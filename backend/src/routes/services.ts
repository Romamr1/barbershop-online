import { Router } from 'express';
import { requireAuth } from '@/middlewares/auth.js';
import { requireRole } from '@/middlewares/auth.js';
import {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
} from '@/controllers/serviceController.js';

const router = Router();

// Public routes (no authentication required)
router.get('/', getServices);
router.get('/:id', getServiceById);

// Protected routes (authentication required)
router.use(requireAuth);

// Admin/Barbershop owner routes
router.post('/', requireRole(['admin', 'superadmin']), createService);
router.put('/:id', requireRole(['admin', 'superadmin']), updateService);
router.delete('/:id', requireRole(['admin', 'superadmin']), deleteService);

export default router; 