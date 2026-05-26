import express from 'express';
import {
  getAllFlights,
  searchFlights,
  getFlightById,
  getFeaturedFlights,
} from '../controllers/flightController.js';

const router = express.Router();

/**
 * GET /api/flights
 * Fetch all flights with pagination
 * Query params: limit, skip
 */
router.get('/', getAllFlights);

/**
 * GET /api/flights/featured
 * Get featured flights with rating >= 4.0
 * Query param: limit (default 6)
 * IMPORTANT: This route MUST come before /:id route
 */
router.get('/featured', getFeaturedFlights);

/**
 * POST /api/flights/search
 * Search flights by route and date
 * Body: { from, to, departureDate, cabinClass (optional) }
 */
router.post('/search', searchFlights);

/**
 * GET /api/flights/:id
 * Get single flight by ID
 * URL param: id (flight _id)
 */
router.get('/:id', getFlightById);

export default router;
