import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TicketCard from '../components/TicketCard';
import Navbar from '../components/Navbar';
import '../styles/TicketSummary.css';

const TicketSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const journey = location.state?.journey || {};
  const selectedFare = location.state?.selectedFare || {};
  const passengers = location.state?.passengers || {};
  const contactDetails = location.state?.contactDetails || {};
  const transactionId = location.state?.transactionId || '';

  // Safely handle passengers data
  let allPassengers = [];
  if (Array.isArray(passengers.adults)) {
    allPassengers = [...allPassengers, ...passengers.adults];
  }
  if (Array.isArray(passengers.children)) {
    allPassengers = [...allPassengers, ...passengers.children];
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
    if (selectedFare.totalFare) {
      return `₹${typeof selectedFare.totalFare === 'number' ? selectedFare.totalFare.toLocaleString('en-IN') : selectedFare.totalFare}`;
    }
    return selectedFare.price || '₹ --';
  }, [selectedFare]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleDownloadAllTickets = () => {
    const ticketCards = document.querySelectorAll('.ticket-card');
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
          <p className="transaction-id">Transaction ID: {transactionId || 'N/A'}</p>
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
                  journey={journey}
                  selectedFare={selectedFare}
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
