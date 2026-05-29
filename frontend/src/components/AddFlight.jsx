import React, { useEffect, useState } from 'react';
import { getDuration, airports, calculateArrivalTime } from '../data/flightdetails';
import '../styles/AddFlight.css';

const getEmptyFormData = () => ({
  airline: '',
  flightNumber: '',
  from: '',
  to: '',
  departureDate: '',
  departureTime: '',
  arrivalTime: '',
  duration: '',
  economyPrice: '',
  businessPrice: '',
  firstClassPrice: '',
  stops: 0,
  rating: '',
  amenities: '',
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
        from: initialFlight.from || '',
        to: initialFlight.to || '',
        departureDate: initialFlight.departureDate ? initialFlight.departureDate.split('T')[0] : '',
        departureTime: initialFlight.departureTime || '',
        arrivalTime: initialFlight.arrivalTime || '',
        duration: initialFlight.duration || '',
        economyPrice: initialFlight.economyPrice || '',
        businessPrice: initialFlight.businessPrice || '',
        firstClassPrice: initialFlight.firstClassPrice || '',
        stops: initialFlight.stops || 0,
        rating: initialFlight.rating || '',
        amenities: Array.isArray(initialFlight.amenities) ? initialFlight.amenities.join(', ') : '',
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

    // Auto-calculate arrival time and duration when departure time or route changes
    if (name === 'departureTime' || name === 'from' || name === 'to') {
      updateArrivalTime({
        ...formData,
        [name]: value
      });
    }
  };

  const updateArrivalTime = (data) => {
    if (data.from && data.to && data.departureTime) {
      const durationHours = getDuration(data.from, data.to);
      if (durationHours) {
        const arrival = calculateArrivalTime(data.departureTime, durationHours);
        const hours = Math.floor(durationHours);
        const minutes = Math.round((durationHours - hours) * 60);
        const durationStr = `${hours}h ${minutes}m`;
        setFormData(prev => ({
          ...prev,
          arrivalTime: arrival,
          duration: durationStr
        }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.airline || !formData.flightNumber || !formData.from || 
        !formData.to || !formData.departureTime || !formData.departureDate ||
        !formData.economyPrice || !formData.businessPrice || !formData.firstClassPrice ||
        !formData.rating) {
      alert('Please fill all required fields');
      return;
    }

    const flightPayload = {
      airline: formData.airline,
      flightNumber: formData.flightNumber,
      from: formData.from,
      to: formData.to,
      departureDate: formData.departureDate,
      departureTime: formData.departureTime,
      arrivalTime: formData.arrivalTime,
      duration: formData.duration,
      economyPrice: Number(formData.economyPrice),
      businessPrice: Number(formData.businessPrice),
      firstClassPrice: Number(formData.firstClassPrice),
      stops: Number(formData.stops),
      rating: Number(formData.rating),
      amenities: formData.amenities ? formData.amenities.split(',').map(a => a.trim()).filter(Boolean) : [],
    };

    onSave(flightPayload);
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
                placeholder="e.g., BlueWing Airlines"
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
                placeholder="e.g., BW201"
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
              <label>Departure Date *</label>
              <input
                type="date"
                name="departureDate"
                value={formData.departureDate}
                onChange={handleInputChange}
                required
              />
            </div>

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
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Arrival Time (Auto-calculated)</label>
              <input
                type="time"
                name="arrivalTime"
                value={formData.arrivalTime}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Duration (Auto-calculated)</label>
              <input
                type="text"
                name="duration"
                placeholder="e.g., 2h 30m"
                value={formData.duration}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Economy Price (₹) *</label>
              <input
                type="number"
                name="economyPrice"
                placeholder="e.g., 2500"
                value={formData.economyPrice}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Business Price (₹) *</label>
              <input
                type="number"
                name="businessPrice"
                placeholder="e.g., 5000"
                value={formData.businessPrice}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>First Class Price (₹) *</label>
              <input
                type="number"
                name="firstClassPrice"
                placeholder="e.g., 8000"
                value={formData.firstClassPrice}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Stops *</label>
              <select
                name="stops"
                value={formData.stops}
                onChange={handleInputChange}
                required
              >
                <option value={0}>Non-stop</option>
                <option value={1}>1 Stop</option>
                <option value={2}>2 Stops</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Rating (0-5) *</label>
              <input
                type="number"
                name="rating"
                placeholder="e.g., 4.5"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Amenities (comma-separated)</label>
              <input
                type="text"
                name="amenities"
                placeholder="e.g., WiFi, Meals, Entertainment"
                value={formData.amenities}
                onChange={handleInputChange}
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
