import React, { useEffect, useMemo, useRef, useState } from 'react';

const createDigits = () => ['', '', '', '', '', ''];

const OtpCancelModal = ({
  isOpen,
  bookingId,
  contactEmail,
  onClose,
  onSuccess,
  otpAPI,
}) => {
  const [otpDigits, setOtpDigits] = useState(createDigits());
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [fallbackOtp, setFallbackOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRefs = useRef([]);

  const otpValue = useMemo(() => otpDigits.join(''), [otpDigits]);

  useEffect(() => {
    if (!isOpen) {
      setOtpDigits(createDigits());
      setErrorMessage('');
      setInfoMessage('');
      setResendTimer(0);
      setFallbackOtp('');
      setIsSuccess(false);
      return;
    }

    sendOtp();
  }, [isOpen]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => {
      setResendTimer((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  const focusInput = (index) => {
    inputRefs.current[index]?.focus();
  };

  const handleDigitChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const nextDigits = [...otpDigits];
    nextDigits[index] = value;
    setOtpDigits(nextDigits);
    if (value && index < 5) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && otpDigits[index] === '' && index > 0) {
      focusInput(index - 1);
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1);
    }
    if (event.key === 'ArrowRight' && index < 5) {
      focusInput(index + 1);
    }
  };

  const sendOtp = async () => {
    if (!bookingId) return;
    setErrorMessage('');
    setInfoMessage('Sending OTP...');
    setIsSending(true);
    try {
      const response = await otpAPI.sendCancellationOtp(bookingId);
      setInfoMessage(response.message || 'OTP sent to your registered email.');
      if (response.fallbackOtp) {
        setFallbackOtp(response.fallbackOtp);
      }
      setResendTimer(30);
      focusInput(0);
    } catch (error) {
      setErrorMessage(error.message || 'Unable to send OTP. Please try again.');
      setInfoMessage('');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async () => {
    if (isVerifying || otpValue.length < 6) return;
    setErrorMessage('');
    setInfoMessage('Verifying OTP...');
    setIsVerifying(true);
    try {
      const response = await otpAPI.verifyCancellationOtp(bookingId, otpValue);
      setInfoMessage(response.message || 'OTP verified successfully!');
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error) {
      setErrorMessage(error.message || 'OTP verification failed.');
      setInfoMessage('');
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  const maskedEmail = contactEmail ? `${contactEmail.slice(0, 2)}***${contactEmail.slice(contactEmail.indexOf('@'))}` : 'your registered email';

  return (
    <div className="otp-modal-overlay" onClick={onClose}>
      <div className="otp-modal" onClick={(event) => event.stopPropagation()}>
        <div className="otp-modal-header">
          <h3>{isSuccess ? '✅ Ticket Cancelled' : 'Verify OTP & Cancel Ticket'}</h3>
          <button className="otp-close-btn" onClick={onClose}>&times;</button>
        </div>

        {isSuccess ? (
          <div className="otp-success-container">
            <div className="otp-success-icon">✓</div>
            <p className="otp-success-message">Your ticket has been cancelled successfully!</p>
            <p className="otp-success-subtext">Refund will be processed to your account shortly.</p>
          </div>
        ) : (
          <>
            <p className="otp-modal-subtitle">
              Enter the 6-digit OTP sent to <strong>{maskedEmail}</strong> to confirm cancellation.
            </p>

            <div className="otp-input-row">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  ref={(el) => (inputRefs.current[index] = el)}
                  onChange={(event) => handleDigitChange(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  className="otp-digit-input"
                />
              ))}
            </div>

            {fallbackOtp && (
              <div className="otp-fallback-box">
                Your OTP is: <strong>{fallbackOtp}</strong>
              </div>
            )}

            {infoMessage && <p className="otp-info-text">{infoMessage}</p>}
            {errorMessage && <p className="otp-error-text">{errorMessage}</p>}

            <div className="otp-actions-row">
              <button
                className="btn btn-secondary btn-resend-otp"
                onClick={sendOtp}
                disabled={isSending || resendTimer > 0}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
              </button>
              <button
                className="btn btn-primary btn-verify-otp"
                onClick={handleVerify}
                disabled={isVerifying || otpValue.length < 6}
              >
                {isVerifying ? 'Verifying...' : 'Verify & Cancel Ticket'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OtpCancelModal;
