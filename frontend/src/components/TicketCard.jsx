import React, { useEffect, useMemo, useRef, useState } from 'react';
import html2pdf from 'html2pdf.js/dist/html2pdf.min.js';
import { otpAPI, reviewAPI } from '../utils/api';
import OtpCancelModal from './OtpCancelModal';
import '../styles/TicketCard.css';

const TicketCard = ({ passenger, journey, selectedFare, contactDetails = {}, bookingReference, bookingId, onCancelled, hasReviewed: initialHasReviewed = false, bookingStatus, hideCancel = false, hideDownload = false }) => {
  const ticketRef = useRef(null);
  const isStatusCancelled = String(bookingStatus).toLowerCase() === 'cancelled';
  const [isCancelled, setIsCancelled] = useState(isStatusCancelled);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(initialHasReviewed);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [userName, setUserName] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [cancelRequestId, setCancelRequestId] = useState(null);

  const formatCabin = (cabin) => {
    if (!cabin) return "ECONOMY";
    if (cabin === "firstClass" || cabin === "first-class") return "FIRST CLASS";
    if (cabin === "business") return "BUSINESS";
    return "ECONOMY";
  };

  useEffect(() => {
    setIsCancelled(String(bookingStatus).toLowerCase() === 'cancelled');
  }, [bookingStatus]);

  const getRandomGate = () => {
    const gates = Array.from({ length: 50 }, (_, i) => i + 1);
    return gates[Math.floor(Math.random() * gates.length)];
  };

  // Use passenger's actual seat number or generate a placeholder
  const seatNumber = useMemo(() => {
    return passenger?.seatNumber || 'N/A';
  }, [passenger?.seatNumber]);
  
  const gateNumber = useMemo(() => getRandomGate(), []);

  // Format date as DD-MM-YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateStr;
    }
  };

  const getMaskedMobile = () => {
    const mobile = (contactDetails?.mobileNumber || '').toString();
    if (!mobile || mobile.length < 4) {
      return 'registered mobile number';
    }
    const lastFourDigits = mobile.slice(-4);
    return `******${lastFourDigits}`;
  };

  // Helper: build a Date object from departure date + time string
  const getFlightDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;
      // Parse time like "06:30" or "06:30 AM"
      let hours = 0, minutes = 0;
      const timeParts = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (timeParts) {
        hours = parseInt(timeParts[1]);
        minutes = parseInt(timeParts[2]);
        if (timeParts[3]) {
          if (timeParts[3].toUpperCase() === 'PM' && hours !== 12) hours += 12;
          if (timeParts[3].toUpperCase() === 'AM' && hours === 12) hours = 0;
        }
      }
      date.setHours(hours, minutes, 0, 0);
      return date;
    } catch {
      return null;
    }
  };

  const departureDateTime = useMemo(() => {
    return getFlightDateTime(
      journey?.departureDate || journey?.date,
      selectedFare?.departureTime || journey?.departureTime
    );
  }, [journey, selectedFare]);

  const arrivalDateTime = useMemo(() => {
    return getFlightDateTime(
      journey?.departureDate || journey?.date,
      selectedFare?.arrivalTime || journey?.arrivalTime
    );
  }, [journey, selectedFare]);

  // Cancel button visible only if >= 3 hours before departure
  const canCancel = useMemo(() => {
    if (!departureDateTime) return true; // fallback: show button
    const now = new Date();
    const threeHoursBefore = new Date(departureDateTime.getTime() - 3 * 60 * 60 * 1000);
    return now <= threeHoursBefore;
  }, [departureDateTime]);

  // Review button visible only after arrival time has passed
  const canReview = useMemo(() => {
    if (!arrivalDateTime) return false;
    return new Date() > arrivalDateTime;
  }, [arrivalDateTime]);

  const handleSubmitReview = async () => {
    if (!userName.trim()) {
      alert('Please enter your name.');
      return;
    }
    if (!reviewData.comment.trim()) {
      alert('Please enter a comment.');
      return;
    }
    
    setIsSubmittingReview(true);
    try {
      const payload = {
        userName: userName.trim(),
        rating: reviewData.rating,
        comment: reviewData.comment.trim(),
        bookingId: bookingId,
        flightId: selectedFare?.flightId || journey?.flightId || selectedFare?._id,
      };
      const response = await reviewAPI.create(payload);
      if (response.success) {
        // Update state immediately without needing page refresh
        setHasReviewed(true);
        setShowReviewModal(false);
        setUserName('');
        setReviewData({ rating: 5, comment: '' });
        alert('Review submitted successfully!');
      }
    } catch (error) {
      alert(error.message || 'Failed to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDownloadTicket = () => {
    if (isCancelled) {
      alert('Cancelled tickets cannot be downloaded.');
      return;
    }

    const element = ticketRef.current;
    const opt = {
      margin: 10,
      filename: `ticket_${passenger?.name || 'passenger'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' },
    };
    html2pdf().set(opt).from(element).save();
  };

  const handleCancelTicket = () => {
    if (isCancelled || isCancelling) {
      return;
    }
    setIsCancelling(true);
    setCancelRequestId(bookingId);
    setShowOtpModal(true);
  };

  const handleOtpSuccess = () => {
    setShowOtpModal(false);
    setIsCancelling(false);
    setIsCancelled(true);
    if (onCancelled) {
      onCancelled(cancelRequestId);
    }
  };

  const handleOtpClose = () => {
    setShowOtpModal(false);
    setIsCancelling(false);
  };

  return (
    <div className="ticket-card-wrapper">
      <div className={`ticket-card ${isCancelled ? 'cancelled-ticket' : ''}`} ref={ticketRef}>
        {isCancelled && (
          <div className="cancelled-overlay-line">
            <span>CANCELLED</span>
          </div>
        )}

        {/* Left Section - Airline Design Strip */}
        <div className="ticket-left-section">
          <div className="airline-logo">
            <svg
              width="60"
              height="60"
              viewBox="0 0 60 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="30" cy="30" r="28" stroke="white" strokeWidth="2" />
              <path
                d="M30 12L42 35H18Z"
                fill="white"
              />
              <circle cx="30" cy="42" r="4" fill="white" />
            </svg>
          </div>
          <div className="airline-name">
            <h3>BlueWing</h3>
            <p>AIRLINES</p>
          </div>
          <div className="ticket-barcode">
            <div className="barcode-lines"></div>
          </div>
        </div>

        {/* Middle Section - Main Ticket Details */}
        <div className="ticket-middle-section">
          <div className="ticket-header">
            <div className="header-section">
              <span className="label">Boarding Pass</span>
              <span className="class-badge">{formatCabin(journey?.cabinClass)}</span>
            </div>
          </div>

          <div className="ticket-main-content">
            <div className="passenger-section">
              <div className="field-group">
                <label className="field-label">Passenger Name</label>
                <p className="field-value">{passenger?.name || 'N/A'}</p>
              </div>
            </div>

            <div className="route-section">
              <div className="route-part">
                <label className="field-label">From</label>
                <p className="field-value">{journey?.from || journey?.departure || 'N/A'}</p>
              </div>

              <div className="route-arrow">→</div>

              <div className="route-part">
                <label className="field-label">To</label>
                <p className="field-value">{journey?.to || journey?.arrival || 'N/A'}</p>
              </div>
            </div>

            <div className="details-grid">
              <div className="detail-item">
                <label className="field-label">Date</label>
                <p className="field-value">{formatDate(journey?.departureDate || journey?.date)}</p>
              </div>

              <div className="detail-item">
                <label className="field-label">Departure</label>
                <p className="field-value">{selectedFare?.departureTime || journey?.departureTime || 'N/A'}</p>
              </div>

              <div className="detail-item">
                <label className="field-label">Arrival</label>
                <p className="field-value">{selectedFare?.arrivalTime || journey?.arrivalTime || 'N/A'}</p>
              </div>

              <div className="detail-item">
                <label className="field-label">Flight</label>
                <p className="field-value">{selectedFare?.flightNumber || 'N/A'}</p>
              </div>

              <div className="detail-item">
                <label className="field-label">Seat</label>
                <p className="field-value">{seatNumber}</p>
              </div>

              <div className="detail-item">
                <label className="field-label">Gate</label>
                <p className="field-value">{gateNumber}</p>
              </div>

              <div className="detail-item">
                <label className="field-label">Boarding</label>
                <p className="field-value">10:10</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashed Divider */}
        <div className="ticket-divider"></div>

        {/* Right Section - Mini Duplicate */}
        <div className="ticket-right-section">
          <div className="mini-section">
            <div className="mini-header">
              <span className="mini-title">BOARDING PASS</span>
            </div>

            <div className="mini-content">
              <div className="mini-passenger">
                <p className="mini-label">Passenger</p>
                <p className="mini-value">{passenger?.name || 'N/A'}</p>
              </div>

              <div className="mini-route">
                <div className="mini-from">
                  <p className="mini-label">From</p>
                  <p className="mini-value">{journey?.from || journey?.departure || 'N/A'}</p>
                </div>
                <div className="mini-arrow">→</div>
                <div className="mini-to">
                  <p className="mini-label">To</p>
                  <p className="mini-value">{journey?.to || journey?.arrival || 'N/A'}</p>
                </div>
              </div>

              <div className="mini-details">
                <div className="mini-detail">
                  <span className="mini-label">Date</span>
                  <span className="mini-value">{formatDate(journey?.departureDate || journey?.date)}</span>
                </div>
                <div className="mini-detail">
                  <span className="mini-label">Flight</span>
                  <span className="mini-value">{selectedFare?.flightNumber || 'N/A'}</span>
                </div>
              </div>

              <div className="mini-details">
                <div className="mini-detail">
                  <span className="mini-label">Seat</span>
                  <span className="mini-value">{seatNumber}</span>
                </div>
                <div className="mini-detail">
                  <span className="mini-label">Gate</span>
                  <span className="mini-value">{gateNumber}</span>
                </div>
              </div>

              <div className="mini-airline-logo">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 60 60"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="30" cy="30" r="28" stroke="#1976d2" strokeWidth="2" />
                  <path d="M30 12L42 35H18Z" fill="#1976d2" />
                  <circle cx="30" cy="42" r="4" fill="#1976d2" />
                </svg>
              </div>
            </div>

            <div className="mini-barcode">
              <div className="mini-barcode-lines"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="ticket-actions">
        {!isCancelled && !hideDownload && (
          <button className="btn btn-download" onClick={handleDownloadTicket}>
            📥 Download Ticket
          </button>
        )}
        {!isCancelled && canCancel && !hideCancel && (
          <button
            className="btn btn-cancel-ticket"
            onClick={handleCancelTicket}
            disabled={isCancelling}
          >
            {isCancelling ? '⏳ Cancelling...' : '🧾 Cancel Ticket'}
          </button>
        )}
        {isCancelled && !hideCancel && (
          <button className="btn btn-cancel-ticket btn-cancelled" disabled>
            ❌ Ticket Cancelled
          </button>
        )}
        {!isCancelled && canReview && !hasReviewed && (
          <button 
            className="btn btn-review btn-review-write" 
            onClick={() => setShowReviewModal(true)}
            disabled={isSubmittingReview}
          >
            ✍️ Write Review
          </button>
        )}
        {!isCancelled && hasReviewed && (
          <button 
            className="btn btn-review btn-review-submitted" 
            disabled
          >
            ✅ Review Submitted
          </button>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="review-modal-overlay">
          <div className="review-modal">
            <h3>Write a Review</h3>
            <div className="review-form">
              <div className="review-field">
                <label>Rating</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= reviewData.rating ? 'active' : ''}`}
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div className="review-field">
                <label>Your Name *</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
              <div className="review-field">
                <label>Comment *</label>
                <textarea
                  placeholder="Share your experience..."
                  rows={4}
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                />
              </div>
              <div className="review-actions">
                <button 
                  className="btn btn-cancel-review" 
                  onClick={() => setShowReviewModal(false)}
                  disabled={isSubmittingReview}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-submit-review" 
                  onClick={handleSubmitReview}
                  disabled={isSubmittingReview}
                >
                  {isSubmittingReview ? '⏳ Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showOtpModal && (
        <OtpCancelModal
          isOpen={showOtpModal}
          bookingId={cancelRequestId}
          contactEmail={contactDetails?.email || ""}
          onClose={handleOtpClose}
          onSuccess={handleOtpSuccess}
          otpAPI={otpAPI}
        />
      )}
    </div>
  );
};

export default TicketCard;
