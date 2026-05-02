import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/PassengerDetails.css';

const PassengerDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get journey and selected fare data from location state
  const journey = location.state?.journey || {};
  const selectedFare = location.state?.selectedFare || {};
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    dateOfBirth: '',
    gender: '',
    hasChildren: 'No',
    infantsBelow2: '',
    childrenBetween2To3: '',
    specialAssistance: 'No',
    assistanceType: [],
    otherSpecialNeeds: '',
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});

  // Determine if Next button should be enabled
  const isNextButtonEnabled = useMemo(() => {
    const hasFirstName = formData.firstName.trim() !== '';
    const hasLastName = formData.lastName.trim() !== '';
    const hasEmail = formData.email.trim() !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    const hasMobileNumber = formData.mobileNumber.trim() !== '' && /^[0-9]{10}$/.test(formData.mobileNumber);
    const hasDateOfBirth = formData.dateOfBirth !== '' && new Date(formData.dateOfBirth) < new Date();
    const hasGender = formData.gender !== '';
    
    return hasFirstName && hasLastName && hasEmail && hasMobileNumber && hasDateOfBirth && hasGender;
  }, [formData]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  // Handle checkbox changes for special assistance
  const handleAssistanceCheckboxChange = (e) => {
    const { value, checked } = e.target;
    let updatedAssistanceType = [...formData.assistanceType];

    if (checked) {
      updatedAssistanceType.push(value);
    } else {
      updatedAssistanceType = updatedAssistanceType.filter((item) => item !== value);
    }

    setFormData({
      ...formData,
      assistanceType: updatedAssistanceType,
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First Name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile Number is required';
    } else if (!/^[0-9]{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Mobile Number must be 10 digits';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of Birth is required';
    } else {
      const selectedDate = new Date(formData.dateOfBirth);
      const today = new Date();
      if (selectedDate >= today) {
        newErrors.dateOfBirth = 'Date of Birth must be a past date';
      }
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm();

    if (Object.keys(formErrors).length === 0) {
      navigate('/seat-selection', {
        state: {
          journey,
          selectedFare,
          passengerDetails: formData,
          passengers: journey.passengers || {
            adults: passengerCount,
            children: 0,
            infants: 0,
          },
          passengerCount,
          passengerLabel: passengerCountDisplay,
        },
      });
    } else {
      setErrors(formErrors);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      mobileNumber: '',
      dateOfBirth: '',
      gender: '',
      hasChildren: 'No',
      infantsBelow2: '',
      childrenBetween2To3: '',
      specialAssistance: 'No',
      assistanceType: [],
      otherSpecialNeeds: '',
    });
    setErrors({});
    setSuccessMessage('');
  };

  // Format passenger count display
  const passengerCountDisplay = useMemo(() => {
    const { adults = 1, children = 0, infants = 0 } = journey.passengers || {};
    const counts = [];
    if (adults > 0) counts.push(`${adults} Adult${adults !== 1 ? 's' : ''}`);
    if (children > 0) counts.push(`${children} Child${children !== 1 ? 'ren' : ''}`);
    if (infants > 0) counts.push(`${infants} Infant${infants !== 1 ? 's' : ''}`);
    return counts.join(', ');
  }, [journey.passengers]);

  const passengerCount = useMemo(() => {
    const { adults = 1, children = 0, infants = 0 } = journey.passengers || {};
    return Math.max(Number(adults) + Number(children) + Number(infants), 1);
  }, [journey.passengers]);

  // Get fare details to display in trip summary
  const getBaggageFromFare = () => {
    // Extract baggage info from selected fare if available
    // This could be enhanced based on the fare data structure
    return ['Baggage allowance as per fare type'];
  };

  return (
    <>
      <Navbar minimalMode={true} />
      <div className="passenger-details-page">
        {/* Compact Route Card Below Navbar */}
        <div className="compact-route-card">
          <div className="route-display">
            <span className="route-from">{journey.departure || 'FROM'}</span>
            <span className="route-arrow">→</span>
            <span className="route-to">{journey.arrival || 'TO'}</span>
          </div>
        </div>

        <div className="passenger-container">
          {/* Left Section - Form */}
          <div className="form-section-wrapper">
            {/* Passenger Details Heading */}
            <h1 className="page-title">Passenger Details</h1>

            {successMessage && (
              <div className="success-message">{successMessage}</div>
            )}

            <form onSubmit={handleSubmit} className="passenger-form">
              {/* Passenger Info Card */}
              <div className="passenger-info-card">
                {/* Important Notice */}
                <div className="important-notice">
                  <p>
                    <strong>Important:</strong> For Domestic Travelling - Please enter your name exactly as it appears in your Government ID proofs.
                  </p>
                </div>

                {/* Gender Selection */}
                <div className="form-group">
                  <label className="form-label">Gender *</label>
                  <div className="gender-selection">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="gender"
                        value="Male"
                        checked={formData.gender === 'Male'}
                        onChange={handleInputChange}
                      />
                      <span>Male</span>
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="gender"
                        value="Female"
                        checked={formData.gender === 'Female'}
                        onChange={handleInputChange}
                      />
                      <span>Female</span>
                    </label>
                  </div>
                  {errors.gender && (
                    <span className="error-message">{errors.gender}</span>
                  )}
                </div>

                {/* First and Last Name */}
                <div className="form-row">
                  <div className="form-group">
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      placeholder="First Name *"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={errors.firstName ? 'input-error' : ''}
                    />
                    {errors.firstName && (
                      <span className="error-message">{errors.firstName}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      placeholder="Last Name *"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={errors.lastName ? 'input-error' : ''}
                    />
                    {errors.lastName && (
                      <span className="error-message">{errors.lastName}</span>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="form-group">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Email Address *"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'input-error' : ''}
                  />
                  {errors.email && (
                    <span className="error-message">{errors.email}</span>
                  )}
                </div>

                {/* Date of Birth */}
                <div className="form-group">
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className={errors.dateOfBirth ? 'input-error' : ''}
                  />
                  {errors.dateOfBirth && (
                    <span className="error-message">{errors.dateOfBirth}</span>
                  )}
                </div>

                {/* Mobile Number */}
                <div className="form-group">
                  <input
                    type="tel"
                    id="mobileNumber"
                    name="mobileNumber"
                    placeholder="Mobile Number *"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    className={errors.mobileNumber ? 'input-error' : ''}
                    maxLength="10"
                  />
                  {errors.mobileNumber && (
                    <span className="error-message">{errors.mobileNumber}</span>
                  )}
                </div>
              </div>
            </form>

            {/* Children / Infant Details Section - Below Form */}
            <div className="children-assistance-wrapper">
              <div className="children-section">
                <h2>Children / Infant Details</h2>

                <div className="form-group">
                  <label htmlFor="hasChildren">Are children travelling with you? *</label>
                  <select
                    id="hasChildren"
                    name="hasChildren"
                    value={formData.hasChildren}
                    onChange={handleInputChange}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                {/* Conditional rendering for children details */}
                {formData.hasChildren === 'Yes' && (
                  <div className="children-details">
                    <p>
                      Please specify the number of children travelling with you
                    </p>
                    {errors.childrenDetails && (
                      <span className="error-message">{errors.childrenDetails}</span>
                    )}

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="infantsBelow2">
                          Infants Below 2 Years
                        </label>
                        <input
                          type="number"
                          id="infantsBelow2"
                          name="infantsBelow2"
                          placeholder="0"
                          value={formData.infantsBelow2}
                          onChange={handleInputChange}
                          className={errors.infantsBelow2 ? 'input-error' : ''}
                          min="0"
                        />
                        {errors.infantsBelow2 && (
                          <span className="error-message">{errors.infantsBelow2}</span>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="childrenBetween2To3">
                          Children 2-3 Years
                        </label>
                        <input
                          type="number"
                          id="childrenBetween2To3"
                          name="childrenBetween2To3"
                          placeholder="0"
                          value={formData.childrenBetween2To3}
                          onChange={handleInputChange}
                          className={errors.childrenBetween2To3 ? 'input-error' : ''}
                          min="0"
                        />
                        {errors.childrenBetween2To3 && (
                          <span className="error-message">
                            {errors.childrenBetween2To3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Special Assistance Section - Below Form */}
              <div className="assistance-section">
                <h2>Special Assistance / Disability Support</h2>

                <div className="form-group">
                  <label htmlFor="specialAssistance">
                    Do you require special assistance? *
                  </label>
                  <select
                    id="specialAssistance"
                    name="specialAssistance"
                    value={formData.specialAssistance}
                    onChange={handleInputChange}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                {/* Conditional rendering for assistance options */}
                {formData.specialAssistance === 'Yes' && (
                  <div className="assistance-details">
                    <p>
                      Please select the assistance you require (select all that apply)
                    </p>
                    {errors.assistanceType && (
                      <span className="error-message">{errors.assistanceType}</span>
                    )}

                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          value="Wheelchair"
                          checked={formData.assistanceType.includes('Wheelchair')}
                          onChange={handleAssistanceCheckboxChange}
                        />
                        Wheelchair Assistance
                      </label>

                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          value="Visual Impairment"
                          checked={formData.assistanceType.includes('Visual Impairment')}
                          onChange={handleAssistanceCheckboxChange}
                        />
                        Visual Impairment Assistance
                      </label>

                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          value="Hearing Impairment"
                          checked={formData.assistanceType.includes('Hearing Impairment')}
                          onChange={handleAssistanceCheckboxChange}
                        />
                        Hearing Impairment Assistance
                      </label>

                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          value="Elderly Passenger"
                          checked={formData.assistanceType.includes('Elderly Passenger')}
                          onChange={handleAssistanceCheckboxChange}
                        />
                        Elderly Passenger Assistance
                      </label>

                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          value="Other"
                          checked={formData.assistanceType.includes('Other')}
                          onChange={handleAssistanceCheckboxChange}
                        />
                        Other Special Needs
                      </label>
                    </div>

                    {/* Text input for other special needs */}
                    {formData.assistanceType.includes('Other') && (
                      <div className="form-group">
                        <label htmlFor="otherSpecialNeeds">
                          Please describe your special needs
                        </label>
                        <textarea
                          id="otherSpecialNeeds"
                          name="otherSpecialNeeds"
                          placeholder="Describe your special needs..."
                          value={formData.otherSpecialNeeds}
                          onChange={handleInputChange}
                          rows="4"
                          className="textarea-input"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Trip Summary Card */}
          <div className="trip-summary-wrapper">
            <div className="trip-summary-card">
              <div className="trip-summary-header">
                <h2>Trip Summary</h2>
                <a href="#" className="details-link">DETAILS {'>'}</a>
              </div>
              
              <div className="trip-summary-content">
                {/* Passenger Count */}
                <div className="trip-summary-section">
                  <p className="summary-text">{passengerCountDisplay || '1 Adult'}</p>
                </div>

                {/* Cabin Class / Fare Type */}
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

        {/* Bottom Fixed Next Button */}
        <div className="passenger-actions">
          <button 
            type="button" 
            className="btn btn-next"
            onClick={handleSubmit}
            disabled={!isNextButtonEnabled}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default PassengerDetails;
