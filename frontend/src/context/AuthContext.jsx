import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check localStorage for existing session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('bluewing_token');
    const savedUser = localStorage.getItem('bluewing_user');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        // Clear invalid data
        localStorage.removeItem('bluewing_token');
        localStorage.removeItem('bluewing_user');
      }
    }
    setLoading(false);
  }, []);

  /**
   * Register a new user
   * @param {Object} userData - Registration data
   * @returns {Promise} - Success or error
   */
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      if (response.success) {
        // Store token and user data
        const { token: newToken, user: newUser } = response.data;
        
        localStorage.setItem('bluewing_token', newToken);
        localStorage.setItem('bluewing_user', JSON.stringify(newUser));
        
        setToken(newToken);
        setUser(newUser);
        
        return { success: true, message: response.message };
      }
      
      return { success: false, message: response.message || 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.message || 'Registration failed. Please try again.',
        errors: error.errors || []
      };
    }
  };

  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} - Success or error
   */
  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.success) {
        // Store token and user data
        const { token: newToken, user: newUser } = response.data;
        
        localStorage.setItem('bluewing_token', newToken);
        localStorage.setItem('bluewing_user', JSON.stringify(newUser));
        
        setToken(newToken);
        setUser(newUser);
        
        return { success: true, user: newUser };
      }
      
      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.message || 'Invalid email or password' 
      };
    }
  };

  /**
   * Logout user - clear all session data
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bluewing_token');
    localStorage.removeItem('bluewing_user');
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = () => {
    return !!token && !!user;
  };

  /**
   * Check if user is admin
   */
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  /**
   * Get user profile from server
   */
  const refreshProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.success) {
        setUser(response.data.user);
        localStorage.setItem('bluewing_user', JSON.stringify(response.data.user));
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Profile refresh error:', error);
      return { success: false };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      loading,
      login, 
      logout, 
      register,
      isAuthenticated,
      isAdmin,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

