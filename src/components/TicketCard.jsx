import React, { useMemo, useRef, useState } from 'react';
import html2pdf from 'html2pdf.js/dist/html2pdf.min.js';
import '../styles/TicketCard.css';

const TicketCard = ({ passenger, journey, selectedFare, contactDetails = {} }) => {
  const ticketRef = useRef(null);
  const [isCancelled, setIsCancelled] = useState(false);

  const getRandomSeat = () => {
    const rows = Array.from({ length: 30 }, (_, i) => i + 1);
    const cols = ['A', 'B', 'C', 'D', 'E', 'F'];
    const randomRow = rows[Math.floor(Math.random() * rows.length)];
    const randomCol = cols[Math.floor(Math.random() * cols.length)];
    return `${randomRow}${randomCol}`;
  };

  const getRandomGate = () => {
    const gates = Array.from({ length: 50 }, (_, i) => i + 1);
    return gates[Math.floor(Math.random() * gates.length)];
  };

  const seatNumber = useMemo(() => getRandomSeat(), []);
  const gateNumber = useMemo(() => getRandomGate(), []);

  const getMaskedMobile = () => {
    const mobile = (contactDetails?.mobileNumber || '').toString();
    if (!mobile || mobile.length < 4) {
      return 'registered mobile number';
    }
    const lastFourDigits = mobile.slice(-4);
    return `******${lastFourDigits}`;
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
    if (isCancelled) {
      return;
    }

    const isConfirmed = window.confirm('Are you sure you want to cancel this ticket?');
    if (!isConfirmed) {
      return;
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const maskedMobile = getMaskedMobile();

    alert(`OTP has been sent to ${maskedMobile}.\nDemo OTP: ${otp}`);
    const enteredOtp = window.prompt('Enter OTP to confirm ticket cancellation:');

    if (!enteredOtp) {
      alert('Cancellation aborted. OTP not entered.');
      return;
    }

    if (enteredOtp.trim() === otp) {
      setIsCancelled(true);
      alert('Ticket cancelled successfully.');
    } else {
      alert('Invalid OTP. Ticket cancellation failed.');
    }
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
              <span className="class-badge">{journey?.cabinClass || 'ECONOMY'}</span>
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
                <p className="field-value">{journey?.departure || 'N/A'}</p>
              </div>

              <div className="route-arrow">→</div>

              <div className="route-part">
                <label className="field-label">To</label>
                <p className="field-value">{journey?.arrival || 'N/A'}</p>
              </div>
            </div>

            <div className="details-grid">
              <div className="detail-item">
                <label className="field-label">Date</label>
                <p className="field-value">{journey?.date || 'N/A'}</p>
              </div>

              <div className="detail-item">
                <label className="field-label">Time</label>
                <p className="field-value">{selectedFare?.departureTime || 'N/A'}</p>
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
                  <p className="mini-value">{journey?.departure || 'N/A'}</p>
                </div>
                <div className="mini-arrow">→</div>
                <div className="mini-to">
                  <p className="mini-label">To</p>
                  <p className="mini-value">{journey?.arrival || 'N/A'}</p>
                </div>
              </div>

              <div className="mini-details">
                <div className="mini-detail">
                  <span className="mini-label">Date</span>
                  <span className="mini-value">{journey?.date || 'N/A'}</span>
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
        {!isCancelled && (
          <button className="btn btn-download" onClick={handleDownloadTicket}>
            📥 Download Ticket
          </button>
        )}
        <button
          className={`btn btn-cancel-ticket ${isCancelled ? 'btn-cancelled' : ''}`}
          onClick={handleCancelTicket}
          disabled={isCancelled}
        >
          {isCancelled ? '❌ Ticket Cancelled' : '🧾 Cancellation Ticket'}
        </button>
      </div>
    </div>
  );
};

export default TicketCard;
