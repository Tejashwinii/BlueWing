import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/PaymentSuccess.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state || {};

  useEffect(() => {
    // Auto-redirect to ticket summary after 4 seconds
    const timer = setTimeout(() => {
      navigate('/ticket-summary', {
        state: bookingData,
      });
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigate, bookingData]);

  return (
    <div className="payment-success-page">
      <div className="success-container">
        {/* Tick Mark Icon */}
        <div className="success-icon-wrapper">
          <svg
            className="success-icon-animated"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        {/* Success Message */}
        <h1 className="success-title">Payment Successful</h1>
        <p className="success-subtitle">Your booking has been confirmed</p>

        {/* Status Details */}
        <div className="status-details">
          <div className="detail-item">
            <span className="detail-label">Transaction ID</span>
            <span className="detail-value">BW{bookingData.transactionId || Date.now()}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Status</span>
            <span className="detail-value success-status">Completed</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Date & Time</span>
            <span className="detail-value">{new Date().toLocaleString()}</span>
          </div>
        </div>

        {/* Booking Summary */}
        {bookingData.journey && (
          <div className="booking-summary">
            <h3>Booking Summary</h3>
            <div className="summary-item">
              <span className="summary-label">Route:</span>
              <span className="summary-value">{bookingData.journey?.departure} → {bookingData.journey?.arrival}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Date:</span>
              <span className="summary-value">{bookingData.journey?.date}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Amount:</span>
              <span className="summary-value">{bookingData.selectedFare?.price}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/ticket-summary', { state: bookingData })}
          >
            View Tickets
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>

        {/* Footer Message */}
        <p className="footer-message">
          Redirecting to tickets in 4 seconds...
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
