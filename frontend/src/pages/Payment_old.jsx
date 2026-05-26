import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode.react';
import Navbar from '../components/Navbar';
import '../styles/Payment.css';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get data from previous pages
  const journey = location.state?.journey || {};
  const selectedFare = location.state?.selectedFare || {};
  const passengers = location.state?.passengers || {};
  const contactDetails = location.state?.contactDetails || {};

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'qr'
  const [cardType, setCardType] = useState(''); // 'credit', 'debit', ''
  const [showCardForm, setShowCardForm] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  // Payment form state
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    amount: selectedFare.price || '0',
  });

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // null, 'success', 'failure'
  const [statusMessage, setStatusMessage] = useState('');

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  // Countdown timer effect
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

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Format passenger count display
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
      amount: selectedFare.price || '0',
    });
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Format card number (only digits)
    if (name === 'cardNumber') {
      processedValue = value.replace(/\D/g, '').slice(0, 16);
    }

    // Format expiry date (MM/YY)
    if (name === 'expiryDate') {
      let digitsOnly = value.replace(/\D/g, '').slice(0, 4);
      if (digitsOnly.length >= 2) {
        digitsOnly = digitsOnly.slice(0, 2) + '/' + digitsOnly.slice(2, 4);
      }
      processedValue = digitsOnly;
    }

    // Format CVV (only digits)
    if (name === 'cvv') {
      processedValue = value.replace(/\D/g, '').slice(0, 3);
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));

    // Clear error for this field
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

    // Amount is pre-filled and should always be present, no validation error needed
    // Only validate if amount is explicitly invalid (NaN or negative)
    if (formData.amount && isNaN(formData.amount)) {
      newErrors.amount = 'Invalid amount';
    }

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm();

    if (Object.keys(formErrors).length === 0) {
      setIsProcessing(true);
      setPaymentStatus(null);

      // Simulate API call with delay
      setTimeout(() => {
        // Check card number for success/failure
        if (formData.cardNumber === '4111111111111111') {
          setPaymentStatus('success');
          setStatusMessage('Payment Successful! Your transaction has been completed.');

          // Store transaction in localStorage
          const transactions = JSON.parse(localStorage.getItem('paymentHistory') || '[]');
          transactions.push({
            id: Date.now(),
            cardNumber: `****${formData.cardNumber.slice(-4)}`,
            amount: formData.amount,
            date: new Date().toLocaleString(),
            status: 'success',
          });
          localStorage.setItem('paymentHistory', JSON.stringify(transactions));

          // Navigate to success page after 2 seconds
          setTimeout(() => {
            navigate('/payment-success', {
              state: {
                journey,
                selectedFare,
                passengers,
                contactDetails,
                transactionId: Date.now(),
              },
            });
          }, 2000);
        } else if (formData.cardNumber === '4000000000000002') {
          setPaymentStatus('failure');
          setStatusMessage('Payment Failed. Please try again with a different card.');

          // Store transaction in localStorage
          const transactions = JSON.parse(localStorage.getItem('paymentHistory') || '[]');
          transactions.push({
            id: Date.now(),
            cardNumber: `****${formData.cardNumber.slice(-4)}`,
            amount: formData.amount,
            date: new Date().toLocaleString(),
            status: 'failure',
          });
          localStorage.setItem('paymentHistory', JSON.stringify(transactions));
        } else {
          setPaymentStatus('failure');
          setStatusMessage('Invalid test card. Use 4111111111111111 (success) or 4000000000000002 (failure).');
        }

        setIsProcessing(false);
      }, 2000);
    } else {
      setErrors(formErrors);
    }
  };

  // Handle scan to pay - Show QR Code
  const handleScanToPay = () => {
    setPaymentMethod('qr');
    setShowQRCode(true);
    setCardType('');
    setShowCardForm(false);
    setPaymentStatus(null);
    setStatusMessage('');
  };

  // Handle QR Code confirmation
  const handleQRCodeConfirm = () => {
    setIsProcessing(true);

    // Simulate processing with QR payment
    setTimeout(() => {
      setPaymentStatus('success');
      setStatusMessage('Payment Completed via QR Code!');

      // Store transaction
      const transactions = JSON.parse(localStorage.getItem('paymentHistory') || '[]');
      transactions.push({
        id: Date.now(),
        cardNumber: 'QR Payment',
        amount: formData.amount,
        date: new Date().toLocaleString(),
        status: 'success',
      });
      localStorage.setItem('paymentHistory', JSON.stringify(transactions));

      // Navigate to success page after 2 seconds
      setTimeout(() => {
        navigate('/payment-success', {
          state: {
            journey,
            selectedFare,
            passengers,
            contactDetails,
            transactionId: Date.now(),
          },
        });
      }, 2000);

      setIsProcessing(false);
    }, 1500);
  };

  return (
    <>
      <Navbar minimalMode={true} />
      <div className="payment-page">
        {/* Compact Route Card Below Navbar */}
        <div className="compact-route-card">
          <div className="route-display">
            <span className="route-from">{journey.departure || 'FROM'}</span>
            <span className="route-arrow">→</span>
            <span className="route-to">{journey.arrival || 'TO'}</span>
          </div>
        </div>

        <div className="payment-container">
          {/* Left Section - Payment Form */}
          <div className="payment-form-wrapper">
            <h1 className="page-title">Payment</h1>

            {/* Payment Status Messages */}
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

            {/* Payment Method Selection */}
            {!showCardForm && !showQRCode && (
              <div className="payment-method-selection">
                <h2 className="method-title">Select Payment Method</h2>

                {/* Card Payment Option */}
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

                {/* QR Code Payment Option */}
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

            {/* Card Payment Form */}
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
                      amount: selectedFare.price || '0',
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
                    {/* Card Number */}
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

                    {/* Expiry Date and CVV */}
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

                    {/* Amount Display (Non-editable) */}
                    <div className="form-group">
                      <label className="form-label">Amount to Pay *</label>
                      <div className="amount-display">
                        <span className="amount-value">{formData.amount}</span>
                      </div>
                      <small className="help-text">Amount is fixed and cannot be changed</small>
                    </div>

                    {/* Submit Button */}
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

            {/* QR Code Display */}
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
                    <QRCode
                      value={JSON.stringify({
                        amount: selectedFare.price || '0',
                        transactionId: Date.now(),
                        merchant: 'BlueWing Airlines',
                      })}
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
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

          {/* Right Section - Trip Summary & Session Timer */}
          <div className="payment-sidebar">
            {/* Session Timer */}
            <div className="session-timer">
              <p className="timer-label">Session expires in</p>
              <p className="timer-display">{formatTime(timeLeft)}</p>
              <p className="timer-sublabel">Complete your payment before session expires</p>
            </div>

            {/* Trip Summary Card */}
            <div className="trip-summary-wrapper">
              <div className="trip-summary-card">
                <div className="trip-summary-header">
                  <h2>Trip Summary</h2>
                  <a href="#" className="details-link">DETAILS {'>'}</a>
                </div>

                <div className="trip-summary-content">
                  {/* Passenger Count */}
                  <div className="trip-summary-section">
                    <p className="summary-text">{passengerCountDisplay}</p>
                  </div>

                  {/* Cabin Class */}
                  {journey.cabinClass && (
                    <div className="trip-summary-section">
                      <p className="summary-text">
                        <strong>{journey.cabinClass.charAt(0).toUpperCase() + journey.cabinClass.slice(1).replace('-', ' ')}</strong>
                      </p>
                    </div>
                  )}

                  {/* Departure Date */}
                  {journey.date && (
                    <div className="trip-summary-section">
                      <p className="summary-text">{journey.date}</p>
                    </div>
                  )}

                  {/* Journey Duration */}
                  {selectedFare.duration && (
                    <div className="trip-summary-section">
                      <p className="summary-text">
                        <strong>Duration: {selectedFare.duration}</strong>
                      </p>
                    </div>
                  )}

                  {/* Flight Details Section */}
                  <div className="flight-summary-section">
                    <h3 className="summary-section-title">Flight Details</h3>

                    {/* Flight Route */}
                    <div className="flight-route-display">
                      <div className="flight-route-item">
                        <p className="flight-location-value">{journey.departure || 'FROM'}</p>
                      </div>

                      <div className="flight-route-arrow">→</div>

                      <div className="flight-route-item">
                        <p className="flight-location-value">{journey.arrival || 'TO'}</p>
                      </div>
                    </div>

                    {/* Flight Number and Airline */}
                    <div className="flight-leg-details">
                      <p className="flight-number">{selectedFare.flightNumber || 'Flight --'}</p>
                      <p className="airline-name">{selectedFare.airlineName || 'Airline'}</p>
                    </div>

                    {/* Check-in Details */}
                    <div className="checkin-details">
                      <p><strong>Check-in:</strong> {selectedFare.checkinBaggage || '15 KG'} | Hand bag: Up to 7KG</p>
                    </div>

                    {/* Total Fare */}
                    <div className="total-fare-section">
                      <p className="total-fare-label">TOTAL FARE</p>
                      <p className="total-fare-amount">{selectedFare.price || '₹ --'}</p>
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
