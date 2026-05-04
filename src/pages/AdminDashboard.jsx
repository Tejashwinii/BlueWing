import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import FlightCardAdmin from '../components/FlightCardAdmin';
import AddFlight from '../components/AddFlight';
import dummyFlights from '../data/dummyFlights';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [flights, setFlights] = useState(dummyFlights);
  const [showAddForm, setShowAddForm] = useState(false);

  if (!user || user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  const handleAddFlight = (newFlight) => {
    setFlights([...flights, newFlight]);
    setShowAddForm(false);
  };

  const handleDeleteFlight = (flightId) => {
    if (window.confirm('Are you sure you want to delete this flight?')) {
      setFlights(flights.filter(f => f.id !== flightId));
    }
  };

  const handleEditFlight = (flight) => {
    // For now, just log - can be expanded with edit modal
    console.log('Edit flight:', flight);
  };

  return (
    <div className="admin-dashboard">
      <Navbar hideLogin={true} />
      
      <div className="admin-content">
        <div className="admin-header">
          <h1>Hello {user.name} 👋</h1>
          <p>Manage your flights and operations</p>
        </div>

        <div className="admin-body">
          {/* LEFT COLUMN - Actions */}
          <div className="admin-left">
            <div className="action-panel">
              <button 
                className="btn-action btn-add"
                onClick={() => setShowAddForm(true)}
              >
                ➕ Add Flight
              </button>
              
              <button 
                className="btn-action btn-delete"
                disabled
              >
                🗑️ Delete Flight
              </button>
            </div>

            <div className="info-panel">
              <h3>Quick Stats</h3>
              <div className="stat">
                <span className="stat-label">Total Flights:</span>
                <span className="stat-value">{flights.length}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Active Routes:</span>
                <span className="stat-value">{flights.length}</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Flights List */}
          <div className="admin-right">
            <div className="flights-section">
              <h2>Active Flights</h2>
              <div className="flights-grid">
                {flights.map(flight => (
                  <FlightCardAdmin
                    key={flight.id}
                    flight={flight}
                    onEdit={handleEditFlight}
                    onDelete={handleDeleteFlight}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Flight Modal */}
      {showAddForm && (
        <AddFlight
          onAdd={handleAddFlight}
          onCancel={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
