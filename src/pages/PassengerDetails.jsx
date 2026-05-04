import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AdultPassengerCard from '../components/AdultPassengerCard';
import ChildPassengerCard from '../components/ChildPassengerCard';
import ContactDetailsCard from '../components/ContactDetailsCard';
import '../styles/PassengerDetails.css';

const PassengerDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get journey and selected fare data from location state
  const journey = location.state?.journey || {};
  const selectedFare = location.state?.selectedFare || {};
  
  // Get passenger counts from journey
  const adultCount = journey.passengers?.adults || 1;
  const childCount = journey.passengers?.children || 0;
  const infantCount = journey.passengers?.infants || 0;

  // Initialize passenger data for adults and children
  const [adultPassengers, setAdultPassengers] = useState(
    Array(adultCount).fill(null).map(() => ({
      firstName: '',
      lastName: '',
      gender: '',
    }))
  );

  const [childPassengers, setChildPassengers] = useState(
    Array(childCount).fill(null).map(() => ({
      firstName: '',
      lastName: '',
      gender: '',
      dateOfBirth: '',
    }))
  );

  // Contact details
  const [contactData, setContactData] = useState({
    contactPerson: '',
    country: 'India',
    mobileNumber: '',
    email: '',
  });

  // Expanded state for cards
  const [expandedCards, setExpandedCards] = useState({
    adults: Array(adultCount).fill(false).map((_, i) => i === 0),
    children: Array(childCount).fill(false).map((_, i) => i === 0),
  });


  // Format passenger count display
  const passengerCountDisplay = useMemo(() => {
    const counts = [];
    if (adultCount > 0) counts.push(`${adultCount} Adult${adultCount !== 1 ? 's' : ''}`);
    if (childCount > 0) counts.push(`${childCount} Child${childCount !== 1 ? 'ren' : ''}`);
    if (infantCount > 0) counts.push(`${infantCount} Infant${infantCount !== 1 ? 's' : ''}`);
    return counts.join(', ');
  }, [adultCount, childCount, infantCount]);

  // Handle adult passenger data change
  const handleAdultDataChange = (index, field, value) => {
    const updated = [...adultPassengers];
    updated[index] = { ...updated[index], [field]: value };
    setAdultPassengers(updated);
  };

  // Handle child passenger data change
  const handleChildDataChange = (index, field, value) => {
    const updated = [...childPassengers];
    updated[index] = { ...updated[index], [field]: value };
    setChildPassengers(updated);
  };

  // Handle contact data change
  const handleContactDataChange = (field, value) => {
    setContactData(prev => ({ ...prev, [field]: value }));
  };

  // Handle save for adult passenger
  const handleAdultSave = (index) => {
    // Collapse current, expand next if available
    const newExpanded = { ...expandedCards };
    newExpanded.adults[index] = false;
    if (index + 1 < adultCount) {
      newExpanded.adults[index + 1] = true;
    } else if (childCount > 0) {
      newExpanded.children[0] = true;
    }
    setExpandedCards(newExpanded);
  };

  // Handle save for child passenger
  const handleChildSave = (index) => {
    // Collapse current, expand next if available
    const newExpanded = { ...expandedCards };
    newExpanded.children[index] = false;
    if (index + 1 < childCount) {
      newExpanded.children[index + 1] = true;
    }
    setExpandedCards(newExpanded);
  };

  // Toggle card expand/collapse
  const toggleCardExpand = (type, index) => {
    setExpandedCards(prev => ({
      ...prev,
      [type]: prev[type].map((exp, i) => i === index ? !exp : exp)
    }));
  };

  // Check if all required data is filled
  const isFormComplete = useMemo(() => {
    const allAdultsFilled = adultPassengers.every(p => p.firstName && p.lastName && p.gender);
    const allChildrenFilled = childPassengers.every(p => p.firstName && p.lastName && p.gender && p.dateOfBirth);
    const contactFilled = contactData.mobileNumber && contactData.email && contactData.contactPerson !== '';
    
    return allAdultsFilled && allChildrenFilled && contactFilled;
  }, [adultPassengers, childPassengers, contactData]);

  // Handle form submission
  const handleSubmit = () => {
    if (isFormComplete) {
      navigate('/seat-selection', {
        state: {
          journey,
          selectedFare,
          passengers: {
            adults: adultCount,
            children: childCount,
            infants: infantCount,
          },
          passengerDetails: {
            adults: adultPassengers,
            children: childPassengers,
          },
          contactDetails: contactData,
        },
      });
    }
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
          {/* Left Section - Passenger Cards */}
          <div className="form-section-wrapper">
            {/* Page Title */}
            <h1 className="page-title">Passenger Details</h1>

            {/* Adult Passenger Cards */}
            <div className="passengers-section">
              <h2 className="section-heading">Adults</h2>
              <div className="passengers-list">
                {adultPassengers.map((passenger, index) => (
                  <AdultPassengerCard
                    key={`adult-${index}`}
                    passengerIndex={index}
                    passengerData={passenger}
                    onSave={handleAdultSave}
                    onDataChange={handleAdultDataChange}
                    isExpanded={expandedCards.adults[index]}
                    onToggleExpand={() => toggleCardExpand('adults', index)}
                  />
                ))}
              </div>
            </div>

            {/* Child Passenger Cards */}
            {childCount > 0 && (
              <div className="passengers-section">
                <h2 className="section-heading">Children</h2>
                <div className="passengers-list">
                  {childPassengers.map((passenger, index) => (
                    <ChildPassengerCard
                      key={`child-${index}`}
                      passengerIndex={index}
                      passengerData={passenger}
                      onSave={handleChildSave}
                      onDataChange={handleChildDataChange}
                      isExpanded={expandedCards.children[index]}
                      onToggleExpand={() => toggleCardExpand('children', index)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Contact Details Card */}
            <ContactDetailsCard
              adultPassengers={adultPassengers}
              contactData={contactData}
              onDataChange={handleContactDataChange}
            />
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
            disabled={!isFormComplete}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default PassengerDetails;
