import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import FlightCardAdmin from '../components/FlightCardAdmin';
import AddFlight from '../components/AddFlight';
import { flightAPI } from '../utils/api';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFlightForm, setShowFlightForm] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedFlightIds, setSelectedFlightIds] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  // Fetch flights from backend
  const fetchFlights = async () => {
    try {
      setLoading(true);
      const response = await flightAPI.getAllFlights();
      setFlights(response.data || []);
    } catch (error) {
      console.error('Failed to fetch flights:', error);
      alert('Failed to load flights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  const handleAddFlight = async (newFlight) => {
    try {
      const response = await flightAPI.addFlight(newFlight);
      if (response.success) {
        setFlights([...flights, response.data]);
        setShowFlightForm(false);
        setSelectedFlight(null);
      }
    } catch (error) {
      console.error('Failed to add flight:', error);
      alert(error.message || 'Failed to add flight. Please try again.');
    }
  };

  const handleUpdateFlight = (updatedFlight) => {
    setFlights(flights.map(flight => flight._id === updatedFlight._id ? updatedFlight : flight));
    setShowFlightForm(false);
    setSelectedFlight(null);
  };

  const handleDeleteFlight = async (flightId) => {
    if (window.confirm('Are you sure you want to delete this flight?')) {
      try {
        const response = await flightAPI.deleteFlight(flightId);
        if (response.success) {
          setFlights(flights.filter(f => f._id !== flightId));
        }
      } catch (error) {
        console.error('Failed to delete flight:', error);
        alert(error.message || 'Failed to delete flight. Please try again.');
      }
    }
  };

  const handleEditFlight = (flight) => {
    setSelectedFlight(flight);
    setFormMode('edit');
    setShowFlightForm(true);
  };

  const handleOpenAddFlight = () => {
    setSelectedFlight(null);
    setFormMode('add');
    setShowFlightForm(true);
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedFlightIds([]);
  };

  const handleToggleSelect = (flightId) => {
    setSelectedFlightIds(prev =>
      prev.includes(flightId)
        ? prev.filter(id => id !== flightId)
        : [...prev, flightId]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedFlightIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedFlightIds.length} flight(s)?`)) return;
    try {
      await Promise.all(selectedFlightIds.map(id => flightAPI.deleteFlight(id)));
      setFlights(flights.filter(f => !selectedFlightIds.includes(f._id)));
      setSelectedFlightIds([]);
      setSelectionMode(false);
    } catch (error) {
      console.error('Failed to delete flights:', error);
      alert(error.message || 'Failed to delete some flights. Please try again.');
      fetchFlights();
    }
  };

  return (
    <div className="admin-dashboard">
      <Navbar hideLogin={true} />
      
      <div className="admin-content">
        <div className="admin-header">
          <h1>Hello {user.firstName || user.name} 👋</h1>
          <p>Manage your flights and operations</p>
        </div>

        <div className="admin-body">
          {/* LEFT COLUMN - Actions */}
          <div className="admin-left">
            <div className="action-panel">
              <button 
                className="btn-action btn-add"
                onClick={handleOpenAddFlight}
              >
                ➕ Add Flight
              </button>
              
              <button 
                className={`btn-action btn-delete ${selectionMode ? 'active' : ''}`}
                onClick={toggleSelectionMode}
              >
                {selectionMode ? '✖ Cancel Selection' : '🗑️ Delete Flight'}
              </button>
            </div>

            {selectionMode && (
              <div className="selection-bar">
                <p>{selectedFlightIds.length} flight(s) selected</p>
                <div className="selection-actions">
                  <button
                    className="btn-confirm-delete"
                    onClick={handleBulkDelete}
                    disabled={selectedFlightIds.length === 0}
                  >
                    🗑️ Delete Selected
                  </button>
                  <button
                    className="btn-cancel-select"
                    onClick={toggleSelectionMode}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

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
              {loading ? (
                <p>Loading flights...</p>
              ) : (
                <div className="flights-grid">
                  {flights.map(flight => (
                    <FlightCardAdmin
                      key={flight._id}
                      flight={flight}
                      onEdit={handleEditFlight}
                      onDelete={handleDeleteFlight}
                      selectionMode={selectionMode}
                      isSelected={selectedFlightIds.includes(flight._id)}
                      onToggleSelect={handleToggleSelect}
                    />
                  ))}
                  {flights.length === 0 && <p>No flights found. Add your first flight!</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Flight Modal */}
      {showFlightForm && (
        <AddFlight
          mode={formMode}
          initialFlight={selectedFlight}
          onSave={formMode === 'edit' ? handleUpdateFlight : handleAddFlight}
          onCancel={() => {
            setShowFlightForm(false);
            setSelectedFlight(null);
            setFormMode('add');
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
