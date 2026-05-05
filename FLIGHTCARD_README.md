# FlightCardAdmin Component - Complete Documentation

## Overview

**FlightCardAdmin** is a professional, reusable React component for displaying flight information in the BlueWing Airlines admin dashboard. It features smooth hover animations with expandable action buttons, responsive design, and a modern UI matching airline booking applications.

## Features

✅ **Smooth Hover Animation**
- Card expands smoothly on hover (300ms ease-in-out)
- Buttons fade in and push content down (no overlap)
- Elevation effect with shadow increase
- Works seamlessly with multiple cards in a grid

✅ **Professional Design**
- Airline-style layout with airplane icon
- Clean typography and spacing
- Blue accent colors (#0066cc, #0052a3)
- Responsive on mobile devices

✅ **Interactive Elements**
- Edit and Delete buttons appear on hover
- Click handlers for both actions
- Confirmation dialog for delete operations
- Real-time flight list updates

✅ **Mobile Friendly**
- Buttons always visible on touch devices
- Responsive layout with proper breakpoints
- Touch-friendly button sizes

## Component Structure

```
FlightCardAdmin
├── Flight Image Section (left)
│   └── Airplane Icon (✈️)
├── Flight Content Section (center)
│   ├── Header
│   │   ├── Airline Name & Flight Number
│   │   └── Departure Time
│   ├── Route
│   │   ├── From (Airport Code + Name)
│   │   ├── Arrow (→)
│   │   └── To (Airport Code + Name)
│   └── Actions (hidden, visible on hover)
│       ├── Edit Button (✎)
│       └── Delete Button (🗑)
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `flight` | Object | Yes | Flight data object (see structure below) |
| `onEdit` | Function | Yes | Callback when edit button clicked: `(flight) => void` |
| `onDelete` | Function | Yes | Callback when delete button clicked: `(flightId) => void` |

### Flight Object Structure

```javascript
{
  id: number,                    // Unique identifier
  flightNumber: string,          // e.g., "BW201"
  airline: string,               // e.g., "BlueWing Airlines"
  departure: string,             // Airport code, e.g., "HYD"
  arrival: string,               // Airport code, e.g., "BOM"
  departureTime: string,         // e.g., "08:00 AM"
  arrivalTime: string,           // e.g., "09:45 AM" (optional)
  price: number,                 // e.g., 2200 (optional)
  duration: string,              // e.g., "1h 45m" (optional)
  // ... other properties
}
```

## Usage Example

### Basic Implementation

```jsx
import React, { useState } from 'react';
import FlightCardAdmin from '../components/FlightCardAdmin';
import dummyFlights from '../data/dummyFlights';

function AdminDashboard() {
  const [flights, setFlights] = useState(dummyFlights);

  const handleEdit = (flight) => {
    console.log('Edit flight:', flight);
    // Open edit modal, navigate to edit page, etc.
  };

  const handleDelete = (flightId) => {
    if (window.confirm('Are you sure you want to delete this flight?')) {
      setFlights(flights.filter(f => f.id !== flightId));
    }
  };

  return (
    <div className="flights-list">
      {flights.map(flight => (
        <FlightCardAdmin
          key={flight.id}
          flight={flight}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}

export default AdminDashboard;
```

### With API Integration

```jsx
import React, { useState, useEffect } from 'react';
import FlightCardAdmin from '../components/FlightCardAdmin';

function AdminDashboard() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch flights from API
  useEffect(() => {
    fetch('/api/flights')
      .then(res => res.json())
      .then(data => {
        setFlights(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch flights:', err);
        setLoading(false);
      });
  }, []);

  const handleEdit = async (flight) => {
    try {
      const response = await fetch(`/api/flights/${flight.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flight)
      });
      // Handle response
    } catch (err) {
      alert('Failed to update flight');
    }
  };

  const handleDelete = async (flightId) => {
    if (window.confirm('Are you sure?')) {
      try {
        await fetch(`/api/flights/${flightId}`, {
          method: 'DELETE'
        });
        setFlights(flights.filter(f => f.id !== flightId));
      } catch (err) {
        alert('Failed to delete flight');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flights-list">
      {flights.map(flight => (
        <FlightCardAdmin
          key={flight.id}
          flight={flight}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}

export default AdminDashboard;
```

## Styling & Animation Details

### CSS Classes

| Class | Purpose |
|-------|---------|
| `.flight-card-admin` | Main card container |
| `.flight-card-admin.expanded` | Applied when card is hovered |
| `.flight-card-image` | Left side with airplane icon |
| `.flight-card-content` | Main content area |
| `.flight-card-header` | Top section (airline + departure time) |
| `.flight-route` | Middle section (route information) |
| `.flight-actions-container` | Action buttons (hidden by default) |
| `.btn-edit` | Edit button styling |
| `.btn-delete` | Delete button styling |

### Hover Animation States

**Default State:**
```css
opacity: 1;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
border: 1px solid #e0e0e0;
```

**Hover State (on .flight-card-admin:hover):**
```css
box-shadow: 0 8px 24px rgba(0, 102, 204, 0.2);
border-color: #0066cc;
transform: translateY(-2px);
```

**Actions Container Animation:**
- Default: `max-height: 0; opacity: 0;`
- On hover: `max-height: 50px; opacity: 1;`
- Transition: `all 0.3s ease-in-out;`

### Color Palette

| Color | Usage |
|-------|-------|
| `#0066cc` | Primary blue (accent, hover states) |
| `#0052a3` | Dark blue (button hover) |
| `#333` | Dark text |
| `#666` | Medium gray text |
| `#999` | Light gray text |
| `#e0e0e0` | Borders |
| `#d9534f` | Delete button red |
| `#fff5f5` | Delete button hover background |

## Responsive Behavior

### Desktop (> 768px)
- Card displays in horizontal layout
- Actions appear on hover with smooth animation
- Full icon and text visible

### Mobile (≤ 768px)
- Card displays in vertical/stacked layout
- Buttons always visible (no hover support)
- Optimized touch targets
- Reduced font sizes for smaller screens

## State Management

The component uses `useState` to manage the expanded state:

```javascript
const [isExpanded, setIsExpanded] = useState(false);

// Set expanded on mouse enter
onMouseEnter={() => setIsExpanded(true)}

// Set collapsed on mouse leave
onMouseLeave={() => setIsExpanded(false)}

// Apply class when expanded
className={`flight-card-admin ${isExpanded ? 'expanded' : ''}`}
```

## Future Enhancements

### Potential Features
- [ ] Edit modal with form validation
- [ ] Bulk selection with checkboxes
- [ ] Sort and filter options
- [ ] Search functionality
- [ ] Seat availability indicator
- [ ] Flight status display (on-time, delayed, cancelled)
- [ ] Real-time updates via WebSocket
- [ ] Drag-and-drop reordering
- [ ] Export to CSV
- [ ] Calendar view of flights

### Performance Optimization
- Virtualization for large flight lists
- Lazy loading of flight images
- Memoization with React.memo
- Debounced search/filter operations

## Accessibility

### Current Features
- Semantic HTML structure
- Clear button labels with icons
- Proper contrast ratios (WCAG AA)
- Keyboard navigation support
- Touch-friendly on mobile

### Future Improvements
- ARIA labels and roles
- Focus states for keyboard navigation
- Screen reader optimization
- Reduced motion preferences

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## File References

- **Component:** `src/components/FlightCardAdmin.jsx`
- **Styles:** `src/styles/FlightCardAdmin.css`
- **Parent Component:** `src/pages/AdminDashboard.jsx`
- **Dummy Data:** `src/data/dummyFlights.js`
- **Documentation:** This file

## Troubleshooting

### Buttons not appearing on hover
- Check if `.flight-card-admin.expanded` class is being applied
- Verify CSS is properly imported
- Check browser DevTools for z-index conflicts

### Animation not smooth
- Ensure hardware acceleration is enabled (use `transform` and `opacity`)
- Check for heavy rendering on parent components
- Verify CSS transitions are not being overridden

### Mobile buttons not visible
- On mobile, buttons should always be visible (no hover)
- Check media query at 768px breakpoint
- Test on actual mobile device, not just browser resize

## Support & Contributions

For issues, feature requests, or contributions:
1. Check existing issues in the repository
2. Create a detailed issue with reproduction steps
3. Submit a pull request with improvements
4. Follow the project's code style and conventions

## Version History

### v1.0 (Current)
- Initial release with hover expansion
- Edit and Delete buttons
- Responsive design
- Mobile support

### Future Versions
- v1.1: Add edit modal
- v1.2: Add bulk selection
- v2.0: Full admin dashboard redesign
