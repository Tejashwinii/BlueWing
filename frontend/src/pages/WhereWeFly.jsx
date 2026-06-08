import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/WhereWeFly.css";
import dummyFlights from "../data/dummyFlights";
import { useNavigate } from "react-router-dom";
import { flightAPI } from "../utils/api";

// City representative images
const cityImages = {
  Delhi: "https://plus.unsplash.com/premium_photo-1697730429201-381b71f61427?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGRlbGhpfGVufDB8fDB8fHww",
  Mumbai: "https://images.unsplash.com/photo-1562979314-bee7453e911c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bXVtYmFpfGVufDB8fDB8fHww",
  Bangalore: "https://plus.unsplash.com/premium_photo-1673240845266-2f2c432cf194?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDQ0fHx8ZW58MHx8fHx8",
  Hyderabad: "https://images.unsplash.com/photo-1741545979534-02f59c742730?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDZ8fHxlbnwwfHx8fHw%3D",
  Chennai: "https://plus.unsplash.com/premium_photo-1697730420879-dc2a8dbaa31f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y2hlbm5haXxlbnwwfHwwfHx8MA%3D%3D",
  Kolkata: "https://images.unsplash.com/photo-1597220397294-0d95abb2031c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGtvbGthdGF8ZW58MHx8MHx8fDA%3D",
  Pune: "https://images.unsplash.com/photo-1572782252655-9c8771392601?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHVuZXxlbnwwfHwwfHx8MA%3D%3D",
  Ahmedabad: "https://images.unsplash.com/photo-1704730827544-ad473ecae95d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YWhtZWRhYmFkfGVufDB8fDB8fHww",
  Kochi: "https://images.unsplash.com/flagged/photo-1579201661176-1e69dabbb98c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8a29jaGl8ZW58MHx8MHx8fDA%3D",
  Goa: "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D",
  Jaipur: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8amFpcHVyfGVufDB8fDB8fHww",
};

export default function WhereWeFly() {
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [flightsLoading, setFlightsLoading] = useState(true);

  // Fetch flights from API on component mount
  useEffect(() => {
    const fetchFlights = async () => {
      try {
        setFlightsLoading(true);
        const response = await flightAPI.getAllFlights(1000, 0);
        if (response.success && response.data) {
          setFlights(response.data);1
        }
      } catch (error) {
        console.error("Failed to fetch flights from API, using fallback data:", error);
        setFlights(dummyFlights);
      } finally {
        setFlightsLoading(false);
      }
    };

    fetchFlights();
  }, []);

  // Use flights from API, fallback to dummyFlights if empty
  const flightData = flights.length > 0 ? flights : dummyFlights;

  // Get unique departure cities from flights
  const departureCities = useMemo(() => {
    const cities = flightData
      .map((flight) => flight.from || flight.departure)
      .filter(Boolean);

    return Array.from(new Set(cities)).sort((a, b) => a.localeCompare(b));
  }, [flightData]);

  return (
    <>
      <Navbar />
      <div className="where-we-fly-container">
        <h1 className="wwf-title">Where We Fly</h1>
        <p className="wwf-subtitle">Explore our destinations across India</p>
        <div className="city-grid">
          {departureCities.map((cityName) => (
            <div
              className="city-card"
              key={cityName}
            >
              <div
                className="city-image"
                style={{ backgroundImage: `url(${cityImages[cityName]})` }}
              >
                <div className="city-overlay">
                  <div className="city-name">{cityName}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
