import Flight from '../models/Flight.js';

/**
 * GET /api/flights
 * Fetch all flights with pagination
 * Query params: limit (default 100), skip (default 0)
 */
const getAllFlights = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const skip = parseInt(req.query.skip) || 0;

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
 * POST /api/flights/search
 * Search flights by route and date
 * Body: { from, to, departureDate, cabinClass (optional) }
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
 * GET /api/flights/:id
 * Get single flight by ID
 * URL param: id (flight _id)
 */
const getFlightById = async (req, res) => {
  try {
    const { id } = req.params;

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
 * GET /api/flights/featured
 * Get featured flights with rating >= 4.0
 * Query params: limit (default 6)
 */
const getFeaturedFlights = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;

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

export {
  getAllFlights,
  searchFlights,
  getFlightById,
  getFeaturedFlights,
};
