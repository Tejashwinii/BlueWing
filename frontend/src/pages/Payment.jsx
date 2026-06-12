import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import Navbar from '../components/Navbar';
import { bookingAPI } from '../utils/api';
import '../styles/Payment.css';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get data from previous pages
  const journey = location.state?.journey || {};
  const selectedFare = location.state?.selectedFare || {};
  const passengers = location.state?.passengers || {};
  const contactDetails = location.state?.contactDetails || {};
  const selectedSeats = location.state?.selectedSeats || [];
  const totalFareFromSeats = location.state?.totalFare || 0;

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardType, setCardType] = useState('');
  const [showCardForm, setShowCardForm] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  // Determine the total fare to use (prefer from seat selection, fallback to fare)
  const displayTotalFare = totalFareFromSeats || selectedFare.totalFare || selectedFare.price || '0';

  // Payment form state
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    amount: displayTotalFare,
  });

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(600);
  const [bookingId, setBookingId] = useState(null);
  const [bookingReference, setBookingReference] = useState(null);
  const [bookingCreated, setBookingCreated] = useState(false);

  // QR Code canvas ref
  const qrCanvasRef = useRef(null);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Generate QR Code when showing QR code section
  useEffect(() => {
    if (showQRCode && qrCanvasRef.current) {
      const qrValue = JSON.stringify({
        amount: displayTotalFare,
        transactionId: Date.now(),
        merchant: 'BlueWing Airlines',
      });
      QRCode.toCanvas(qrCanvasRef.current, qrValue, { width: 200 }, (error) => {
        if (error) {
          console.error('Error generating QR code:', error);
        }
      });
    }
  }, [showQRCode, displayTotalFare]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Format passenger count
  const passengerCountDisplay = useMemo(() => {
    const { adults = [], children = [], infants = 0 } = passengers;
    const counts = [];
    if (adults?.length > 0) counts.push(`${adults.length} Adult${adults.length !== 1 ? 's' : ''}`);
    if (children?.length > 0) counts.push(`${children.length} Child${children.length !== 1 ? 'ren' : ''}`);
    if (infants > 0) counts.push(`${infants} Infant${infants !== 1 ? 's' : ''}`);
    return counts.join(', ') || '1 Adult';
  }, [passengers]);

  // Handle card type selection
  const handleCardTypeSelect = (type) => {
    setCardType(type);
    setShowCardForm(true);
    setErrors({});
    setFormData({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      amount: displayTotalFare,
    });
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === 'cardNumber') {
      processedValue = value.replace(/\D/g, '').slice(0, 16);
    }

    if (name === 'expiryDate') {
      let digitsOnly = value.replace(/\D/g, '').slice(0, 4);
      if (digitsOnly.length >= 2) {
        digitsOnly = digitsOnly.slice(0, 2) + '/' + digitsOnly.slice(2, 4);
      }
      processedValue = digitsOnly;
    }

    if (name === 'cvv') {
      processedValue = value.replace(/\D/g, '').slice(0, 3);
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.cardNumber) {
      newErrors.cardNumber = 'Card Number is required';
    } else if (formData.cardNumber.length !== 16) {
      newErrors.cardNumber = 'Card Number must be 16 digits';
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry Date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Expiry Date must be MM/YY format';
    }

    if (!formData.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (formData.cvv.length !== 3) {
      newErrors.cvv = 'CVV must be 3 digits';
    }

    if (formData.amount && isNaN(formData.amount)) {
      newErrors.amount = 'Invalid amount';
    }

    return newErrors;
  };

  // Create booking in backend
  const createBooking = async () => {
    try {
      // Prepare passengers array from adults and children
      const passengersArray = [];
      
      if (Array.isArray(passengers.adults)) {
        passengers.adults.forEach((p, index) => {
          passengersArray.push({
            firstName: p.firstName,
            lastName: p.lastName,
            gender: p.gender,
            age: parseInt(p.age) || 25,
            type: 'adult',
          });
        });
      }
      
      if (Array.isArray(passengers.children)) {
        passengers.children.forEach((p) => {
          passengersArray.push({
            firstName: p.firstName,
            lastName: p.lastName,
            gender: p.gender,
            age: parseInt(p.age) || 10,
            type: 'child',
          });
        });
      }

      // Determine fare type from selectedFare
      const fareTitle = selectedFare?.fareTypeTitle || selectedFare?.title || 'Saver';
      let fareType = 'Saver';
      if (/flexi/i.test(fareTitle)) fareType = 'Flexi Plus';
      if (/upfront/i.test(fareTitle)) fareType = 'BlueWing Upfront';

      const bookingPayload = {
        flightId: selectedFare?.flightId || journey?.flightId,
        fareType,
        passengers: passengersArray,
        selectedSeats: selectedSeats || [],
        contactDetails: {
          phone: contactDetails?.mobileNumber || contactDetails?.phone,
          email: contactDetails?.email,
          country: contactDetails?.country || 'India',
          contactPassengerIndex: 0,
        },
      };

      console.log('Creating booking with payload:', bookingPayload);
      const response = await bookingAPI.create(bookingPayload);
      
      if (response.success && response.data?.booking) {
        setBookingId(response.data.booking._id);
        setBookingReference(response.data.booking.bookingReference);
        setBookingCreated(true);
        return response.data.booking;
      } else {
        throw new Error(response.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Booking creation error:', error);
      throw error;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();

    if (Object.keys(formErrors).length === 0) {
      setIsProcessing(true);
      setPaymentStatus(null);

      try {
        // Step 1: Create booking first (if not already created)
        let currentBookingId = bookingId;
        if (!bookingCreated) {
          const booking = await createBooking();
          currentBookingId = booking._id;
        }

        // Step 2: Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (formData.cardNumber === '4111111111111111' || formData.cardNumber.length === 16) {
          // Step 3: Confirm booking after successful payment
          const transactionId = `TXN${Date.now()}`;
          const paymentGatewayId = `PG${Date.now()}`;

          try {
            await bookingAPI.confirmBooking(currentBookingId, {
              paymentGatewayId,
              transactionId,
            });
          } catch (confirmError) {
            console.warn('Booking confirmation warning:', confirmError);
          }

          setPaymentStatus('success');
          setStatusMessage('Payment Successful! Your booking has been confirmed.');

          // Save to local storage for history
          const transactions = JSON.parse(localStorage.getItem('paymentHistory') || '[]');
          transactions.push({
            id: Date.now(),
            cardNumber: `****${formData.cardNumber.slice(-4)}`,
            amount: formData.amount,
            date: new Date().toLocaleString(),
            status: 'success',
            bookingReference: bookingReference,
          });
          localStorage.setItem('paymentHistory', JSON.stringify(transactions));

          // Navigate to payment success page
          setTimeout(() => {
            navigate('/payment-success', {
              state: {
                journey,
                selectedFare,
                passengers,
                contactDetails,
                selectedSeats,
                transactionId,
                bookingId: currentBookingId,
                bookingReference,
                cabinClass: location.state?.cabinClass || journey.cabinClass,
              },
            });
            setIsProcessing(false);
          }, 2000);
        } else if (formData.cardNumber === '4000000000000002') {
          setPaymentStatus('failure');
          setStatusMessage('Payment Failed. Please try again with a different card.');
          setIsProcessing(false);
        } else {
          // For demo: accept any 16-digit card
          setPaymentStatus('success');
          setStatusMessage('Payment Successful! Your booking has been confirmed.');
          
          setTimeout(() => {
            navigate('/payment-success', {
              state: {
                journey,
                selectedFare,
                passengers,
                contactDetails,
                selectedSeats,
                transactionId: `TXN${Date.now()}`,
                bookingId: currentBookingId,
                bookingReference,
                cabinClass: location.state?.cabinClass || journey.cabinClass,
              },
            });
            setIsProcessing(false);
          }, 2000);
        }
      } catch (error) {
        console.error('Payment processing error:', error);
        setPaymentStatus('failure');
        setStatusMessage(error.message || 'Payment failed. Please try again.');
        setIsProcessing(false);
      }
    } else {
      setErrors(formErrors);
    }
  };

  // Handle QR payment
  const handleScanToPay = () => {
    setPaymentMethod('qr');
    setShowQRCode(true);
    setCardType('');
    setShowCardForm(false);
    setPaymentStatus(null);
    setStatusMessage('');
  };

  // Handle QR Code confirmation
  const handleQRCodeConfirm = async () => {
    setIsProcessing(true);

    try {
      // Step 1: Create booking first (if not already created)
      let currentBookingId = bookingId;
      if (!bookingCreated) {
        const booking = await createBooking();
        currentBookingId = booking._id;
      }

      // Step 2: Simulate QR payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 3: Confirm booking
      const transactionId = `QR-TXN${Date.now()}`;
      try {
        await bookingAPI.confirmBooking(currentBookingId, {
          paymentGatewayId: `QR-PG${Date.now()}`,
          transactionId,
        });
      } catch (confirmError) {
        console.warn('Booking confirmation warning:', confirmError);
      }

      setPaymentStatus('success');
      setStatusMessage('Payment Completed via QR Code!');

      const transactions = JSON.parse(localStorage.getItem('paymentHistory') || '[]');
      transactions.push({
        id: Date.now(),
        cardNumber: 'QR Payment',
        amount: formData.amount,
        date: new Date().toLocaleString(),
        status: 'success',
        bookingReference: bookingReference,
      });
      localStorage.setItem('paymentHistory', JSON.stringify(transactions));

      setTimeout(() => {
        navigate('/payment-success', {
          state: {
            journey,
            selectedFare,
            passengers,
            contactDetails,
            selectedSeats,
            transactionId,
            bookingId: currentBookingId,
            bookingReference,
            cabinClass: location.state?.cabinClass || journey.cabinClass,
          },
        });
        setIsProcessing(false);
      }, 2000);
    } catch (error) {
      console.error('QR Payment error:', error);
      setPaymentStatus('failure');
      setStatusMessage(error.message || 'QR Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Navbar minimalMode={true} />
      <div className="payment-page">
        <div className="compact-route-card">
          <div className="route-display">
            <span className="route-from">{journey.departure || 'FROM'}</span>
            <span className="route-arrow">→</span>
            <span className="route-to">{journey.arrival || 'TO'}</span>
          </div>
        </div>

        <div className="payment-container">
          <div className="payment-form-wrapper">
            <h1 className="page-title">Payment</h1>

            {paymentStatus === 'success' && (
              <div className="status-message success-message">
                <span className="success-icon">✓</span>
                {statusMessage}
              </div>
            )}

            {paymentStatus === 'failure' && (
              <div className="status-message failure-message">
                <span className="failure-icon">✕</span>
                {statusMessage}
              </div>
            )}

            {isProcessing && (
              <div className="status-message processing-message">
                <span className="spinner"></span>
                Processing...
              </div>
            )}

            {!showCardForm && !showQRCode && (
              <div className="payment-method-selection">
                <h2 className="method-title">Select Payment Method</h2>

                <div className="method-option">
                  <h3 className="method-subtitle">💳 Pay with Card</h3>
                  <div className="card-type-selection">
                    <button
                      className={`card-type-btn ${cardType === 'credit' ? 'selected' : ''}`}
                      onClick={() => handleCardTypeSelect('credit')}
                      disabled={isProcessing}
                      type="button"
                    >
                      <span className="card-icon">🏦</span>
                      <span>Credit Card</span>
                    </button>
                    <button
                      className={`card-type-btn ${cardType === 'debit' ? 'selected' : ''}`}
                      onClick={() => handleCardTypeSelect('debit')}
                      disabled={isProcessing}
                      type="button"
                    >
                      <span className="card-icon">💳</span>
                      <span>Debit Card</span>
                    </button>
                  </div>
                </div>

                <div className="method-option">
                  <h3 className="method-subtitle">📱 Scan QR Code to Pay</h3>
                  <button
                    className="btn btn-scan-to-pay"
                    onClick={handleScanToPay}
                    disabled={isProcessing}
                    type="button"
                  >
                    <span className="qr-icon">◧</span>
                    Generate QR Code
                  </button>
                </div>
              </div>
            )}

            {showCardForm && (
              <div className="card-payment-form">
                <button
                  className="back-button"
                  onClick={() => {
                    setShowCardForm(false);
                    setCardType('');
                    setFormData({
                      cardNumber: '',
                      expiryDate: '',
                      cvv: '',
                      amount: selectedFare.totalFare || selectedFare.price || '0',
                    });
                    setErrors({});
                  }}
                  type="button"
                >
                  ← Back
                </button>

                <h2 className="form-subtitle">
                  {cardType === 'credit' ? 'Credit Card' : 'Debit Card'} Details
                </h2>

                <form onSubmit={handleSubmit} className="payment-form">
                  <div className="payment-form-card">
                    <div className="form-group">
                      <label className="form-label">Card Number *</label>
                      <input
                        type="text"
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        maxLength="16"
                        className={errors.cardNumber ? 'input-error' : ''}
                        disabled={isProcessing}
                      />
                      {errors.cardNumber && (
                        <span className="error-message">{errors.cardNumber}</span>
                      )}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Expiry Date (MM/YY) *</label>
                        <input
                          type="text"
                          name="expiryDate"
                          placeholder="MM/YY"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          maxLength="5"
                          className={errors.expiryDate ? 'input-error' : ''}
                          disabled={isProcessing}
                        />
                        {errors.expiryDate && (
                          <span className="error-message">{errors.expiryDate}</span>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label">CVV *</label>
                        <input
                          type="password"
                          name="cvv"
                          placeholder="123"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          maxLength="3"
                          className={errors.cvv ? 'input-error' : ''}
                          disabled={isProcessing}
                        />
                        {errors.cvv && (
                          <span className="error-message">{errors.cvv}</span>
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Amount to Pay *</label>
                      <div className="amount-display">
                        <span className="amount-value">{formData.amount}</span>
                      </div>
                      <small className="help-text">Amount is fixed and cannot be changed</small>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-pay"
                      disabled={isProcessing || paymentStatus === 'success'}
                    >
                      {isProcessing ? 'Processing...' : 'Confirm Payment'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {showQRCode && (
              <div className="qr-code-section">
                <button
                  className="back-button"
                  onClick={() => {
                    setShowQRCode(false);
                    setPaymentMethod('card');
                  }}
                  type="button"
                >
                  ← Back
                </button>

                <h2 className="form-subtitle">Scan QR Code to Pay</h2>

                <div className="qr-code-container">
                  <p className="qr-instruction">Scan this QR code using any UPI or payment app</p>
                  <div className="qr-code-wrapper">
                    <canvas ref={qrCanvasRef}></canvas>
                  </div>

                  <div className="qr-details">
                    <p><strong>Amount:</strong> {formData.amount}</p>
                    <p className="qr-note">Scan and complete payment in your preferred app</p>
                  </div>

                  <button
                    className="btn btn-pay"
                    onClick={handleQRCodeConfirm}
                    disabled={isProcessing}
                    type="button"
                  >
                    {isProcessing ? 'Processing...' : 'Payment Completed'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="payment-sidebar">
            <div className="session-timer">
              <p className="timer-label">Session expires in</p>
              <p className="timer-display">{formatTime(timeLeft)}</p>
              <p className="timer-sublabel">Complete your payment before session expires</p>
            </div>

            <div className="trip-summary-wrapper">
              <div className="trip-summary-card">
                <div className="trip-summary-header">
                  <h2>Trip Summary</h2>
                  <a href="#" className="details-link">DETAILS {'>'}</a>
                </div>

                <div className="trip-summary-content">
                  <div className="trip-summary-section">
                    <p className="summary-text">{passengerCountDisplay}</p>
                  </div>

                  {journey.cabinClass && (
                    <div className="trip-summary-section">
                      <p className="summary-text">
                        <strong>{journey.cabinClass.charAt(0).toUpperCase() + journey.cabinClass.slice(1).replace('-', ' ')}</strong>
                      </p>
                    </div>
                  )}

                  {journey.date && (
                    <div className="trip-summary-section">
                      <p className="summary-text">{journey.date}</p>
                    </div>
                  )}

                  {selectedFare.duration && (
                    <div className="trip-summary-section">
                      <p className="summary-text">
                        <strong>Duration: {selectedFare.duration}</strong>
                      </p>
                    </div>
                  )}

                  <div className="flight-summary-section">
                    <h3 className="summary-section-title">Flight Details</h3>

                    <div className="flight-route-display">
                      <div className="flight-route-item">
                        <p className="flight-location-value">{journey.departure || 'FROM'}</p>
                      </div>

                      <div className="flight-route-arrow">→</div>

                      <div className="flight-route-item">
                        <p className="flight-location-value">{journey.arrival || 'TO'}</p>
                      </div>
                    </div>

                    <div className="flight-leg-details">
                      <p className="flight-number">{selectedFare.flightNumber || 'Flight --'}</p>
                      <p className="airline-name">{selectedFare.airlineName || 'Airline'}</p>
                    </div>

                    <div className="checkin-details">
                      <p><strong>Check-in:</strong> {selectedFare.checkinBaggage || '15 KG'} | Hand bag: Up to 7KG</p>
                    </div>

                    {/* Selected Seats Section */}
                    {selectedSeats && selectedSeats.length > 0 && (
                      <div className="selected-seats-section">
                        <h4 className="summary-section-title">Selected Seats</h4>
                        <div className="seats-display">
                          <p className="seats-list">{selectedSeats.join(', ')}</p>
                        </div>
                      </div>
                    )}

                    {/* Total Fare Section */}
                    <div className="total-fare-section">
                      <p className="total-fare-label">TOTAL FARE</p>
                      <p className="total-fare-amount">₹{typeof displayTotalFare === 'number' ? displayTotalFare.toLocaleString('en-IN') : displayTotalFare}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Payment;
