import express from 'express';
import { createReview, getAllPublicReviews, getFlightReviews, getUserReviews, checkReviewExists } from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// POST /api/reviews - Create a review (public endpoint for userName reviews)
router.post('/', createReview);

// GET /api/reviews - Get all public reviews sorted by latest first (public endpoint)
router.get('/', getAllPublicReviews);

// GET /api/reviews/user - Get logged-in user's reviews (protected)
router.get('/user', protect, getUserReviews);

// GET /api/reviews/check/:bookingId - Check if user reviewed a booking (protected)
router.get('/check/:bookingId', protect, checkReviewExists);

// GET /api/reviews/flight/:flightId - Get reviews for a flight (public)
router.get('/flight/:flightId', getFlightReviews);

export default router;
