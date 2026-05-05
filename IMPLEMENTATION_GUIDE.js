/**
 * FLIGHTCARD COMPONENT - IMPLEMENTATION GUIDE
 * 
 * Complete working example for BlueWing Airlines admin dashboard
 */

// ============================================
// 1. COMPONENT IMPORT & SETUP
// ============================================

// In src/pages/AdminDashboard.jsx
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import FlightCardAdmin from '../components/FlightCardAdmin';
import dummyFlights from '../data/dummyFlights';

// ============================================
// 2. STATE MANAGEMENT
// ============================================

function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [flights, setFlights] = useState(dummyFlights);
  const [editingFlight, setEditingFlight] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ============================================
  // 3. EVENT HANDLERS
  // ============================================

  /**
   * Handle edit button click
   * Opens modal with flight details for editing
   */
  const handleEditFlight = (flight) => {
    setEditingFlight(flight);
    setIsModalOpen(true);
    // Future: Open edit modal/form
  };

  /**
   * Handle delete button click
   * Shows confirmation dialog and removes flight from list
   */
  const handleDeleteFlight = (flightId) => {
    if (window.confirm('Are you sure you want to delete this flight?')) {
      setFlights(flights.filter(f => f.id !== flightId));
      // Future: Make DELETE API call
      // await fetch(`/api/flights/${flightId}`, { method: 'DELETE' });
    }
  };

  /**
   * Handle adding new flight
   * Adds flight to list and closes form
   */
  const handleAddFlight = (newFlight) => {
    const flightWithId = {
      ...newFlight,
      id: Math.max(...flights.map(f => f.id), 0) + 1
    };
    setFlights([...flights, flightWithId]);
    // Future: Make POST API call
    // await fetch('/api/flights', { method: 'POST', body: JSON.stringify(newFlight) });
  };

  // ============================================
  // 4. RENDER
  // ============================================

  return (
    <div className="admin-dashboard">
      {/* Header Section */}
      <div className="admin-header">
        <h1>Flight Management Dashboard</h1>
        <p>Total Flights: {flights.length}</p>
      </div>

      {/* Main Content */}
      <div className="flights-container">
        {flights.map(flight => (
          <FlightCardAdmin
            key={flight.id}
            flight={flight}
            onEdit={handleEditFlight}
            onDelete={handleDeleteFlight}
          />
        ))}
      </div>

      {/* Edit Modal (Future Implementation) */}
      {isModalOpen && editingFlight && (
        <EditFlightModal
          flight={editingFlight}
          onSave={(updatedFlight) => {
            setFlights(flights.map(f =>
              f.id === updatedFlight.id ? updatedFlight : f
            ));
            setIsModalOpen(false);
          }}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

// ============================================
// 5. CSS GRID LAYOUT
// ============================================

/*
In src/styles/AdminDashboard.css:

.flights-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 20px;
  padding: 20px;
}

@media (max-width: 768px) {
  .flights-container {
    grid-template-columns: 1fr;
  }
}
*/

// ============================================
// 6. COMPONENT PROPS INTERFACE
// ============================================

/*
interface FlightCardAdminProps {
  flight: {
    id: number;
    flightNumber: string;        // e.g., "BW201"
    airline: string;              // e.g., "BlueWing Airlines"
    departure: string;            // Airport code: "HYD"
    arrival: string;              // Airport code: "BOM"
    departureTime: string;        // e.g., "08:00 AM"
    arrivalTime?: string;         // e.g., "09:45 AM"
    price?: number;               // e.g., 2200
    duration?: string;            // e.g., "1h 45m"
    stops?: number;               // e.g., 0
    [key: string]: any;           // Other properties
  };
  onEdit: (flight: Flight) => void;
  onDelete: (flightId: number) => void;
}
*/

// ============================================
// 7. ANIMATION DETAILS
// ============================================

/*
HOVER ANIMATION SEQUENCE (300ms total):

1. Card receives hover (onMouseEnter)
   - isExpanded state changes to true
   - .expanded class is added

2. CSS transitions trigger (ease-in-out):
   - Box shadow increases (0 2px 8px → 0 8px 24px)
   - Border color changes (#e0e0e0 → #0066cc)
   - Card lifts slightly (translateY: 0 → -2px)
   - Buttons container: max-height 0 → 50px, opacity 0 → 1

3. Buttons become interactive and clickable

4. Mouse leaves card (onMouseLeave)
   - isExpanded state changes to false
   - .expanded class is removed
   - All animations reverse smoothly

RESULT: No overlapping, cards below are pushed down naturally
*/

// ============================================
// 8. FUTURE API INTEGRATION
// ============================================

/*
Replace static dummyFlights with API data:

useEffect(() => {
  const fetchFlights = async () => {
    try {
      const response = await fetch('/api/flights');
      const data = await response.json();
      setFlights(data);
    } catch (error) {
      console.error('Failed to fetch flights:', error);
    }
  };

  fetchFlights();
}, []);

// Delete handler with API:
const handleDeleteFlight = async (flightId) => {
  if (!window.confirm('Delete this flight?')) return;

  try {
    const response = await fetch(`/api/flights/${flightId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      setFlights(flights.filter(f => f.id !== flightId));
      showSuccessMessage('Flight deleted successfully');
    } else {
      showErrorMessage('Failed to delete flight');
    }
  } catch (error) {
    console.error('Delete error:', error);
    showErrorMessage('Error deleting flight');
  }
};

// Edit handler with API:
const handleEditFlight = async (updatedFlight) => {
  try {
    const response = await fetch(`/api/flights/${updatedFlight.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFlight)
    });

    if (response.ok) {
      setFlights(flights.map(f =>
        f.id === updatedFlight.id ? updatedFlight : f
      ));
      setIsModalOpen(false);
      showSuccessMessage('Flight updated successfully');
    } else {
      showErrorMessage('Failed to update flight');
    }
  } catch (error) {
    console.error('Update error:', error);
    showErrorMessage('Error updating flight');
  }
};
*/

// ============================================
// 9. ACCESSIBILITY FEATURES
// ============================================

/*
Current:
- Semantic HTML (div, button elements)
- Clear button labels with icons
- Keyboard accessible (buttons are focusable)
- Touch-friendly button sizes

Future improvements:
- Add aria-labels to buttons
- Add aria-expanded for expandable sections
- Implement keyboard navigation (Enter to expand, Escape to close)
- Add focus indicators
- Screen reader announcements for actions
- Reduced motion preferences
*/

// ============================================
// 10. PERFORMANCE OPTIMIZATION
// ============================================

/*
For large flight lists (100+ items):

// Memoize component to prevent unnecessary re-renders
const FlightCardAdminMemo = React.memo(FlightCardAdmin);

// Use virtualization (for 1000+ items)
import { FixedSizeList } from 'react-window';

// Debounce search/filter operations
const debouncedFilter = useCallback(
  debounce((query) => {
    setFlights(filterFlights(dummyFlights, query));
  }, 300),
  []
);

// Lazy load images
<img loading="lazy" src={flight.image} />
*/

export {};
