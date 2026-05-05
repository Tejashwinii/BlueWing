import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';
import Navbar from '../../src/components/Navbar';
import dummyFlights from '../data/dummyFlights';


const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeView, setActiveView] = useState('home');

  const handleNavClick = (menuItem) => {
    setActiveView(menuItem);
  };

  const handleCloseComponent = () => {
    setActiveView('home');
  };

  const getInitialFormData = () => {
    const savedForm = location.state?.searchForm || JSON.parse(sessionStorage.getItem('bluewingSearchForm') || 'null') || {};

    return {
      departure: savedForm.departure || '',
      arrival: savedForm.arrival || '',
      date: savedForm.date || '',
      adults: Number(savedForm.adults ?? 1),
      children: Number(savedForm.children ?? 0),
      infants: Number(savedForm.infants ?? 0),
      class: savedForm.class || savedForm.cabinClass || 'economy',
    };
  };

  const [formData, setFormData] = useState(getInitialFormData);

  const departureOptions = useMemo(() => {
    const options = dummyFlights
      .map((flight) => flight.from || flight.departure)
      .filter(Boolean);

    return Array.from(new Set(options)).sort((first, second) => first.localeCompare(second));
  }, []);

  const arrivalOptions = useMemo(() => {
    const options = dummyFlights
      .map((flight) => flight.to || flight.arrival)
      .filter(Boolean);

    return Array.from(new Set(options)).sort((first, second) => first.localeCompare(second));
  }, []);

  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePassengerChange = (type, operation) => {
    setFormData((prev) => ({
      ...prev,
      [type]: operation === 'add' ? prev[type] + 1 : Math.max(0, prev[type] - 1),
    }));
  };

  const totalPassengers = formData.adults + formData.children + formData.infants;

  const normalizeCabinClass = (value) => {
    if (value === 'first') {
      return 'first-class';
    }

    return value || 'economy';
  };

  const handleSearch = (e) => {
    e.preventDefault();

    // Validate that all required fields are filled
    if (!formData.departure.trim() || !formData.arrival.trim() || !formData.date) {
      alert('Please enter all required details: departure city, arrival city, and departure date.');
      return;
    }

    const normalizedClass = normalizeCabinClass(formData.class);
    const searchParams = new URLSearchParams({
      departure: formData.departure.trim(),
      arrival: formData.arrival.trim(),
      date: formData.date,
      class: normalizedClass,
    });

    const searchForm = {
      departure: formData.departure.trim(),
      arrival: formData.arrival.trim(),
      date: formData.date,
      class: normalizedClass,
      adults: formData.adults,
      children: formData.children,
      infants: formData.infants,
    };

    sessionStorage.setItem('bluewingSearchForm', JSON.stringify(searchForm));

    navigate(`/flight-selection?${searchParams.toString()}`, {
      state: { searchForm },
    });
  };

  // Render active component or home page
  if (activeView === 'book') {
    return (
      <>
        <Navbar onNavClick={handleNavClick} />
        <BookFlight onClose={handleCloseComponent} />
      </>
    );
  }

  if (activeView === 'experience') {
    return (
      <>
        <Navbar onNavClick={handleNavClick} />
        <Experience onClose={handleCloseComponent} />
      </>
    );
  }

  if (activeView === 'whereWeFly') {
    return (
      <>
        <Navbar onNavClick={handleNavClick} />
        <WhereWeFly onClose={handleCloseComponent} />
      </>
    );
  }

  if (activeView === 'loyalty') {
    return (
      <>
        <Navbar onNavClick={handleNavClick} />
        <Loyalty onClose={handleCloseComponent} />
      </>
    );
  }

  if (activeView === 'help') {
    return (
      <>
        <Navbar onNavClick={handleNavClick} />
        <Help onClose={handleCloseComponent} />
      </>
    );
  }

  if (activeView === 'seatSelection') {
    return (
      <>
        <SeatSelectionPage onClose={handleCloseComponent} />
      </>
    );
  }

  // Default home page view
  return (
    <div className="homepage">
      {/* Navbar */}
      <Navbar onNavClick={handleNavClick} />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1 className="hero-heading">BlueWing Airlines</h1>
            <p className="hero-tagline">Your travelling, our priority</p>
          </div>
        </div>

        {/* Flight Search Card */}
        <div className="search-card-container">
          <div className="search-card">
            <h2 className="search-card-title">Book Your Flight</h2>
            <form className="search-form" onSubmit={handleSearch}>
              <div className="style-new">
                <div className="form-group">
                  <label htmlFor="departure">Departure</label>
                  <select
                    id="departure"
                    name="departure"
                    value={formData.departure}
                    onChange={handleInputChange}
                  >
                    <option value="">Select departure</option>
                    {departureOptions.map((airport) => (
                      <option key={airport} value={airport}>
                        {airport}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="arrival">Arrival</label>
                  <select
                    id="arrival"
                    name="arrival"
                    value={formData.arrival}
                    onChange={handleInputChange}
                  >
                    <option value="">Select arrival</option>
                    {arrivalOptions.map((airport) => (
                      <option key={airport} value={airport}>
                        {airport}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="date">Departure Date</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
             <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
  {/* Passengers Column */}
  <div style={{ flex: 1 }}>
    <div className="form-group">
      <label>Passengers</label>
      <button
        type="button"
        className="passenger-dropdown-btn"
        onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
      >
        <span>{totalPassengers} Passenger{totalPassengers !== 1 ? 's' : ''}</span>
        <span className="dropdown-arrow">▼</span>
      </button>
      {showPassengerDropdown && (
        <div className="passenger-dropdown-menu">
          {/* Adults */}
          <div className="passenger-item">
            <button
              type="button"
              className="passenger-btn-minus"
              onClick={() => handlePassengerChange('adults', 'subtract')}
            >
              −
            </button>
            <div className="passenger-info">
              <div className="passenger-count">{formData.adults} Adult</div>
              <div className="passenger-age">Ages 12+</div>
            </div>
            <button
              type="button"
              className="passenger-btn-plus"
              onClick={() => handlePassengerChange('adults', 'add')}
            >
              +
            </button>
          </div>
          {/* Children */}
          <div className="passenger-item">
            <button
              type="button"
              className="passenger-btn-minus"
              onClick={() => handlePassengerChange('children', 'subtract')}
            >
              −
            </button>
            <div className="passenger-info">
              <div className="passenger-count">{formData.children} Child</div>
              <div className="passenger-age">Ages 2-11</div>
            </div>
            <button
              type="button"
              className="passenger-btn-plus"
              onClick={() => handlePassengerChange('children', 'add')}
            >
              +
            </button>
          </div>
          {/* Infants */}
          <div className="passenger-item">
            <button
              type="button"
              className="passenger-btn-minus"
              onClick={() => handlePassengerChange('infants', 'subtract')}
            >
              −
            </button>
            <div className="passenger-info">
              <div className="passenger-count">{formData.infants} Infant</div>
              <div className="passenger-age">Ages under 2, on lap</div>
            </div>
            <button
              type="button"
              className="passenger-btn-plus"
              onClick={() => handlePassengerChange('infants', 'add')}
            >
              +
            </button>
          </div>
          <div className="passenger-note">
            Please note: You can book for a maximum of 9 passengers.
          </div>
        </div>
      )}
    </div>
  </div>

  {/* Class Column */}
  <div style={{ flex:1 }} className='class-div'>
    <div className="form-group">
      <label htmlFor="class">Class</label>
      <select
        id="class"
        name="class"
        value={formData.class}
        onChange={handleInputChange}
      >
        <option value="economy">Economy</option>
        <option value="business">Business</option>
        <option value="first-class">First Class</option>
      </select>
    </div>
  </div>
</div>

              <button type="submit" className="btn-search">
                Search Flights
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="highlights-section">
        <div className="highlights-container">
          <div className="highlights-intro">
            <h2>Why Choose BlueWing?</h2>
            <p>
              At BlueWing Airlines, we're committed to delivering exceptional travel experiences with comfort, affordability, and reliability at the heart of everything we do.
            </p>
          </div>

          <div className="highlights-cards">
            <div className="highlight-card">
              <div className="highlight-icon">🛫</div>
              <h3>Comfortable Journey</h3>
              <p>
                Enjoy spacious seating, premium amenities, and attentive service on every flight.
              </p>
            </div>

            <div className="highlight-card">
              <div className="highlight-icon">💰</div>
              <h3>Affordable Prices</h3>
              <p>
                Get the best rates on flights worldwide. We believe luxury travel should be accessible.
              </p>
            </div>

            <div className="highlight-card">
              <div className="highlight-icon">⏰</div>
              <h3>On-Time Flights</h3>
              <p>
                Our commitment to punctuality means you'll arrive on schedule, every time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>BlueWing Airlines</h4>
              <p>Your travelling, our priority</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#about">About Us</a></li>
                <li><a href="#contact">Contact</a></li>
                <li><a href="#careers">Careers</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Legal</h4>
              <ul>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms & Conditions</a></li>
                <li><a href="#cookies">Cookie Policy</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Follow Us</h4>
              <div className="social-links">
                <a href="#facebook" title="Facebook" className="social-icon">f</a>
                <a href="#twitter" title="Twitter" className="social-icon">𝕏</a>
                <a href="#instagram" title="Instagram" className="social-icon">📷</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 BlueWing Airlines. All rights reserved. | Designed with ✈️ for better travel experience.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;





