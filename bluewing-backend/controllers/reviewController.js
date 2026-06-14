/**
 * Review Controller
 *
 * Purpose:
 * Handles public testimonials, booking-linked reviews, flight reviews, and review-existence checks.
 *
 * Workflow:
 * Review Routes -> Review Controller -> Review model -> reviews collection
 *
 * Used By:
 * routes/reviewRoutes.js and booking history flows that display review status.
 *
 * Dependencies:
 * models/Review.js stores feedback; models/Booking.js is imported for booking-review context.
 *
 * Request Lifecycle:
 * Public review routes run directly. Protected review routes run after JWT auth so req.userId
 * can scope review reads/checks to the logged-in user.
 */
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';

/**
 * Create a public or booking-linked review.
 *
 * Workflow:
 * Review Form -> Review Controller -> duplicate check -> Review create
 *
 * Inputs:
 * - userName, rating, comment, optional flightId, bookingId, title.
 * - req.userId when route was called with authentication.
 *
 * Returns:
 * Created Review document.
 *
 * Collections:
 * - reviews: checks duplicates and inserts feedback.
 *
 * Why:
 * Captures passenger feedback for homepage testimonials, flight pages, and booking history.
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
      // Read reviews to prevent duplicate feedback for the same booking/user combination.
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
    // Create a public Review document used by testimonial-style UI surfaces.
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
 * Return public reviews sorted newest first.
 *
 * Workflow:
 * Homepage/Reviews Page -> Review Controller -> reviews collection
 *
 * Inputs:
 * - None.
 *
 * Returns:
 * Review list and count.
 *
 * Collections:
 * - reviews: reads public review documents.
 *
 * Why:
 * Displays passenger feedback outside a single booking context.
 */
export const getAllPublicReviews = async (req, res) => {
  try {
    // Read public Review documents from reviews for testimonial displays.
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
 * Return reviews for a specific flight.
 *
 * Workflow:
 * Flight Details -> Review Controller -> reviews collection
 *
 * Inputs:
 * - req.params.flightId.
 *
 * Returns:
 * Reviews linked to the Flight document.
 *
 * Collections:
 * - reviews: reads flight-linked feedback and populates user display names.
 *
 * Why:
 * Gives passengers flight-specific social proof while browsing details.
 */
export const getFlightReviews = async (req, res) => {
  try {
    const { flightId } = req.params;
    // Read reviews linked to this Flight id for the flight-detail workflow.
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
 * Return reviews created by the authenticated user.
 *
 * Workflow:
 * User Profile/History -> protect middleware -> Review Controller -> reviews collection
 *
 * Inputs:
 * - req.userId from JWT.
 *
 * Returns:
 * User's Review documents populated with basic flight details.
 *
 * Collections:
 * - reviews: reads user-scoped feedback.
 *
 * Why:
 * Supports account history and avoids mixing another user's review data into the session.
 */
export const getUserReviews = async (req, res) => {
  try {
    const userId = req.userId;
    // Read Review documents belonging to the authenticated user.
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
 * Check whether the authenticated user already reviewed a booking.
 *
 * Workflow:
 * Booking/Ticket UI -> protect middleware -> Review Controller -> reviews collection
 *
 * Inputs:
 * - req.params.bookingId.
 * - req.userId from JWT.
 *
 * Returns:
 * hasReviewed boolean and optional Review document.
 *
 * Collections:
 * - reviews: reads at most one review for booking/user pair.
 *
 * Why:
 * Prevents duplicate review prompts and supports conditional UI states.
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
