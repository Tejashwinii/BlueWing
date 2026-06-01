import Review from '../models/Review.js';
import Booking from '../models/Booking.js';

/**
 * POST /api/reviews
 * Create a new review (supports public reviews with userName or booking reviews with bookingId)
 */
export const createReview = async (req, res) => {
  try {
    const { userName, rating, comment, flightId, bookingId, title } = req.body;
    const userId = req.userId;

    // Validate rating and comment (required for all reviews)
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment is required',
      });
    }

    if (!userName || !userName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'User name is required',
      });
    }

    // Determine review type based on provided fields
    // Priority: booking review (with bookingId) > public review (with just userName)
    
    // Case 1: Booking review (bookingId provided - from ticket/history page)
    if (bookingId) {
      // Check if review already exists for this user + booking combination
      // Check both userId (if provided) and userName for backward compatibility
      const existingReview = await Review.findOne({ 
        bookingId,
        $or: [
          { userId: userId },
          { userName: userName.trim() }
        ]
      });
      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'You have already submitted a review for this booking.',
        });
      }

      const review = await Review.create({
        userId: userId,  // Add userId for better tracking
        userName: userName.trim(),
        flightId: flightId || null, // flightId is optional for booking reviews
        bookingId,
        rating,
        comment: comment.trim(),
        title: title || '',
        isApproved: true,
        createdAt: new Date(),
      });

      return res.status(201).json({
        success: true,
        message: 'Review submitted successfully',
        data: review,
      });
    }

    // Case 2: Public review (only userName provided, no bookingId)
    const review = await Review.create({
      userName: userName.trim(),
      rating,
      comment: comment.trim(),
      isApproved: true,
      createdAt: new Date(),
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
 * GET /api/reviews
 * Get all public reviews sorted by latest first
 */
export const getAllPublicReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ userName: { $exists: true, $ne: null } })
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
 * Check if the logged-in user already reviewed a booking
 * Protected endpoint
 */
export const checkReviewExists = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.userId;  // Get userId from authenticated request
    
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'bookingId is required',
      });
    }

    const review = await Review.findOne({ 
      bookingId,
      userId: userId
    });

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
