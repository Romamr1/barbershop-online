import { Router } from 'express';
import { getAvailableSlots, blockSlot, unblockSlot } from '@/controllers/timeslotController.js';
import { requireAuth, requireRole } from '@/middlewares/auth.js';

const router = Router();

// Get available slots for a barber on a specific date
router.get('/available', getAvailableSlots);

// Block a slot (admin/superadmin only)
router.post('/block', requireAuth, requireRole(['admin', 'superadmin']), blockSlot);

// Unblock a slot (admin/superadmin only)
router.delete('/:id', requireAuth, requireRole(['admin', 'superadmin']), unblockSlot);

export default router; 