import React, { useMemo } from 'react';

const ChildPassengerCard = ({ 
  formik,
  passengerIndex, 
  onSave, 
  isExpanded,
  onToggleExpand
}) => {
  const basePath = `passengers[${passengerIndex}]`;
  const passengerData = formik.values.passengers[passengerIndex] || {};
  const passengerErrors = formik.errors.passengers?.[passengerIndex] || {};
  const passengerTouched = formik.touched.passengers?.[passengerIndex] || {};

  const hasError = (field) => {
    return passengerErrors[field] && (passengerTouched[field] || String(passengerData[field] || '').length > 0);
  };

  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const childAge = useMemo(() => calculateAge(passengerData.dateOfBirth), [passengerData.dateOfBirth]);

  return (
    <div className="passenger-card child-card">
      <div 
        className="passenger-card-header"
        onClick={() => onToggleExpand(passengerIndex)}
      >
        <div className="passenger-card-title">
          <span className="passenger-type-badge">Child {passengerIndex + 1}</span>
          <span className="passenger-name">
            {passengerData.firstName && passengerData.lastName 
              ? `${passengerData.firstName} ${passengerData.lastName}`
              : 'Enter Details'}
          </span>
        </div>
        <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
          {isExpanded ? '▼' : '▶'}
        </span>
      </div>

      {isExpanded && (
        <div className="passenger-card-content">
          <div className="form-group">
            <input
              type="text"
              name={`${basePath}.firstName`}
              placeholder="First Name *"
              value={passengerData.firstName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={hasError('firstName') ? 'input-error' : ''}
            />
            {hasError('firstName') && (
              <span className="error-message">{passengerErrors.firstName}</span>
            )}
          </div>

          <div className="form-group">
            <input
              type="text"
              name={`${basePath}.lastName`}
              placeholder="Last Name *"
              value={passengerData.lastName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={hasError('lastName') ? 'input-error' : ''}
            />
            {hasError('lastName') && (
              <span className="error-message">{passengerErrors.lastName}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Gender *</label>
            <div className="gender-selection">
              <div className="radio-option">
                <input
                  type="radio"
                  id={`gender-child-${passengerIndex}-male`}
                  name={`${basePath}.gender`}
                  value="Male"
                  checked={passengerData.gender === 'Male'}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <label htmlFor={`gender-child-${passengerIndex}-male`} className="radio-label-text">
                  Male
                </label>
              </div>
              <div className="radio-option">
                <input
                  type="radio"
                  id={`gender-child-${passengerIndex}-female`}
                  name={`${basePath}.gender`}
                  value="Female"
                  checked={passengerData.gender === 'Female'}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <label htmlFor={`gender-child-${passengerIndex}-female`} className="radio-label-text">
                  Female
                </label>
              </div>
            </div>
            {hasError('gender') && (
              <span className="error-message">{passengerErrors.gender}</span>
            )}
          </div>

          <div className="form-group">
            <input
              type="date"
              name={`${basePath}.dateOfBirth`}
              value={passengerData.dateOfBirth}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={hasError('dateOfBirth') ? 'input-error' : ''}
            />
            {childAge !== null && childAge <= 12 && (
              <span className="info-message">Age: {childAge} years</span>
            )}
            {hasError('dateOfBirth') && (
              <span className="error-message">{passengerErrors.dateOfBirth}</span>
            )}
          </div>

          <div className="form-group">
            <input
              type="number"
              name={`${basePath}.age`}
              placeholder="Age *"
              value={passengerData.age}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              min="1"
              className={hasError('age') ? 'input-error' : ''}
            />
            {hasError('age') && (
              <span className="error-message">{passengerErrors.age}</span>
            )}
          </div>

          <button
            type="button"
            className="btn btn-save-passenger"
            onClick={() => onSave(passengerIndex)}
          >
            Save & Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ChildPassengerCard;
