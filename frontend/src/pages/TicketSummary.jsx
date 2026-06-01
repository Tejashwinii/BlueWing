import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TicketCard from '../components/TicketCard';
import Navbar from '../components/Navbar';
import { bookingAPI } from '../utils/api';
import '../styles/TicketSummary.css';

const TicketSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [backendBooking, setBackendBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get data from navigation state (fallback)
  const journey = location.state?.journey || {};
  const selectedFare = location.state?.selectedFare || {};
  const passengers = location.state?.passengers || {};
  const contactDetails = location.state?.contactDetails || {};
  const transactionId = location.state?.transactionId || '';
  const bookingId = location.state?.bookingId || '';
  const bookingReference = location.state?.bookingReference || '';

  useEffect(() => {
    const loadBooking = async () => {
      if (!bookingId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await bookingAPI.getById(bookingId);
        if (response?.success && response?.data) {
          setBackendBooking(response.data);
        }
      } catch (err) {
        console.warn('Failed to fetch booking:', err?.message || err);
        setError('Could not load booking details from server. Showing local data.');
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingId]);

  // Safely handle passengers data - prefer backend data
  const allPassengers = useMemo(() => {
    let passengerList = [];
    
    // Try to use backend booking data first
    if (backendBooking?.passengers?.length) {
      passengerList = backendBooking.passengers.map((p, i) => ({
        ...p,
        name: `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Passenger',
        passengerNumber: i + 1,
        seatNumber: p.seatNumber || backendBooking.selectedSeats?.[i] || 'N/A',
        ticketNumber: p.ticketNumber || `BW-TK-${Date.now()}-${i + 1}`,
      }));
    } else {
      // Fallback to navigation state data
      if (Array.isArray(passengers.adults)) {
        passengerList = [...passengerList, ...passengers.adults.map((p, i) => ({
          ...p,
          name: `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Passenger',
          type: 'adult',
          passengerNumber: i + 1,
          seatNumber: location.state?.selectedSeats?.[i] || 'N/A',
          ticketNumber: `BW-TK-${Date.now()}-${i + 1}`,
        }))];
      }
      if (Array.isArray(passengers.children)) {
        const offset = passengerList.length;
        passengerList = [...passengerList, ...passengers.children.map((p, i) => ({
          ...p,
          name: `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Passenger',
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
        flightNumber: flight.flightNumber || selectedFare.flightNumber,
        from: flight.from || journey.departure,
        to: flight.to || journey.arrival,
        departureDate: flight.departureDate || journey.date,
        departureTime: flight.departureTime || selectedFare.departureTime,
        arrivalTime: flight.arrivalTime || selectedFare.arrivalTime,
        duration: flight.duration || selectedFare.duration,
        airline: flight.airline || 'BlueWing Airlines',
      };
    }
    return {
      flightNumber: selectedFare.flightNumber || 'BW---',
      from: journey.departure || 'FROM',
      to: journey.arrival || 'TO',
      departureDate: journey.date,
      departureTime: selectedFare.departureTime,
      arrivalTime: selectedFare.arrivalTime,
      duration: selectedFare.duration,
      airline: 'BlueWing Airlines',
    };
  }, [backendBooking, journey, selectedFare]);

  // Get contact details - prefer backend data
  const displayContactDetails = useMemo(() => {
    if (backendBooking?.contactDetails) {
      return {
        email: backendBooking.contactDetails.email,
        phone: backendBooking.contactDetails.phone,
        country: backendBooking.contactDetails.country,
      };
    }
    return {
      email: contactDetails.email,
      phone: contactDetails.mobileNumber || contactDetails.phone,
      country: contactDetails.country || 'India',
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
  }, [selectedFare, backendBooking]);

  // Get fare type details
  const fareTypeDetails = useMemo(() => {
    if (backendBooking?.fareType) {
      return {
        name: backendBooking.fareType.name,
        baggage: backendBooking.fareType.baggage,
        meals: backendBooking.fareType.meals,
        cancellation: backendBooking.fareType.cancellation,
      };
    }
    return {
      name: selectedFare.fareTypeTitle || 'Standard',
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

  if (loading) {
    return (
      <>
        <Navbar minimalMode={true} />
        <div className="ticket-summary-page">
          <div className="loading-container">
            <p>Loading your booking details...</p>
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
          {backendBooking?.bookingStatus && (
            <span className={`booking-status-badge status-${backendBooking.bookingStatus}`}>
              {backendBooking.bookingStatus.toUpperCase()}
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
              <span className="fare-value">{allPassengers.length}</span>
            </div>
            <div className="fare-summary-item">
              <span className="fare-label">Fare Type</span>
              <span className="fare-value">{fareTypeDetails.name}</span>
            </div>
            <div className="fare-summary-item">
              <span className="fare-label">Baggage</span>
              <span className="fare-value">{fareTypeDetails.baggage}</span>
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
                      flightNumber: flightDetails.flightNumber,
                      departureTime: flightDetails.departureTime,
                      arrivalTime: flightDetails.arrivalTime,
                    }}
                    contactDetails={displayContactDetails}
                    bookingReference={displayBookingReference}
                    bookingId={bookingId || backendBooking?._id}
                    onCancelled={handleTicketCancelled}
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

        <div className="ticket-summary-actions">
          <button className="btn btn-secondary" onClick={handleGoHome}>
            🏠 Go to Home
          </button>
        </div>
      </div>
    </>
  );
};

export default TicketSummary;
