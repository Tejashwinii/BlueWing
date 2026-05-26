import React, { useState, useMemo } from 'react';
import '../styles/FlightCardAdmin.css';

const FlightCardAdmin = ({ flight, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Select a random background image
  const backgroundImage = useMemo(() => {
    const images = ['/BlueFlight.jpg', '/SkyBlueFlight.jpg', '/OrangeFlight.jpg'];
    return images[Math.floor(Math.random() * images.length)];
  }, []);

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

  const routeFrom = flight.from || getAirportName(flight.departure) || 'N/A';
  const routeTo = flight.to || getAirportName(flight.arrival) || 'N/A';

  return (
    <div 
      className={`flight-card-admin ${isExpanded ? 'expanded' : ''}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* dark overlay layer (absolute) */}
      <div className="flight-background-overlay" />

      {/* content wrapper in normal flow so expanding pushes layout */}
      <div className="flight-info-wrapper">
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
            <span className="airport-code">{routeFrom}</span>
            <p className="airport-name">From</p>
          </div>
          <div className="route-arrow">
            <span>→</span>
          </div>
          <div className="route-part">
            <span className="airport-code">{routeTo}</span>
            <p className="airport-name">To</p>
          </div>
        </div>

        {/* Actions Section - visible on hover with smooth expansion */}
        <div className="flight-actions-container">
          <button className="btn-edit" onClick={() => onEdit(flight)}>
            ✎ Edit
          </button>
          <button className="btn-delete" onClick={() => onDelete(flight.id)}>
            🗑 Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlightCardAdmin;
