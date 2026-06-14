/**
 * Booking Routes
 *
 * Purpose:
 * Maps booking, ticket, cancellation, and seat-map endpoints to booking controller functions.
 *
 * Workflow:
 * Passenger/Seat/Payment UI -> /api/bookings route -> Booking Controller -> Flight/Booking/Payment collections
 *
 * Used By:
 * server.js mounts this router at /api/bookings.
 *
 * Dependencies:
 * controllers/bookingController.js coordinates booking persistence, seat locking, and payment records.
 * middleware/auth.js protects passenger-specific booking operations with JWT authentication.
 *
 * Request Lifecycle:
 * Protected routes run JWT verification first, then the controller verifies ownership
 * before reading or mutating booking data. The public seat-map endpoint reads Flight seats.
 */
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

// Validate JWT -> lock selected Flight seats -> create pending Booking and Payment documents.
router.post('/', protect, createBooking);
// Validate JWT -> load Booking by id -> enforce owner -> include review status.
router.get('/:bookingId', protect, getBookingById);
// Validate JWT -> enforce route user matches token user -> list user's Booking documents.
router.get('/user/:userId', protect, getUserBookings);
// Validate JWT -> update Payment success -> confirm Booking -> assign ticket numbers.
router.patch('/:bookingId/confirm', protect, confirmBooking);
// Validate JWT -> release Flight seats -> refund Payment -> cancel Booking.
router.patch('/:bookingId/cancel', protect, cancelBooking);
// Return Flight embedded seats and availability statistics for the seat-selection UI.
router.get('/flight/:flightId/seats', getFlightSeats);

export default router;
