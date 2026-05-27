import express from 'express';
import {
	createBooking,
	getBookingById,
	getUserBookings,
	confirmBooking,
	cancelBooking,
	getFlightSeats,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/:bookingId', protect, getBookingById);
router.get('/user/:userId', protect, getUserBookings);
router.patch('/:bookingId/confirm', protect, confirmBooking);
router.patch('/:bookingId/cancel', protect, cancelBooking);
router.get('/flight/:flightId/seats', getFlightSeats);

export default router;
