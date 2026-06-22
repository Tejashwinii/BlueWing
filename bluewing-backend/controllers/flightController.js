/**
 * Flight Controller
 *
 * Purpose:
 * Handles flight listing, search, details, featured flights, and admin flight creation/deletion.
 *
 * Workflow:
 * Flight Routes -> Flight Controller -> Flight model -> flights collection
 *
 * Used By:
 * routes/flightRoutes.js.
 *
 * Dependencies:
 * models/Flight.js contains the schedule, pricing, amenity, rating, and embedded-seat schema.
 *
 * Request Lifecycle:
 * Triggered by public flight-search/detail requests or admin flight-management requests.
 * Admin-only endpoints are protected before reaching this controller.
 */
import Flight from '../models/Flight.js';

// Helper to generate default embedded seats (same layout used by seeders)
const generateSeats = () => {
  const seats = [];

  // First Class: rows a, b, c with 3 seats each (1,2,3)
  const firstClassRows = ['a', 'b', 'c'];
  for (const row of firstClassRows) {
    for (let col = 1; col <= 3; col++) {
      seats.push({ seatId: `${col}${row}`, row, column: col, cabin: 'firstClass', isBooked: false, bookedBy: null, bookingId: null });
    }
  }

  // Business: rows d-i with 5 seats each
  const businessRows = ['d','e','f','g','h','i'];
  for (const row of businessRows) {
    for (let col = 1; col <= 5; col++) {
      seats.push({ seatId: `${col}${row}`, row, column: col, cabin: 'business', isBooked: false, bookedBy: null, bookingId: null });
    }
  }

  // Economy: rows j-z with 9 seats each
  const economyRows = ['j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
  for (const row of economyRows) {
    for (let col = 1; col <= 9; col++) {
      seats.push({ seatId: `${col}${row}`, row, column: col, cabin: 'economy', isBooked: false, bookedBy: null, bookingId: null });
    }
  }

  return seats;
};

/**
 * Fetch all flights with pagination.
 *
 * Workflow:
 * Home/Admin Flight List -> API -> Flight Controller -> flights collection
 *
 * Inputs:
 * - req.query.limit: max number of flights to return.
 * - req.query.skip: number of flights to skip for pagination.
 *
 * Returns:
 * JSON list of Flight documents sorted by departure date.
 *
 * Collections:
 * - flights: read all matching schedule documents for browsing/admin views.
 *
 * Why:
 * Gives the frontend a paginated schedule feed without changing seat or booking state.
 */
const getAllFlights = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const skip = parseInt(req.query.skip) || 0;

    // Read Flight documents from the flights collection for schedule browsing.
    // These records drive the flight-selection and admin schedule workflows.
    const flights = await Flight.find()
      .limit(limit)
      .skip(skip)
      .sort({ departureDate: 1 });

    return res.status(200).json({
      success: true,
      count: flights.length,
      data: flights,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Search flights by origin, destination, and departure date.
 *
 * Workflow:
 * Home Page Search Form -> /api/flights/search -> Flight Controller -> flights collection
 *
 * Inputs:
 * - from: origin city.
 * - to: destination city.
 * - departureDate: date selected by passenger.
 * - cabinClass: accepted by the API payload but not used in the current query.
 *
 * Returns:
 * List of matching Flight documents sorted by departure time.
 *
 * Collections:
 * - flights: reads scheduled flights and embedded seat inventory for matching routes.
 *
 * Why:
 * Powers the passenger's first booking step: discovering available flights for a route/date.
 */
const searchFlights = async (req, res) => {
  try {
    const { from, to, departureDate, cabinClass } = req.body;

    // Validate required fields
    if (!from || !to || !departureDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: from, to, departureDate',
      });
    }

    // Parse the departure date and create date range for comparison
    const searchDate = new Date(departureDate);
    const nextDate = new Date(searchDate);
    nextDate.setDate(nextDate.getDate() + 1);

    // Build query object
    const query = {
      from: from,
      to: to,
      departureDate: {
        $gte: searchDate,
        $lt: nextDate,
      },
    };

    // Execute query
    // Query the flights collection for the exact route and one-day date window.
    // The resulting Flight documents include prices and seats needed by later booking steps.
    const flights = await Flight.find(query).sort({ departureTime: 1 });

    return res.status(200).json({
      success: true,
      count: flights.length,
      data: flights,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get one flight by MongoDB id.
 *
 * Workflow:
 * Flight Selection -> /api/flights/:id -> Flight Controller -> flights collection
 *
 * Inputs:
 * - req.params.id: Flight _id.
 *
 * Returns:
 * Single Flight document or 404 when missing.
 *
 * Collections:
 * - flights: reads the selected schedule, prices, amenities, and embedded seats.
 *
 * Why:
 * Lets the frontend retrieve authoritative flight details before seat selection/booking.
 */
const getFlightById = async (req, res) => {
  try {
    const { id } = req.params;

    // Read the selected Flight document from the flights collection.
    // This document is the source for route, time, fare, and seat-selection context.
    const flight = await Flight.findById(id);

    if (!flight) {
      return res.status(404).json({
        success: false,
        message: 'Flight not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: flight,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get featured flights for promotional/homepage displays.
 *
 * Workflow:
 * Homepage Featured Section -> /api/flights/featured -> Flight Controller -> flights collection
 *
 * Inputs:
 * - req.query.limit: maximum featured flights to return.
 *
 * Returns:
 * Highly rated Flight documents sorted by rating.
 *
 * Collections:
 * - flights: reads schedule documents with rating >= 4.0.
 *
 * Why:
 * Supports discovery content without requiring a user search.
 */
const getFeaturedFlights = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;

    // Read high-rated Flight documents from the flights collection for homepage discovery.
    const flights = await Flight.find({ rating: { $gte: 4.0 } })
      .limit(limit)
      .sort({ rating: -1 });

    return res.status(200).json({
      success: true,
      count: flights.length,
      data: flights,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Create a new flight schedule.
 *
 * Workflow:
 * Admin Dashboard -> protected route -> Flight Controller -> flights collection
 *
 * Inputs:
 * - req.body: Flight fields matching the Flight schema.
 *
 * Returns:
 * Created Flight document.
 *
 * Collections:
 * - flights: inserts a new schedule and optional embedded seat inventory.
 *
 * Why:
 * Enables admin users to add flights that passengers can later search and book.
 */
const createFlight = async (req, res) => {
  try {
    // Ensure embedded seats exist: if admin didn't provide seats, generate default layout
    const flightPayload = { ...req.body };
    if (!flightPayload.seats || !Array.isArray(flightPayload.seats) || flightPayload.seats.length === 0) {
      flightPayload.seats = generateSeats();
    }

    // Create a Flight document in the flights collection.
    // This makes the schedule available to search, seat selection, and booking workflows.
    const flight = await Flight.create(flightPayload);
    return res.status(201).json({
      success: true,
      message: 'Flight created successfully',
      data: flight,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete a flight schedule by id.
 *
 * Workflow:
 * Admin Dashboard -> protected route -> Flight Controller -> flights collection
 *
 * Inputs:
 * - req.params.id: Flight _id to remove.
 *
 * Returns:
 * Success message or 404.
 *
 * Collections:
 * - flights: deletes the schedule document.
 *
 * Why:
 * Allows admin cleanup of schedules that should no longer be offered.
 * TODO: Before production use, consider checking for active bookings before deleting a flight.
 */
const deleteFlight = async (req, res) => {
  try {
    const { id } = req.params;
    // Delete the Flight document from the flights collection.
    // This removes it from future search/detail workflows.
    const flight = await Flight.findByIdAndDelete(id);

    if (!flight) {
      return res.status(404).json({
        success: false,
        message: 'Flight not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Flight deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  getAllFlights,
  searchFlights,
  getFlightById,
  getFeaturedFlights,
  createFlight,
  deleteFlight,
};
