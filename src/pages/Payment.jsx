import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/Payment.css';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  // Get data from previous pages
  const journey = location.state?.journey || {};
  const selectedFare = location.state?.selectedFare || {};
  const passengers = location.state?.passengers || {};
  const contactDetails = location.state?.contactDetails || {};

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

  // QR Scanner state
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannerError, setScannerError] = useState(null);
  const [qrScanned, setQrScanned] = useState(false);

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

  // QR Scanner effect - Initialize camera when scanner is shown
  useEffect(() => {
    if (!showQRScanner) return;

    const initCamera = async () => {
      try {
        setScannerError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        setScannerError('Unable to access camera. Please check permissions.');
        console.error('Camera access error:', error);
      }
    };

    initCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [showQRScanner]);

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

  // Handle scan to pay - Open QR scanner
  const handleScanToPay = () => {
    setShowQRScanner(true);
    setQrScanned(false);
    setScannerError(null);
    setPaymentStatus(null);
    setStatusMessage('');
  };

  // Handle successful QR scan
  const handleQRScanned = () => {
    setQrScanned(true);
    setShowQRScanner(false);
    setIsProcessing(true);

    // Close camera stream
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }

    // Simulate processing with valid QR code
    setTimeout(() => {
      setPaymentStatus('success');
      setStatusMessage('Payment Completed via QR Scan!');

      // Store transaction
      const transactions = JSON.parse(localStorage.getItem('paymentHistory') || '[]');
      transactions.push({
        id: Date.now(),
        cardNumber: 'QR Scan',
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

  // Close QR scanner
  const closeQRScanner = () => {
    setShowQRScanner(false);
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
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

            {/* Payment Form */}
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
                  <small className="help-text">Test card: 4111111111111111 (success)</small>
                </div>

                {/* Expiry Date and CVV */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Expiry Date *</label>
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
                      type="text"
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

                {/* Amount */}
                <div className="form-group">
                  <label className="form-label">Amount *</label>
                  <input
                    type="text"
                    name="amount"
                    placeholder="₹ 0.00"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className={errors.amount ? 'input-error' : ''}
                    disabled={true}
                  />
                  {errors.amount && (
                    <span className="error-message">{errors.amount}</span>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-pay"
                  disabled={isProcessing || paymentStatus === 'success'}
                >
                  {isProcessing ? 'Processing...' : 'Pay Now'}
                </button>
              </div>
            </form>

            {/* Scan to Pay Option */}
            <div className="scan-to-pay-section">
              <div className="divider">
                <span>OR</span>
              </div>

              <button
                type="button"
                className="btn btn-scan-to-pay"
                onClick={handleScanToPay}
                disabled={isProcessing || paymentStatus === 'success'}
              >
                <span className="qr-icon">◧</span>
                Scan to Pay
              </button>

              <div className="qr-placeholder">
                <p>Tap to scan QR code from merchant</p>
              </div>
            </div>

            {/* QR Scanner Modal */}
            {showQRScanner && (
              <div className="qr-scanner-modal">
                <div className="qr-scanner-container">
                  <div className="qr-scanner-header">
                    <h2>Scan QR Code</h2>
                    <button
                      className="close-scanner"
                      onClick={closeQRScanner}
                      type="button"
                    >
                      ✕
                    </button>
                  </div>

                  {scannerError ? (
                    <div className="scanner-error">
                      <p>{scannerError}</p>
                      <button
                        className="btn btn-primary"
                        onClick={closeQRScanner}
                        type="button"
                      >
                        Close
                      </button>
                    </div>
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="qr-video"
                      />
                      <div className="qr-overlay">
                        <div className="qr-frame"></div>
                      </div>

                      <div className="scanner-instructions">
                        <p>Position the QR code in the frame</p>
                        <p className="small-text">Align the QR code within the box to scan</p>
                      </div>

                      <div className="scanner-actions">
                        <button
                          className="btn btn-secondary"
                          onClick={closeQRScanner}
                          type="button"
                        >
                          Cancel
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={handleQRScanned}
                          type="button"
                        >
                          Confirm QR Scan
                        </button>
                      </div>
                    </>
                  )}
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
