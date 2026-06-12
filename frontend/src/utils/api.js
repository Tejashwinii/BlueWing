import axios from 'axios';

/**
 * API Client for BlueWing Airlines Backend
 * Handles all HTTP requests to the backend server
 */

// Base URL for the backend API
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
  timeout: 10000, // 10 second timeout
});

/**
 * Request Interceptor
 * Adds JWT token to requests if available
 * Adds cache-busting parameter to GET requests
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bluewing_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add cache-busting timestamp for GET requests
    if (config.method === 'get') {
      config.params = config.params || {};
      config.params._ = new Date().getTime();
    }
    
    // Ensure cache control headers persist
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    config.headers['Pragma'] = 'no-cache';
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles common error responses
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('bluewing_token');
      localStorage.removeItem('bluewing_user');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// =====================
// AUTH API
// =====================

export const authAPI = {
  /**
   * Register a new user
   * @param {Object} userData - { firstName, lastName, email, password, phone }
   * @returns {Promise} - Response with user data and token
   */
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed. Please try again.' };
    }
  },

  /**
   * Login user
   * @param {Object} credentials - { email, password }
   * @returns {Promise} - Response with user data and token
   */
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed. Please try again.' };
    }
  },

  /**
   * Get current user profile
   * @returns {Promise} - Response with user data
   */
  getProfile: async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch profile.' };
    }
  },

  /**
   * Update user profile
   * @param {Object} userData - { firstName, lastName, phone }
   * @returns {Promise} - Response with updated user data
   */
  updateProfile: async (userData) => {
    try {
      const response = await apiClient.put('/auth/profile', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update profile.' };
    }
  },
};

// =====================
// FLIGHT API
// =====================

export const flightAPI = {
  /**
   * Search flights by route and date
   * @param {Object} searchParams - { from, to, departureDate, cabinClass (optional) }
   * @returns {Promise} - Response with filtered flights
   */
  searchFlights: async (searchParams) => {
    try {
      const response = await apiClient.post('/flights/search', searchParams);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to search flights.' };
    }
  },

  /**
   * Get all flights with pagination
   * @param {number} limit - Number of flights to return (default 100)
   * @param {number} skip - Number of flights to skip (default 0)
   * @returns {Promise} - Response with flights array
   */
  getAllFlights: async (limit = 100, skip = 0) => {
    try {
      const response = await apiClient.get(`/flights?limit=${limit}&skip=${skip}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch flights.' };
    }
  },

  /**
   * Get flight by ID
   * @param {string} flightId - Flight _id
   * @returns {Promise} - Response with single flight object
   */
  getFlightById: async (flightId) => {
    try {
      const response = await apiClient.get(`/flights/${flightId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch flight details.' };
    }
  },

  /**
   * Get featured flights (rating >= 4.0)
   * @param {number} limit - Number of featured flights (default 6)
   * @returns {Promise} - Response with featured flights array
   */
  getFeaturedFlights: async (limit = 6) => {
    try {
      const response = await apiClient.get(`/flights/featured?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch featured flights.' };
    }
  },

  /**
   * Create a new flight (Admin only)
   * @param {Object} flightData - Flight object matching backend schema
   * @returns {Promise} - Response with created flight
   */
  addFlight: async (flightData) => {
    try {
      const response = await apiClient.post('/flights', flightData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to add flight.' };
    }
  },

  /**
   * Delete a flight (Admin only)
   * @param {string} flightId - Flight _id
   * @returns {Promise} - Response with success message
   */
  deleteFlight: async (flightId) => {
    try {
      const response = await apiClient.delete(`/flights/${flightId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete flight.' };
    }
  },
};

// =====================
// BOOKING API
// =====================

export const bookingAPI = {
  /**
   * Create a new booking
   * @param {Object} bookingData - { flightId, fareType, passengers, selectedSeats, contactDetails }
   * @returns {Promise} - Response with booking data and payment details
   */
  create: async (bookingData) => {
    try {
      const response = await apiClient.post('/bookings', bookingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create booking.' };
    }
  },

  /**
   * Get booking by ID
   * @param {string} bookingId - The booking ID
   * @returns {Promise} - Response with booking details
   */
  getById: async (bookingId) => {
    try {
      const response = await apiClient.get(`/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch booking details.' };
    }
  },

  /**
   * Get all bookings for a user
   * @param {string} userId - The user ID
   * @param {Object} params - { status, limit, skip }
   * @returns {Promise} - Response with user's bookings
   */
  getUserBookings: async (userId, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiClient.get(`/bookings/user/${userId}${queryString ? '?' + queryString : ''}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch bookings.' };
    }
  },

  /**
   * Confirm booking after payment
   * @param {string} bookingId - The booking ID
   * @param {Object} paymentInfo - { paymentGatewayId, transactionId }
   * @returns {Promise} - Response with confirmed booking
   */
  confirmBooking: async (bookingId, paymentInfo = {}) => {
    try {
      const response = await apiClient.patch(`/bookings/${bookingId}/confirm`, paymentInfo);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to confirm booking.' };
    }
  },

  /**
   * Cancel a booking
   * @param {string} bookingId - The booking ID
   * @returns {Promise} - Response with cancelled booking
   */
  cancel: async (bookingId) => {
    try {
      const response = await apiClient.patch(`/bookings/${bookingId}/cancel`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to cancel booking.' };
    }
  },

  /**
   * Get flight seats with availability
   * @param {string} flightId - The flight ID
   * @returns {Promise} - Response with seats and statistics
   */
  getFlightSeats: async (flightId) => {
    try {
      const response = await apiClient.get(`/bookings/flight/${flightId}/seats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch flight seats.' };
    }
  },
};

// =====================
// OTP API
// =====================

export const otpAPI = {
  sendCancellationOtp: async (bookingId, email) => {
    try {
      const response = await apiClient.post('/send-otp', { bookingId, email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to send OTP.' };
    }
  },
  verifyCancellationOtp: async (bookingId, otp) => {
    try {
      const response = await apiClient.post('/verify-otp', { bookingId, otp });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to verify OTP.' };
    }
  },
};

// =====================
// PAYMENT API (for future use)
// =====================

export const paymentAPI = {
  createOrder: async (bookingId, amount) => {
    try {
      const response = await apiClient.post('/payments/create-order', { bookingId, amount });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create payment order.' };
    }
  },

  verifyPayment: async (paymentData) => {
    try {
      const response = await apiClient.post('/payments/verify', paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Payment verification failed.' };
    }
  },

  getHistory: async () => {
    try {
      const response = await apiClient.get('/payments/history');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch payment history.' };
    }
  },
};

// =====================
// REVIEW API
// =====================

export const reviewAPI = {
  create: async (reviewData) => {
    try {
      const response = await apiClient.post('/reviews', reviewData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to submit review.' };
    }
  },

  getFlightReviews: async (flightId) => {
    try {
      const response = await apiClient.get(`/reviews/flight/${flightId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch reviews.' };
    }
  },

  checkReviewExists: async (bookingId) => {
    try {
      const response = await apiClient.get(`/reviews/check/${bookingId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to check review status.' };
    }
  },
};

// Export the axios instance for custom requests
export default apiClient;
