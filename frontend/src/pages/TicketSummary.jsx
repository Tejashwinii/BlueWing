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
  const journey = location.state?.journey || {};
  const selectedFare = location.state?.selectedFare || {};
  const passengers = location.state?.passengers || {};
  const contactDetails = location.state?.contactDetails || {};
  const transactionId = location.state?.transactionId || '';
  const bookingId = location.state?.bookingId || '';

  useEffect(() => {
    const loadBooking = async () => {
      if (!bookingId) return;
      try {
        const response = await bookingAPI.getById(bookingId);
        if (response?.data) {
          setBackendBooking(response.data);
        }
      } catch (error) {
        console.warn('Failed to fetch booking:', error?.message || error);
      }
    };

    loadBooking();
  }, [bookingId]);

  // Safely handle passengers data
  let allPassengers = [];
  if (backendBooking?.passengers?.length) {
    allPassengers = backendBooking.passengers.map((p, i) => ({
      ...p,
      name: `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Passenger',
      passengerNumber: i + 1,
    }));
  } else {
    if (Array.isArray(passengers.adults)) {
      allPassengers = [...allPassengers, ...passengers.adults.map((p, i) => ({
        ...p,
        name: `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Passenger',
        type: 'adult',
        passengerNumber: i + 1,
      }))];
    }
    if (Array.isArray(passengers.children)) {
      allPassengers = [...allPassengers, ...passengers.children.map((p, i) => ({
        ...p,
        name: `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Passenger',
        type: 'child',
        passengerNumber: allPassengers.length + i + 1,
      }))];
    }
  }
  
  // If no passengers found, create a dummy passenger for demo purposes
  if (allPassengers.length === 0) {
    allPassengers = [{
      name: 'Passenger',
      type: 'adult'
    }];
  }

  // Format total fare for display
  const totalFareDisplay = useMemo(() => {
    if (backendBooking?.pricing?.totalAmount) {
      return `₹${backendBooking.pricing.totalAmount.toLocaleString('en-IN')}`;
    }
    if (selectedFare.totalFare) {
      return `₹${typeof selectedFare.totalFare === 'number' ? selectedFare.totalFare.toLocaleString('en-IN') : selectedFare.totalFare}`;
    }
    return selectedFare.price || '₹ --';
  }, [selectedFare, backendBooking]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleDownloadAllTickets = () => {
    const ticketCards = document.querySelectorAll('.ticket-card:not(.cancelled-ticket)');

    if (ticketCards.length === 0) {
      alert('All tickets are cancelled. Download is not available.');
      return;
    }

    ticketCards.forEach((card, index) => {
      setTimeout(() => {
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<pre>' + card.innerHTML + '</pre>');
        printWindow.document.close();
        printWindow.print();
      }, index * 500);
    });
  };

  return (
    <>
      <Navbar minimalMode={true} />
      <div className="ticket-summary-page">
        <div className="ticket-summary-header">
          <h1>Your Ticket Summary</h1>
          <p className="transaction-id">Transaction ID: {transactionId || backendBooking?.paymentId?.transactionId || 'N/A'}</p>
        </div>

        {/* Total Fare Summary Section */}
        <div className="ticket-fare-summary">
          <div className="fare-summary-card">
            <div className="fare-summary-item">
              <span className="fare-label">Number of Passengers:</span>
              <span className="fare-value">{allPassengers.length}</span>
            </div>
            <div className="fare-summary-item">
              <span className="fare-label">Total Fare:</span>
              <span className="fare-value fare-amount">{totalFareDisplay}</span>
            </div>
          </div>
        </div>

        <div className="ticket-summary-container">
          {allPassengers && allPassengers.length > 0 ? (
            <div className="tickets-list">
              {allPassengers.map((passenger, index) => (
                <TicketCard
                  key={index}
                  passenger={passenger}
                  journey={backendBooking?.flightId || journey}
                  selectedFare={backendBooking?.flightId || selectedFare}
                  contactDetails={backendBooking?.contactDetails || contactDetails}
                />
              ))}
            </div>
          ) : (
            <div className="no-tickets">
              <p>No passenger data available</p>
            </div>
          )}
        </div>

        <div className="ticket-summary-actions">
          <button className="btn btn-primary" onClick={handleDownloadAllTickets}>
            📥 Download All Tickets
          </button>
          <button className="btn btn-secondary" onClick={handleGoHome}>
            🏠 Go to Home
          </button>
        </div>
      </div>
    </>
  );
};

export default TicketSummary;
