import Review from '../models/Review.js';
import Booking from '../models/Booking.js';

/**
 * POST /api/reviews
 * Create a new review
 */
export const createReview = async (req, res) => {
  try {
    const { flightId, bookingId, rating, title, comment } = req.body;
    const userId = req.userId;

    if (!flightId || !bookingId || !rating || !title) {
      return res.status(400).json({
        success: false,
        message: 'flightId, bookingId, rating, and title are required',
      });
    }

    // Check if review already exists for this booking
    const existingReview = await Review.findOne({ bookingId, userId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this booking.',
      });
    }

    const review = await Review.create({
      userId,
      flightId,
      bookingId,
      rating,
      title,
      comment: comment || '',
    });

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this booking.',
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/reviews/flight/:flightId
 * Get all reviews for a flight
 */
export const getFlightReviews = async (req, res) => {
  try {
    const { flightId } = req.params;
    const reviews = await Review.find({ flightId })
      .populate('userId', 'firstName lastName')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/reviews/user
 * Get all reviews by the logged-in user
 */
export const getUserReviews = async (req, res) => {
  try {
    const userId = req.userId;
    const reviews = await Review.find({ userId })
      .populate('flightId', 'flightNumber from to')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/reviews/check/:bookingId
 * Check if user already reviewed a booking
 */
export const checkReviewExists = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.userId;
    const review = await Review.findOne({ bookingId, userId });

    return res.status(200).json({
      success: true,
      hasReviewed: !!review,
      data: review || null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
