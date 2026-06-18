import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js/dist/html2pdf.min.js';
import TicketCard from '../components/TicketCard';
import Navbar from '../components/Navbar';
import OtpCancelModal from '../components/OtpCancelModal';
import { bookingAPI, otpAPI } from '../utils/api';
import '../styles/TicketSummary.css';

const TicketSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [backendBooking, setBackendBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [cancelRequestId, setCancelRequestId] = useState(null);
  
  // Get data from navigation state (fallback)
  const journey = location.state?.journey || {};
  const selectedFare = location.state?.selectedFare || {};
  const passengers = location.state?.passengers || {};
  const contactDetails = location.state?.contactDetails || {};
  const transactionId = location.state?.transactionId || '';
  const bookingId = location.state?.bookingId || '';
  const bookingReference = location.state?.bookingReference || '';
  const cabinClass = location.state?.cabinClass || location.state?.journey?.cabinClass || location.state?.journey?.class || backendBooking?.cabinClass || 'ECONOMY';

  console.log("Ticket Summary received state:", location.state);
  console.log("Cabin Class:", cabinClass);

  useEffect(() => {
    const fetchBooking = async () => {
      console.log("Booking ID:", bookingId);
      if (!bookingId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await bookingAPI.getById(bookingId);
        console.log("API response:", response);
        if (response?.success && response?.data) {
          setBackendBooking(response.data);
        } else if (response?.data) {
          setBackendBooking(response.data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  // Safely handle passengers data - prefer backend data
  const allPassengers = useMemo(() => {
    let passengerList = [];
    
    // Try to use backend booking data first
    if (backendBooking?.passengers && Array.isArray(backendBooking.passengers) && backendBooking.passengers.length > 0) {
      passengerList = backendBooking.passengers.map((p, i) => ({
        ...p,
        name: `${p?.firstName || ''} ${p?.lastName || ''}`.trim() || 'Passenger',
        passengerNumber: i + 1,
        seatNumber: p?.seatNumber || backendBooking?.selectedSeats?.[i] || 'N/A',
        ticketNumber: p?.ticketNumber || `BW-TK-${Date.now()}-${i + 1}`,
      }));
    } else {
      // Fallback to navigation state data
      if (Array.isArray(passengers?.adults)) {
        passengerList = [...passengerList, ...passengers.adults.map((p, i) => ({
          ...p,
          name: `${p?.firstName || ''} ${p?.lastName || ''}`.trim() || 'Passenger',
          type: 'adult',
          passengerNumber: i + 1,
          seatNumber: location.state?.selectedSeats?.[i] || 'N/A',
          ticketNumber: `BW-TK-${Date.now()}-${i + 1}`,
        }))];
      }
      if (Array.isArray(passengers?.children)) {
        const offset = passengerList.length;
        passengerList = [...passengerList, ...passengers.children.map((p, i) => ({
          ...p,
          name: `${p?.firstName || ''} ${p?.lastName || ''}`.trim() || 'Passenger',
          type: 'child',
          passengerNumber: offset + i + 1,
          seatNumber: location.state?.selectedSeats?.[offset + i] || 'N/A',
          ticketNumber: `BW-TK-${Date.now()}-${offset + i + 1}`,
        }))];
      }
    }
    
    // If still no passengers, create a placeholder
    if (passengerList.length === 0) {
      passengerList = [{
        name: 'Passenger',
        type: 'adult',
        passengerNumber: 1,
        seatNumber: 'N/A',
        ticketNumber: `BW-TK-${Date.now()}`,
      }];
    }
    
    return passengerList;
  }, [backendBooking, passengers, location.state?.selectedSeats]);

  // Get flight details - prefer backend data
  const flightDetails = useMemo(() => {
    if (backendBooking?.flightId) {
      const flight = backendBooking.flightId;
      return {
        flightNumber: flight?.flightNumber || selectedFare?.flightNumber,
        from: flight?.from || journey?.departure,
        to: flight?.to || journey?.arrival,
        departureDate: flight?.departureDate || journey?.date,
        departureTime: flight?.departureTime || selectedFare?.departureTime,
        arrivalTime: flight?.arrivalTime || selectedFare?.arrivalTime,
        duration: flight?.duration || selectedFare?.duration,
        airline: flight?.airline || 'BlueWing Airlines',
        cabinClass: cabinClass,
      };
    }
    return {
      flightNumber: selectedFare?.flightNumber || 'BW---',
      from: journey?.departure || 'FROM',
      to: journey?.arrival || 'TO',
      departureDate: journey?.date,
      departureTime: selectedFare?.departureTime,
      arrivalTime: selectedFare?.arrivalTime,
      duration: selectedFare?.duration,
      airline: 'BlueWing Airlines',
      cabinClass: cabinClass,
    };
  }, [backendBooking, journey, selectedFare, cabinClass]);

  // Get contact details - prefer backend data
  const displayContactDetails = useMemo(() => {
    if (backendBooking?.contactDetails?.email) {
      return {
        email: backendBooking.contactDetails.email,
        phone: backendBooking.contactDetails.phone || '',
        country: backendBooking.contactDetails.country || 'India',
      };
    } else if (backendBooking?.userId?.email) {
       return {
         email: backendBooking.userId.email,
         phone: backendBooking.userId.phone || '',
         country: 'India',
       };
    }
    
    let fallbackEmail = '';
    try {
      const userStr = localStorage.getItem('bluewing_user');
      if (userStr) fallbackEmail = JSON.parse(userStr)?.email || '';
    } catch (e) {}

    return {
      email: contactDetails?.email || fallbackEmail,
      phone: contactDetails?.mobileNumber || contactDetails?.phone || '',
      country: contactDetails?.country || 'India',
    };
  }, [backendBooking, contactDetails]);

  // Get booking reference
  const displayBookingReference = useMemo(() => {
    return backendBooking?.bookingReference || bookingReference || `BW${Date.now().toString().slice(-6)}`;
  }, [backendBooking, bookingReference]);

  const formatCurrency = (value) => {
    const amount = Number(String(value).replace(/[^0-9.-]+/g, ''));
    return Number.isFinite(amount) ? `₹${amount.toLocaleString('en-IN')}` : '₹ --';
  };

  // Format total fare for display
  const totalFareDisplay = useMemo(() => {
    if (selectedFare?.totalFare != null) {
      return formatCurrency(selectedFare.totalFare);
    }
    if (location.state?.totalFare != null) {
      return formatCurrency(location.state.totalFare);
    }
    if (selectedFare?.price != null) {
      return formatCurrency(selectedFare.price);
    }
    if (backendBooking?.paymentId?.amount != null) {
      return formatCurrency(backendBooking.paymentId.amount);
    }
    if (backendBooking?.pricing?.totalAmount != null) {
      return formatCurrency(backendBooking.pricing.totalAmount);
    }
    return '₹ --';
  }, [selectedFare, backendBooking, location.state]);

  // Get fare type details
  const fareTypeDetails = useMemo(() => {
    if (backendBooking?.fareType) {
      return {
        name: backendBooking.fareType.name || 'Standard',
        baggage: backendBooking.fareType.baggage || '15kg',
        meals: backendBooking.fareType.meals || false,
        cancellation: backendBooking.fareType.cancellation || false,
      };
    }
    return {
      name: selectedFare?.fareTypeTitle || 'Standard',
      baggage: '15kg',
      meals: false,
      cancellation: false,
    };
  }, [backendBooking, selectedFare]);

  const handleGoHome = () => {
    navigate('/');
  };

  // Handle ticket cancellation - refresh booking data
  const handleTicketCancelled = async (cancelledBookingId) => {
    // Reload the booking data to get updated status
    try {
      const response = await bookingAPI.getById(cancelledBookingId);
      if (response?.success && response?.data) {
        setBackendBooking(response.data);
      }
    } catch (err) {
      console.warn('Failed to refresh booking:', err?.message || err);
    }
  };

  const handleDownloadAllTickets = () => {
    const elements = document.querySelectorAll('.ticket-card');
    if (elements.length === 0) return;

    const opt = {
      margin: 10,
      filename: `all_tickets_${displayBookingReference}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' },
    };

    let pdf = html2pdf().set(opt).from(elements[0]);
    for (let i = 1; i < elements.length; i++) {
        pdf = pdf.toPdf().get('pdf').then((pdfInstance) => {
             pdfInstance.addPage();
        }).from(elements[i]).toContainer().toCanvas().toPdf();
    }
    pdf.save();
  };

  const currentStatus = String(backendBooking?.bookingStatus || backendBooking?.status || '').toLowerCase();
  const isMultiPassenger = (allPassengers?.length || 0) > 1;

  const handleCancelTicket = async () => {
    if (isCancelling) return;
    if (currentStatus === 'cancelled') return;
    
    setIsCancelling(true);
    const idToCancel = bookingId || backendBooking?._id;
    setCancelRequestId(idToCancel);

    try {
      const response = await otpAPI.sendOtp({ bookingId: idToCancel });
      if (response && response.success === false) {
        setIsCancelling(false);
      } else {
        setShowOtpModal(true);
      }
    } catch (error) {
      console.error('Error initiating cancellation:', error);
      setIsCancelling(false);
    }
  };

  const handleOtpSuccess = () => {
    setShowOtpModal(false);
    setIsCancelling(false);
    handleTicketCancelled(cancelRequestId);
  };

  const handleOtpClose = () => {
    setShowOtpModal(false);
    setIsCancelling(false);
  };

  if (error) {
    return (
      <>
        <Navbar minimalMode={true} />
        <div className="ticket-summary-page">
          <div className="error-banner">
            <p>Failed to load ticket</p>
          </div>
        </div>
      </>
    );
  }

  if (!bookingId) {
    return (
      <>
        <Navbar minimalMode={true} />
        <div className="ticket-summary-page">
          <div className="error-banner">
            <p>No ticket found</p>
          </div>
        </div>
      </>
    );
  }

  if (!backendBooking) {
    return (
      <>
        <Navbar minimalMode={true} />
        <div className="ticket-summary-page">
          <div className="loading-container">
            <p>Loading ticket...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar minimalMode={true} />
      <div className="ticket-summary-page">
        <div className="ticket-summary-header">
          <div className="header-icon">✈️</div>
          <h1>Booking Confirmed!</h1>
          <p className="booking-reference">Booking Reference: <strong>{displayBookingReference}</strong></p>
          <p className="transaction-id">Transaction ID: {transactionId || backendBooking?.paymentId?.transactionId || 'N/A'}</p>
          {(backendBooking?.bookingStatus || backendBooking?.status) && (
            <span className={`booking-status-badge status-${backendBooking?.bookingStatus || backendBooking?.status}`}>
              {String(backendBooking?.bookingStatus || backendBooking?.status || '').toUpperCase()}
            </span>
          )}
        </div>

        {error && (
          <div className="error-banner">
            <p>{error}</p>
          </div>
        )}

        {/* Total Fare Summary Section */}
        <div className="ticket-fare-summary">
          <div className="fare-summary-card">
            <div className="fare-summary-item">
              <span className="fare-label">Passengers</span>
              <span className="fare-value">{allPassengers?.length || 0}</span>
            </div>
            <div className="fare-summary-item">
              <span className="fare-label">Fare Type</span>
              <span className="fare-value">{fareTypeDetails?.name || 'Standard'}</span>
            </div>
            <div className="fare-summary-item">
              <span className="fare-label">Baggage</span>
              <span className="fare-value">{fareTypeDetails?.baggage || '15kg'}</span>
            </div>
            <div className="fare-summary-item">
              <span className="fare-label">Total Amount</span>
              <span className="fare-value fare-amount">{totalFareDisplay}</span>
            </div>
          </div>
        </div>

        {/* Tickets Section */}
        <div className="tickets-section">
          <h2 className="section-title">🎫 Your Boarding Passes</h2>
          <div className="ticket-summary-container">
            {allPassengers && allPassengers.length > 0 ? (
              <div className="tickets-list">
                {allPassengers.map((passenger, index) => (
                  <TicketCard
                    key={index}
                    passenger={passenger}
                    journey={flightDetails}
                    selectedFare={{
                      ...selectedFare,
                      flightNumber: flightDetails?.flightNumber,
                      departureTime: flightDetails?.departureTime,
                      arrivalTime: flightDetails?.arrivalTime,
                    }}
                    contactDetails={displayContactDetails}
                    bookingReference={displayBookingReference}
                    bookingId={bookingId || backendBooking?._id}
                    onCancelled={handleTicketCancelled}
                    hasReviewed={backendBooking?.hasReviewed || false}
                    bookingStatus={backendBooking?.bookingStatus || backendBooking?.status}
                    hideCancel={isMultiPassenger}
                    hideDownload={isMultiPassenger}
                  />
                ))}
              </div>
            ) : (
              <div className="no-tickets">
                <p>No passenger data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons specific to multi-passenger or general summary actions */}
        <div className="ticket-summary-actions">
          {isMultiPassenger && currentStatus !== 'cancelled' && (
            <>
              <button className="btn btn-primary" onClick={handleDownloadAllTickets}>
                📥 Download All Tickets
              </button>
              <button 
                className="btn btn-cancel-ticket" 
                onClick={handleCancelTicket}
                disabled={isCancelling}
              >
                {isCancelling ? '⏳ Cancelling...' : '🧾 Cancel Booking'}
              </button>
            </>
          )}
          {isMultiPassenger && currentStatus === 'cancelled' && (
             <button className="btn btn-cancel-ticket btn-cancelled" disabled>
                ❌ Booking Cancelled
             </button>
          )}
          <button className="btn btn-secondary" onClick={handleGoHome}>
            🏠 Go to Home
          </button>
        </div>

        {showOtpModal && (
          <OtpCancelModal
            isOpen={showOtpModal}
            bookingId={cancelRequestId}
            contactEmail={displayContactDetails?.email || ""}
            onClose={handleOtpClose}
            onSuccess={handleOtpSuccess}
            otpAPI={otpAPI}
          />
        )}
      </div>
    </>
  );
};

export default TicketSummary;
