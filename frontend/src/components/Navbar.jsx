import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = ({ onNavClick = () => {}, hideLogin = false, minimalMode = false }) => {
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if navbar should be hidden based on route
  const hiddenRoutes = ['/payment', '/payment-success', '/ticket-summary'];
  const shouldHideNavbar = hiddenRoutes.includes(location.pathname);

  if (shouldHideNavbar) {
    return null;
  }

  const navMenus = {
    whereFly: {
      label: 'WHERE WE FLY',
      mainTitle: 'Our destinations',
      sections: [
        {
          items: [
            { title: 'Hyderabad', icon: '✈️', description: 'Rajiv Gandhi International Airport' },
            { title: 'Delhi', icon: '✈️', description: 'Indira Gandhi International Airport' },
            { title: 'Mumbai', icon: '✈️', description: 'Bombay High International Airport' },
            { title: 'Bangalore', icon: '✈️', description: 'Kempegowda International Airport' },
            { title: 'Chennai', icon: '✈️', description: 'Chennai International Airport' },
            { title: 'Kolkata', icon: '✈️', description: 'Netaji Subhas Chandra Bose Airport' },
          ],
        },
      ],
    },
    experience: {
      label: 'EXPERIENCES',
      mainTitle: 'Customer Reviews',
      sections: [
        {
          items: [
            { title: 'Excellent Service!', stars: 5, description: 'The flight was comfortable and the crew was very helpful. Highly recommended!' },
            { title: 'Great Value', stars: 5, description: 'Best airline for domestic flights in India. Amazing food and service.' },
            { title: 'Very Satisfied', stars: 5, description: 'Punctual, clean aircraft, and friendly staff. Will fly again!' },
            { title: 'Wonderful Experience', stars: 5, description: 'Premium seat selection and excellent in-flight entertainment.' },
            { title: 'Highly Professional', stars: 5, description: 'From booking to landing, everything was smooth and professional.' },
          ],
        },
      ],
    },
    help: {
      label: 'HELP',
      mainTitle: 'Help and Support',
      sections: [
        {
          items: [
            { title: 'FAQs', icon: '❓', description: 'Frequently asked questions' },
            { title: 'Contact Support', icon: '💬', description: 'Get in touch with us' },
            { title: 'Baggage Info', icon: '🧳', description: 'Baggage policies' },
          ],
        },
      ],
    },
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo and Brand */}
        <Link to="/" className="navbar-brand">
          <div className="brand-logo">✈️</div>
          <span className="brand-text">BlueWing</span>
        </Link>

        {/* Menu Items - Hidden in minimalMode */}
        {!minimalMode && (
          <div className="navbar-menu">
            {Object.entries(navMenus).map(([key, menu]) => {
              // whereFly, experience, and help navigate directly, no dropdown
              if (key === 'whereFly' || key === 'experience' || key === 'help') {
                let route = '/';
                if (key === 'whereFly') route = '/where-we-fly';
                if (key === 'experience') route = '/experiences';
                if (key === 'help') route = '/help';
                
                return (
                  <div key={key} className="menu-item-wrapper">
                    <button
                      className="menu-item-btn"
                      onClick={() => navigate(route)}
                    >
                      {menu.label}
                    </button>
                  </div>
                );
              }
              // Keep fallback logic if any other dropdown items are added later
              return (
                <div
                  key={key}
                  className="menu-item-wrapper"
                  onMouseEnter={() => setHoveredMenu(key)}
                  onMouseLeave={() => setHoveredMenu(null)}
                >
                  <button className="menu-item-btn">
                    {menu.label}
                  </button>
                  {hoveredMenu === key && (
                    <div className="menu-dropdown">
                      <div className="dropdown-content">
                        {menu.sections[0].items.map((item, idx) => (
                          <div key={idx} className="dropdown-item">
                            <span className="item-icon">{item.icon}</span>
                            <div className="item-info">
                              <div className="item-title">{item.title}</div>
                              <div className="item-description">{item.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Right Section - Login/Profile */}
        {!minimalMode && (
          <div className="navbar-right">
            {user ? (
              <div className="profile-section">
                <button 
                  className="profile-btn"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                >
                  <span className="profile-icon">👤</span>
                  <span className="profile-text">{user.firstName}</span>
                </button>
                {showProfileDropdown && (
                  <div className="profile-dropdown">
                    {user.role === 'admin' && (
                      <button 
                        className="dropdown-option"
                        onClick={() => {
                          navigate('/admin-dashboard');
                          setShowProfileDropdown(false);
                        }}
                      >
                        Admin Dashboard
                      </button>
                    )}
                    {user.role !== 'admin' && (
                      <button 
                        className="dropdown-option"
                        onClick={() => {
                          navigate('/profile');
                          setShowProfileDropdown(false);
                        }}
                      >
                        My Profile
                      </button>
                    )}
                    <button 
                      className="dropdown-option"
                      onClick={() => {
                        navigate('/');
                        setShowProfileDropdown(false);
                      }}
                    >
                      Home
                    </button>
                    <button 
                      className="dropdown-option logout"
                      onClick={() => {
                        logout();
                        navigate('/login');
                        setShowProfileDropdown(false);
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              !hideLogin && (
                <Link to="/login" className="nav-login-btn">
                  LOG IN / REGISTER
                </Link>
              )
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;


