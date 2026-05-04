import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PaymentSuccess.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to home after 5 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

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
            <span className="detail-value">BW{Date.now()}</span>
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

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/payment-history')}
          >
            View Payment History
          </button>
        </div>

        {/* Footer Message */}
        <p className="footer-message">
          Redirecting to home in 5 seconds...
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
