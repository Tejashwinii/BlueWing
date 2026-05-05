/**
 * FlightCardAdmin - Reusable Flight Card Component
 * 
 * A professional airline flight card component for admin dashboard
 * with smooth hover expansion animation showing edit/delete actions.
 * 
 * FEATURES:
 * ✓ Responsive card layout with airplane icon on left
 * ✓ Shows flight number, airline, route, and departure time
 * ✓ Smooth hover expansion (300ms ease-in-out)
 * ✓ Edit and Delete buttons appear on hover (non-overlapping)
 * ✓ Click handlers for edit and delete operations
 * ✓ Accessible and mobile-friendly
 * 
 * PROPS:
 * - flight (object): Flight data object
 *   {
 *     id: number,
 *     flightNumber: string (e.g., "BW201"),
 *     airline: string (e.g., "BlueWing Airlines"),
 *     departure: string (e.g., "HYD"),
 *     arrival: string (e.g., "BOM"),
 *     departureTime: string (e.g., "08:00 AM"),
 *     arrivalTime: string (e.g., "09:45 AM") - optional
 *     price: number (e.g., 2200) - optional
 *   }
 * - onEdit (function): Callback when edit button is clicked
 *   signature: onEdit(flight)
 * - onDelete (function): Callback when delete button is clicked
 *   signature: onDelete(flightId)
 * 
 * USAGE EXAMPLE:
 * 
 * import FlightCardAdmin from '../components/FlightCardAdmin';
 * 
 * function AdminFlightList() {
 *   const [flights, setFlights] = useState([...dummyFlights]);
 * 
 *   const handleEdit = (flight) => {
 *     // Handle edit: open modal, navigate to edit page, etc.
 *     console.log('Edit flight:', flight);
 *   };
 * 
 *   const handleDelete = (flightId) => {
 *     if (window.confirm('Delete this flight?')) {
 *       setFlights(flights.filter(f => f.id !== flightId));
 *     }
 *   };
 * 
 *   return (
 *     <div className="flights-list">
 *       {flights.map(flight => (
 *         <FlightCardAdmin
 *           key={flight.id}
 *           flight={flight}
 *           onEdit={handleEdit}
 *           onDelete={handleDelete}
 *         />
 *       ))}
 *     </div>
 *   );
 * }
 * 
 * STYLING & ANIMATION:
 * - Base state: Card with subtle shadow, 1px border
 * - Hover state:
 *   - Elevation increases (stronger shadow)
 *   - Border color changes to blue (#0066cc)
 *   - Card slightly lifts up (-2px translateY)
 *   - Buttons fade in and expand (max-height 0 → 50px, opacity 0 → 1)
 *   - Animation duration: 300ms ease-in-out
 * - Mobile: Buttons always visible due to no hover support
 * 
 * CSS CLASSES:
 * - .flight-card-admin: Main card container
 * - .flight-card-admin.expanded: Applied when hovered
 * - .flight-card-image: Left side with airplane icon
 * - .flight-card-content: Center content area
 * - .flight-card-header: Top section (airline info + departure time)
 * - .flight-route: Middle section (airport codes and route)
 * - .flight-actions-container: Bottom section (edit/delete buttons)
 * - .btn-edit, .btn-delete: Action buttons
 * 
 * FUTURE ENHANCEMENTS:
 * - Add seat availability indicator
 * - Add flight status (on-time, delayed, cancelled)
 * - Add dropdown menu instead of inline buttons
 * - Support for round-trip flights
 * - Real-time updates via WebSocket
 * - Drag-and-drop reordering
 * - Bulk actions checkbox
 * 
 * BACKEND INTEGRATION:
 * Replace static dummyFlights with API call:
 * 
 * useEffect(() => {
 *   fetch('/api/flights')
 *     .then(res => res.json())
 *     .then(data => setFlights(data))
 *     .catch(err => console.error(err));
 * }, []);
 * 
 * And update handlers:
 * 
 * const handleDelete = async (flightId) => {
 *   if (window.confirm('Delete?')) {
 *     try {
 *       await fetch(`/api/flights/${flightId}`, { method: 'DELETE' });
 *       setFlights(flights.filter(f => f.id !== flightId));
 *     } catch (err) {
 *       alert('Failed to delete flight');
 *     }
 *   }
 * };
 */

export {};
