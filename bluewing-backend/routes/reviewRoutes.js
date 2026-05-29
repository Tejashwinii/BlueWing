import express from 'express';
import { createReview, getFlightReviews, getUserReviews, checkReviewExists } from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// POST /api/reviews - Create a review (protected)
router.post('/', protect, createReview);

// GET /api/reviews/user - Get logged-in user's reviews (protected)
router.get('/user', protect, getUserReviews);

// GET /api/reviews/check/:bookingId - Check if user reviewed a booking (protected)
router.get('/check/:bookingId', protect, checkReviewExists);

// GET /api/reviews/flight/:flightId - Get reviews for a flight (public)
router.get('/flight/:flightId', getFlightReviews);

export default router;
