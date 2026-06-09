import React from 'react';

const ContactDetailsCard = ({ formik }) => {
  const contactData = formik.values.contactData;
  const contactErrors = formik.errors.contactData || {};
  const contactTouched = formik.touched.contactData || {};

  const hasError = (field) => {
    return contactErrors[field] && (contactTouched[field] || String(contactData[field] || '').length > 0);
  };

  const adultOptions = formik.values.passengers
    .filter(p => p.type === 'adult' && p.firstName && p.lastName)
    .map((p, idx) => ({
      value: idx,
      label: `${p.firstName} ${p.lastName} (Adult)`,
    }));

  return (
    <div className="contact-details-card">
      <h3 className="card-title">Contact Details</h3>

      <div className="contact-card-content">
        <div className="form-group">
          <label className="form-label">Contact Person *</label>
          <select
            name="contactData.contactPerson"
            value={contactData.contactPerson}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`form-select ${hasError('contactPerson') ? 'input-error' : ''}`}
          >
            <option value="">Select a Contact Person</option>
            {adultOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {hasError('contactPerson') && (
            <span className="error-message">{contactErrors.contactPerson}</span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Country / Territory *</label>
          <select
            name="contactData.country"
            value={contactData.country}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`form-select ${hasError('country') ? 'input-error' : ''}`}
          >
            <option value="India">India</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Canada">Canada</option>
            <option value="Australia">Australia</option>
          </select>
          {hasError('country') && (
            <span className="error-message">{contactErrors.country}</span>
          )}
        </div>

        <div className="form-group">
          <input
            type="tel"
            name="contactData.mobileNumber"
            placeholder="Mobile Number *"
            value={contactData.mobileNumber}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            maxLength="10"
            className={hasError('mobileNumber') ? 'input-error' : ''}
          />
          {hasError('mobileNumber') && (
            <span className="error-message">{contactErrors.mobileNumber}</span>
          )}
        </div>

        <div className="form-group">
          <input
            type="email"
            name="contactData.email"
            placeholder="Email Address *"
            value={contactData.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={hasError('email') ? 'input-error' : ''}
          />
          {hasError('email') && (
            <span className="error-message">{contactErrors.email}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactDetailsCard;
