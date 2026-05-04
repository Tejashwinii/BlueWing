import React, { useState } from 'react';
import { getDuration, airports, calculateArrivalTime } from '../data/flightdetails';
import '../styles/AddFlight.css';

const AddFlight = ({ onAdd, onCancel }) => {
  const [formData, setFormData] = useState({
    airline: '',
    flightNumber: '',
    departure: '',
    arrival: '',
    departureTime: '',
    arrivalTime: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-calculate arrival time when departure time or route changes
    if (name === 'departureTime' || name === 'departure' || name === 'arrival') {
      updateArrivalTime({
        ...formData,
        [name]: value
      });
    }
  };

  const updateArrivalTime = (data) => {
    if (data.departure && data.arrival && data.departureTime) {
      const duration = getDuration(data.departure, data.arrival);
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

    if (!formData.airline || !formData.flightNumber || !formData.departure || 
        !formData.arrival || !formData.departureTime) {
      alert('Please fill all required fields');
      return;
    }

    onAdd({
      ...formData,
      id: Date.now(),
    });
  };

  return (
    <div className="add-flight-modal">
      <div className="modal-content">
        <h2>Add New Flight</h2>
        
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
                name="departure"
                value={formData.departure}
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
                name="arrival"
                value={formData.arrival}
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
              Add Flight
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFlight;
