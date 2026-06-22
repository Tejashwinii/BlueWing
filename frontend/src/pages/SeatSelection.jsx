import { useLocation, useNavigate } from "react-router-dom";
import SeatSelection from "../components/SeatSelection/seatSelection";

export default function SeatSelectionPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleContinueToPayment = (seatSummary) => {
    // Extract selected seats and calculate total fare
    const selectedSeats = seatSummary.seats || [];
    const totalFare = seatSummary.totalPrice || 0;
    
    // Get existing fare information
    const selectedFare = location.state?.selectedFare || {};
    
    navigate('/payment', {
      state: {
        ...location.state,
        seatSummary,
        selectedSeats, // Pass selected seats explicitly
        totalFare, // Pass total fare explicitly (calculated from seat selection)
        selectedFare: {
          ...selectedFare,
          totalFare, // Ensure selectedFare has the totalFare
        }
      }
    });
  };

  return (
    <SeatSelection
      bookingContext={location.state}
      onBack={() => navigate("/")}
      onContinue={handleContinueToPayment}
    />
  );
}