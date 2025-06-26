import { Router } from 'express';
import * as bookingController from '@/controllers/bookingController.js';
import { requireAuth } from '@/middlewares/auth.js';
import { asyncHandler } from '@/middlewares/errorHandler.js';

const router = Router();

// All booking routes require authentication
router.use(requireAuth);

// Booking management
router.post('/', asyncHandler(bookingController.createBooking));
router.get('/', asyncHandler(bookingController.getBookings));
router.get('/:id', asyncHandler(bookingController.getBookingById));
router.put('/:id', asyncHandler(bookingController.updateBooking));
router.delete('/:id', asyncHandler(bookingController.cancelBooking));

// Calendar
router.get('/calendar', asyncHandler(bookingController.getCalendar));

export default router; 