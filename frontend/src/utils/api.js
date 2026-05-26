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
  },
  timeout: 10000, // 10 second timeout
});

/**
 * Request Interceptor
 * Adds JWT token to requests if available
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bluewing_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
// FLIGHT API (for future use)
// =====================

export const flightAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get('/flights', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch flights.' };
    }
  },

  search: async (from, to, date) => {
    try {
      const response = await apiClient.get('/flights/search', {
        params: { from, to, date }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to search flights.' };
    }
  },

  getById: async (id) => {
    try {
      const response = await apiClient.get(`/flights/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch flight details.' };
    }
  },
};

// =====================
// BOOKING API (for future use)
// =====================

export const bookingAPI = {
  create: async (bookingData) => {
    try {
      const response = await apiClient.post('/bookings', bookingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create booking.' };
    }
  },

  getMyBookings: async () => {
    try {
      const response = await apiClient.get('/bookings/my-bookings');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch bookings.' };
    }
  },

  getById: async (id) => {
    try {
      const response = await apiClient.get(`/bookings/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch booking details.' };
    }
  },

  cancel: async (id) => {
    try {
      const response = await apiClient.put(`/bookings/${id}/cancel`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to cancel booking.' };
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

// Export the axios instance for custom requests
export default apiClient;
