import React, { useState } from 'react';

const ContactDetailsCard = ({ 
  adultPassengers, 
  contactData, 
  onDataChange 
}) => {
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onDataChange(name, value);
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!contactData.mobileNumber?.trim()) {
      newErrors.mobileNumber = 'Mobile Number is required';
    } else if (!/^[0-9]{10}$/.test(contactData.mobileNumber)) {
      newErrors.mobileNumber = 'Mobile Number must be 10 digits';
    }
    
    if (!contactData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    return newErrors;
  };

  // Build contact person options from adult passengers
  const adultOptions = adultPassengers
    .filter(p => p.firstName && p.lastName)
    .map((p, idx) => ({
      value: idx,
      label: `${p.firstName} ${p.lastName} (Adult)`,
      firstName: p.firstName,
      lastName: p.lastName
    }));

  return (
    <div className="contact-details-card">
      <h3 className="card-title">Contact Details</h3>

      <div className="contact-card-content">
        {/* Contact Person Dropdown */}
        <div className="form-group">
          <label className="form-label">Contact Person *</label>
          <select
            name="contactPerson"
            value={contactData.contactPerson || ''}
            onChange={handleInputChange}
            className="form-select"
          >
            <option value="">Select a Contact Person</option>
            {adultOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.contactPerson && (
            <span className="error-message">{errors.contactPerson}</span>
          )}
        </div>

        {/* Country / Territory Dropdown */}
        <div className="form-group">
          <label className="form-label">Country / Territory *</label>
          <select
            name="country"
            value={contactData.country || 'India'}
            onChange={handleInputChange}
            className="form-select"
          >
            <option value="India">India</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Canada">Canada</option>
            <option value="Australia">Australia</option>
          </select>
        </div>

        {/* Mobile Number */}
        <div className="form-group">
          <input
            type="tel"
            name="mobileNumber"
            placeholder="Mobile Number *"
            value={contactData.mobileNumber || ''}
            onChange={handleInputChange}
            maxLength="10"
            className={errors.mobileNumber ? 'input-error' : ''}
          />
          {errors.mobileNumber && (
            <span className="error-message">{errors.mobileNumber}</span>
          )}
        </div>

        {/* Email Address */}
        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Email Address *"
            value={contactData.email || ''}
            onChange={handleInputChange}
            className={errors.email ? 'input-error' : ''}
          />
          {errors.email && (
            <span className="error-message">{errors.email}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactDetailsCard;
