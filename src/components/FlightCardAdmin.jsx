import React from 'react';
import '../styles/FlightCardAdmin.css';

const FlightCardAdmin = ({ flight, onEdit, onDelete }) => {
  const getAirportName = (code) => {
    const airports = {
      'DEL': 'Delhi',
      'BOM': 'Mumbai',
      'BLR': 'Bangalore',
      'HYD': 'Hyderabad',
      'COK': 'Kochi',
      'MAA': 'Chennai',
      'PNQ': 'Pune',
      'CCU': 'Kolkata',
      'JAI': 'Jaipur',
      'SXR': 'Srinagar',
      'AMD': 'Ahmedabad',
    };
    return airports[code] || code;
  };

  return (
    <div className="flight-card-admin">
      <div className="flight-card-image">
        <div className="flight-background">
          ✈️
        </div>
      </div>
      
      <div className="flight-card-content">
        <div className="flight-card-header">
          <div className="flight-plane-name">
            <h3>{flight.airline}</h3>
            <span className="flight-code">{flight.flightNumber}</span>
          </div>
          <div className="flight-time">
            <h4>{flight.departureTime}</h4>
            <p className="flight-status">Departure</p>
          </div>
        </div>

        <div className="flight-route">
          <div className="route-part">
            <span className="airport-code">{flight.departure}</span>
            <p className="airport-name">{getAirportName(flight.departure)}</p>
          </div>
          <div className="route-arrow">
            <span>→</span>
          </div>
          <div className="route-part">
            <span className="airport-code">{flight.arrival}</span>
            <p className="airport-name">{getAirportName(flight.arrival)}</p>
          </div>
        </div>

        <div className="flight-actions">
          <button className="btn-edit" onClick={() => onEdit(flight)}>
            Edit
          </button>
          <button className="btn-delete" onClick={() => onDelete(flight.id)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlightCardAdmin;
