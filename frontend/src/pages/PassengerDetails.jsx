import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AdultPassengerCard from '../components/AdultPassengerCard';
import ChildPassengerCard from '../components/ChildPassengerCard';
import ContactDetailsCard from '../components/ContactDetailsCard';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import '../styles/PassengerDetails.css';

const passengerSchema = Yup.object().shape({
  passengers: Yup.array().of(
    Yup.object().shape({
      type: Yup.string().required(),
      firstName: Yup.string()
        .trim()
        .required('First Name is required')
        .matches(/^[A-Za-z\s]+$/, 'Only characters and spaces are allowed'),
      lastName: Yup.string()
        .trim()
        .required('Last Name is required')
        .matches(/^[A-Za-z\s]+$/, 'Only characters and spaces are allowed'),
      gender: Yup.string().required('Gender is required'),
      dateOfBirth: Yup.date().when('type', {
        is: 'child',
        then: () => Yup.date()
          .required('Date of Birth is required')
          .max(new Date(), 'Date of Birth must be a past date')
          .test('is-child', 'Child age must be 12 years or below', function (value) {
            if (!value) return true;
            const birthDate = new Date(value);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
            return age <= 12;
          }),
        otherwise: () => Yup.date().notRequired()
      }),
      age: Yup.number()
        .required('Age is required')
        .positive('Age must be a positive number')
        .integer('Age must be an integer')
    })
  ),
  contactData: Yup.object().shape({
    contactPerson: Yup.string().required('Contact Person is required'),
    country: Yup.string().required('Country / Territory is required'),
    mobileNumber: Yup.string()
      .trim()
      .required('Mobile Number is required')
      .matches(/^[0-9]{10}$/, 'Mobile Number must be 10 digits'),
    email: Yup.string()
      .trim()
      .required('Email is required')
      .email('Please enter a valid email address'),
  })
});

const PassengerDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const journey = location.state?.journey || {};
  const selectedFare = location.state?.selectedFare || {};
  const cabinClass = location.state?.cabinClass || journey.cabinClass || 'economy';
  
  const adultCount = journey.passengers?.adults || 1;
  const childCount = journey.passengers?.children || 0;
  const infantCount = journey.passengers?.infants || 0;

  const initialPassengers = [];
  for (let i = 0; i < adultCount; i++) {
    initialPassengers.push({ type: 'adult', firstName: '', lastName: '', gender: '', age: '' });
  }
  for (let i = 0; i < childCount; i++) {
    initialPassengers.push({ type: 'child', firstName: '', lastName: '', gender: '', dateOfBirth: '', age: '' });
  }

  const [expandedCards, setExpandedCards] = useState(
    Array(initialPassengers.length).fill(false).map((_, i) => i === 0)
  );

  const formik = useFormik({
    initialValues: {
      passengers: initialPassengers,
      contactData: {
        contactPerson: '',
        country: 'India',
        mobileNumber: '',
        email: '',
      }
    },
    validationSchema: passengerSchema,
    validateOnChange: true,
    onSubmit: (values) => {
      const pricePerPerson = selectedFare.rawPrice || 0;
      const totalFareCalc = pricePerPerson * (adultCount + childCount);
      navigate('/seat-selection', {
        state: {
          journey,
          cabinClass,
          selectedFare: {
            ...selectedFare,
            totalFare: totalFareCalc,
          },
          passengers: {
            adults: values.passengers.filter(p => p.type === 'adult'),
            children: values.passengers.filter(p => p.type === 'child'),
            infants: infantCount,
          },
          passengerDetails: {
            passengers: values.passengers,
          },
          contactDetails: values.contactData,
        },
      });
    }
  });

  const passengerCountDisplay = useMemo(() => {
    const counts = [];
    if (adultCount > 0) counts.push(`${adultCount} Adult${adultCount !== 1 ? 's' : ''}`);
    if (childCount > 0) counts.push(`${childCount} Child${childCount !== 1 ? 'ren' : ''}`);
    if (infantCount > 0) counts.push(`${infantCount} Infant${infantCount !== 1 ? 's' : ''}`);
    return counts.join(', ');
  }, [adultCount, childCount, infantCount]);

  const totalPassengers = useMemo(() => adultCount + childCount, [adultCount, childCount]);

  const totalFare = useMemo(() => {
    const pricePerPerson = selectedFare.rawPrice || 0;
    const total = pricePerPerson * totalPassengers;
    if (typeof total === 'number') {
      return `₹${total.toLocaleString('en-IN')}`;
    }
    return selectedFare.price || '₹ --';
  }, [selectedFare, totalPassengers]);

  const handleAdultSave = async (index) => {
    const errors = await formik.validateForm();
    if (errors.passengers && errors.passengers[index]) {
      const fields = ['firstName', 'lastName', 'gender', 'age'];
      fields.forEach(field => {
        formik.setFieldTouched(`passengers[${index}].${field}`, true, true);
      });
      return;
    }
    
    const newExpanded = [...expandedCards];
    newExpanded[index] = false;
    if (index + 1 < newExpanded.length) {
      newExpanded[index + 1] = true;
    }
    setExpandedCards(newExpanded);
  };

  const handleChildSave = async (index) => {
    const errors = await formik.validateForm();
    if (errors.passengers && errors.passengers[index]) {
      const fields = ['firstName', 'lastName', 'gender', 'dateOfBirth', 'age'];
      fields.forEach(field => {
        formik.setFieldTouched(`passengers[${index}].${field}`, true, true);
      });
      return;
    }

    const newExpanded = [...expandedCards];
    newExpanded[index] = false;
    if (index + 1 < newExpanded.length) {
      newExpanded[index + 1] = true;
    }
    setExpandedCards(newExpanded);
  };

  const toggleCardExpand = (index) => {
    setExpandedCards(prev => prev.map((exp, i) => i === index ? !exp : exp));
  };

  return (
    <>
      <Navbar minimalMode={true} />
      <div className="passenger-details-page">
        <div className="compact-route-card">
          <div className="route-display">
            <span className="route-from">{journey.departure || 'FROM'}</span>
            <span className="route-arrow">→</span>
            <span className="route-to">{journey.arrival || 'TO'}</span>
          </div>
        </div>

        <div className="passenger-container">
          <div className="form-section-wrapper">
            <h1 className="page-title">Passenger Details</h1>

            <form onSubmit={formik.handleSubmit}>
              <div className="passengers-section">
                <h2 className="section-heading">Adults</h2>
                <div className="passengers-list">
                  {formik.values.passengers.filter(p => p.type === 'adult').map((passenger, index) => {
                    const originalIndex = formik.values.passengers.findIndex(p => p === passenger);
                    return (
                    <AdultPassengerCard
                      key={`adult-${index}`}
                      formik={formik}
                      passengerIndex={originalIndex}
                      onSave={() => handleAdultSave(originalIndex)}
                      isExpanded={expandedCards[originalIndex]}
                      onToggleExpand={() => toggleCardExpand(originalIndex)}
                    />
                  )})}
                </div>
              </div>

              {childCount > 0 && (
                <div className="passengers-section">
                  <h2 className="section-heading">Children</h2>
                  <div className="passengers-list">
                    {formik.values.passengers.filter(p => p.type === 'child').map((passenger, index) => {
                      const originalIndex = formik.values.passengers.findIndex(p => p === passenger);
                      return (
                      <ChildPassengerCard
                        key={`child-${index}`}
                        formik={formik}
                        passengerIndex={originalIndex}
                        onSave={() => handleChildSave(originalIndex)}
                        isExpanded={expandedCards[originalIndex]}
                        onToggleExpand={() => toggleCardExpand(originalIndex)}
                      />
                    )})}
                  </div>
                </div>
              )}

              <ContactDetailsCard formik={formik} />
            </form>
          </div>

          <div className="trip-summary-wrapper">
            <div className="trip-summary-card">
              <div className="trip-summary-header">
                <h2>Trip Summary</h2>
                <a href="#" className="details-link">DETAILS {'>'}</a>
              </div>
              
              <div className="trip-summary-content">
                <div className="trip-summary-section">
                  <p className="summary-text">{passengerCountDisplay || '1 Adult'}</p>
                </div>

                {cabinClass && (
                  <div className="trip-summary-section">
                    <p className="summary-text">
                      <strong>{cabinClass.charAt(0).toUpperCase() + cabinClass.slice(1).replace('-', ' ')}</strong>
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

                  <div className="total-fare-section">
                    <p className="total-fare-label">TOTAL FARE</p>
                    <p className="total-fare-amount">{totalFare}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="passenger-actions">
          <button 
            type="button" 
            className="btn btn-next"
            onClick={formik.handleSubmit}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default PassengerDetails;
