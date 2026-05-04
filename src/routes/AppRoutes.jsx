import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import BlueWingLogin from "../pages/BluewingLogin";
import ForgotPassword from "../pages/ForgotPassword";
import RegistrationPage from "../pages/RegistrationPage";
import FlightSelection from "../pages/FlightSelection";
import SeatSelection from "../pages/SeatSelection";
import PassengerDetails from "../pages/PassengerDetails";
import AdminDashboard from "../pages/AdminDashboard";
import Payment from "../pages/Payment";
import PaymentSuccess from "../pages/PaymentSuccess";
// import Confirmation from "../pages/Confirmation";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/flight-selection" element={<FlightSelection />} />
      <Route path="/seat-selection" element={<SeatSelection />} />
      <Route path="/passenger-details" element={<PassengerDetails />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/login" element={<BlueWingLogin />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/registration" element={<RegistrationPage />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      {/* <Route path="/confirmation" element={<Confirmation />} /> */}
    </Routes>
  );
}

export default AppRoutes;