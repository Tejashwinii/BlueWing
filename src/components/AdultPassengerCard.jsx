import React, { useState } from 'react';

const AdultPassengerCard = ({ 
  passengerIndex, 
  passengerData, 
  onSave, 
  onDataChange,
  isExpanded,
  onToggleExpand
}) => {
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // For radio buttons with unique names like "gender-adult-0", extract the field name
    const fieldName = name.includes('gender') ? 'gender' : name;
    onDataChange(passengerIndex, fieldName, value);
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!passengerData.firstName?.trim()) {
      newErrors.firstName = 'First Name is required';
    }
    
    if (!passengerData.lastName?.trim()) {
      newErrors.lastName = 'Last Name is required';
    }
    
    if (!passengerData.gender) {
      newErrors.gender = 'Gender is required';
    }
    
    return newErrors;
  };

  const handleSave = () => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length === 0) {
      onSave(passengerIndex);
      setErrors({});
    } else {
      setErrors(formErrors);
    }
  };

  return (
    <div className="passenger-card adult-card">
      <div 
        className="passenger-card-header"
        onClick={() => onToggleExpand(passengerIndex)}
      >
        <div className="passenger-card-title">
          <span className="passenger-type-badge">Adult {passengerIndex + 1}</span>
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
          {/* First Name */}
          <div className="form-group">
            <input
              type="text"
              name="firstName"
              placeholder="First Name *"
              value={passengerData.firstName || ''}
              onChange={handleInputChange}
              className={errors.firstName ? 'input-error' : ''}
            />
            {errors.firstName && (
              <span className="error-message">{errors.firstName}</span>
            )}
          </div>

          {/* Last Name */}
          <div className="form-group">
            <input
              type="text"
              name="lastName"
              placeholder="Last Name *"
              value={passengerData.lastName || ''}
              onChange={handleInputChange}
              className={errors.lastName ? 'input-error' : ''}
            />
            {errors.lastName && (
              <span className="error-message">{errors.lastName}</span>
            )}
          </div>

          {/* Gender */}
          <div className="form-group">
            <label className="form-label">Gender *</label>
            <div className="gender-selection">
              <div className="radio-option">
                <input
                  type="radio"
                  id={`gender-adult-${passengerIndex}-male`}
                  name={`gender-adult-${passengerIndex}`}
                  value="Male"
                  checked={passengerData.gender === 'Male'}
                  onChange={handleInputChange}
                />
                <label 
                  htmlFor={`gender-adult-${passengerIndex}-male`} 
                  className="radio-label-text"
                >
                  Male
                </label>
              </div>
              <div className="radio-option">
                <input
                  type="radio"
                  id={`gender-adult-${passengerIndex}-female`}
                  name={`gender-adult-${passengerIndex}`}
                  value="Female"
                  checked={passengerData.gender === 'Female'}
                  onChange={handleInputChange}
                />
                <label 
                  htmlFor={`gender-adult-${passengerIndex}-female`} 
                  className="radio-label-text"
                >
                  Female
                </label>
              </div>
            </div>
            {errors.gender && (
              <span className="error-message">{errors.gender}</span>
            )}
          </div>

          {/* Save Button */}
          <button
            type="button"
            className="btn btn-save-passenger"
            onClick={handleSave}
          >
            Save & Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdultPassengerCard;
