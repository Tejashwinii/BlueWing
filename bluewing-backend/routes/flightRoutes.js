/**
 * Flight Routes
 *
 * Purpose:
 * Maps public flight discovery endpoints and protected admin flight management endpoints.
 *
 * Workflow:
 * Search/Home/Admin UI -> /api/flights route -> Flight Controller -> Flight collection
 *
 * Used By:
 * server.js mounts this router at /api/flights.
 *
 * Dependencies:
 * controllers/flightController.js performs Flight collection reads/writes.
 * middleware/auth.js validates JWTs and checks admin role for create/delete operations.
 *
 * Request Lifecycle:
 * Public read routes go directly to controller functions. Admin write routes first run
 * protect, then adminOnly, then mutate the Flight collection.
 */
import express from 'express';
import {
  getAllFlights,
  searchFlights,
  getFlightById,
  getFeaturedFlights,
  createFlight,
  deleteFlight,
} from '../controllers/flightController.js';
import { protect, adminOnly } from '../middleware/auth.js';

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
 * POST /api/flights
 * Create a new flight (Admin only)
 */
router.post('/', protect, adminOnly, createFlight);

/**
 * DELETE /api/flights/:id
 * Delete a flight by ID (Admin only)
 */
router.delete('/:id', protect, adminOnly, deleteFlight);

/**
 * GET /api/flights/:id
 * Get single flight by ID
 * URL param: id (flight _id)
 */
router.get('/:id', getFlightById);

export default router;
