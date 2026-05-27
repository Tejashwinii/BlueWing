import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { bookingAPI } from '../utils/api';
import '../styles/PaymentSuccess.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state || {};

  useEffect(() => {
    let isMounted = true;

    const createBackendBooking = async () => {
      try {
        const passengersRaw = bookingData?.passengers || {};
        const passengers = [];

        if (Array.isArray(passengersRaw.adults)) {
          passengersRaw.adults.forEach((p) => {
            passengers.push({
              firstName: p.firstName,
              lastName: p.lastName,
              gender: p.gender,
              age: p.age,
            });
          });
        }

        if (Array.isArray(passengersRaw.children)) {
          passengersRaw.children.forEach((p) => {
            passengers.push({
              firstName: p.firstName,
              lastName: p.lastName,
              gender: p.gender,
              age: p.age,
            });
          });
        }

        const fareTitle = bookingData?.selectedFare?.fareTypeTitle || bookingData?.selectedFare?.title || '';
        let fareType = 'Saver';
        if (/flexi/i.test(fareTitle)) fareType = 'Flexi Plus';
        if (/upfront/i.test(fareTitle)) fareType = 'BlueWing Upfront';

        const payload = {
          flightId: bookingData?.selectedFare?.flightId || bookingData?.journey?.flightId,
          fareType,
          passengers,
          selectedSeats: bookingData?.selectedSeats || bookingData?.seatSummary?.seats || [],
          contactDetails: {
            phone: bookingData?.contactDetails?.mobileNumber,
            email: bookingData?.contactDetails?.email,
            country: bookingData?.contactDetails?.country || 'India',
            contactPassengerIndex: 0,
          },
        };

        const response = await bookingAPI.create(payload);
        if (isMounted && response?.data?.booking?._id) {
          bookingData.bookingId = response.data.booking._id;
        }
      } catch (error) {
        console.warn('Booking creation failed:', error?.message || error);
      } finally {
        const timer = setTimeout(() => {
          if (isMounted) {
            navigate('/ticket-summary', { state: bookingData });
          }
        }, 2000);

        return () => clearTimeout(timer);
      }
    };

    createBackendBooking();

    return () => {
      isMounted = false;
    };
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
