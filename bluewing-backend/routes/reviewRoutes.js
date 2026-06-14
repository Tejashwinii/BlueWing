/**
 * Review Routes
 *
 * Purpose:
 * Maps public testimonial and booking-review endpoints to review controller functions.
 *
 * Workflow:
 * Review UI / Ticket History -> /api/reviews route -> Review Controller -> Review collection
 *
 * Used By:
 * server.js mounts this router at /api/reviews.
 *
 * Dependencies:
 * controllers/reviewController.js creates and reads Review documents.
 * middleware/auth.js protects user-specific review lookups.
 *
 * Request Lifecycle:
 * Public review listing/creation can run without JWT. User-specific review checks run
 * protect first so the controller can query by req.userId.
 */
import express from 'express';
import { createReview, getAllPublicReviews, getFlightReviews, getUserReviews, checkReviewExists } from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Create Review document from public or booking-review payload.
// POST /api/reviews - Create a review (public endpoint for userName reviews)
router.post('/', createReview);

// Read approved/public Review documents for homepage/testimonial displays.
// GET /api/reviews - Get all public reviews sorted by latest first (public endpoint)
router.get('/', getAllPublicReviews);

// Validate JWT -> read Review documents owned by req.userId.
// GET /api/reviews/user - Get logged-in user's reviews (protected)
router.get('/user', protect, getUserReviews);

// Validate JWT -> check whether this booking already has a Review from this user.
// GET /api/reviews/check/:bookingId - Check if user reviewed a booking (protected)
router.get('/check/:bookingId', protect, checkReviewExists);

// Read Review documents linked to a Flight for flight-detail context.
// GET /api/reviews/flight/:flightId - Get reviews for a flight (public)
router.get('/flight/:flightId', getFlightReviews);

export default router;
