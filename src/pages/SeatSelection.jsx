// import { Link, useLocation } from "react-router-dom";
// import Navbar from "../components/Navbar";

// export default function SeatSelection() {
//   const location = useLocation();
//   const journey = location.state?.journey || {};
//   const selectedFare = location.state?.selectedFare || {};

//   return (
//     <div>
//       <Navbar />
//       <div style={{ padding: "32px", fontFamily: "Arial, sans-serif" }}>
//       <h1>Seat Selection</h1>
//       <p>This page is ready to receive the selected flight and passenger details.</p>
//       <div style={{ marginTop: "16px" }}>
//         <p><strong>Route:</strong> {journey.departure || "-"} → {journey.arrival || "-"}</p>
//         <p><strong>Date:</strong> {journey.date || "-"}</p>
//         <p><strong>Class:</strong> {journey.class || journey.cabinClass || "-"}</p>
//         <p><strong>Passengers:</strong> {journey.passengers ? `${journey.passengers.adults || 0} adult(s), ${journey.passengers.children || 0} child(ren), ${journey.passengers.infants || 0} infant(s)` : "-"}</p>
//         <p><strong>Selected fare:</strong> {selectedFare.flightNumber ? `${selectedFare.flightNumber} - ${selectedFare.fareTypeTitle}` : "-"}</p>
//       </div>
//       <Link to="/" style={{ display: "inline-block", marginTop: "20px" }}>Back to home</Link>
//       </div>
//     </div>
//   );
// }





import { useLocation, useNavigate } from "react-router-dom";
import SeatSelection from "../components/SeatSelection/seatSelection";

export default function SeatSelectionPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleContinueToPayment = (seatSummary) => {
    navigate('/payment', {
      state: {
        ...location.state,
        seatSummary,
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