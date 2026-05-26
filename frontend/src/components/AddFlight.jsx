import React, { useEffect, useState } from 'react';
import { getDuration, airports, calculateArrivalTime } from '../data/flightdetails';
import '../styles/AddFlight.css';

const getEmptyFormData = () => ({
  airline: '',
  flightNumber: '',
  from: '',
  to: '',
  departureTime: '',
  arrivalTime: '',
});

const AddFlight = ({ onSave, onCancel, initialFlight = null, mode = 'add' }) => {
  const [formData, setFormData] = useState({
    ...getEmptyFormData(),
  });

  useEffect(() => {
    if (initialFlight) {
      setFormData({
        airline: initialFlight.airline || '',
        flightNumber: initialFlight.flightNumber || '',
        from: initialFlight.from || initialFlight.departure || '',
        to: initialFlight.to || initialFlight.arrival || '',
        departureTime: initialFlight.departureTime || '',
        arrivalTime: initialFlight.arrivalTime || '',
      });
    } else {
      setFormData(getEmptyFormData());
    }
  }, [initialFlight]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-calculate arrival time when departure time or route changes
    if (name === 'departureTime' || name === 'from' || name === 'to') {
      updateArrivalTime({
        ...formData,
        [name]: value
      });
    }
  };

  const updateArrivalTime = (data) => {
    if (data.from && data.to && data.departureTime) {
      const duration = getDuration(data.from, data.to);
      if (duration) {
        const arrival = calculateArrivalTime(data.departureTime, duration);
        setFormData(prev => ({
          ...prev,
          arrivalTime: arrival
        }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.airline || !formData.flightNumber || !formData.from || 
        !formData.to || !formData.departureTime) {
      alert('Please fill all required fields');
      return;
    }

    onSave({
      ...formData,
      id: initialFlight?.id || Date.now(),
    });
  };

  return (
    <div className="add-flight-modal">
      <div className="modal-content">
        <h2>{mode === 'edit' ? 'Edit Flight' : 'Add New Flight'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Airline Name *</label>
              <input
                type="text"
                name="airline"
                placeholder="e.g., Air India, Indigo"
                value={formData.airline}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Flight Number *</label>
              <input
                type="text"
                name="flightNumber"
                placeholder="e.g., AI101"
                value={formData.flightNumber}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>From *</label>
              <select
                name="from"
                value={formData.from}
                onChange={handleInputChange}
                required
              >
                <option value="">Select departure airport</option>
                {airports.map(airport => (
                  <option key={airport.code} value={airport.code}>
                    {airport.name} ({airport.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>To *</label>
              <select
                name="to"
                value={formData.to}
                onChange={handleInputChange}
                required
              >
                <option value="">Select arrival airport</option>
                {airports.map(airport => (
                  <option key={airport.code} value={airport.code}>
                    {airport.name} ({airport.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Departure Time *</label>
              <input
                type="time"
                name="departureTime"
                value={formData.departureTime}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Arrival Time (Auto-calculated)</label>
              <input
                type="time"
                name="arrivalTime"
                value={formData.arrivalTime}
                disabled
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              {mode === 'edit' ? 'Update Flight' : 'Add Flight'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFlight;
