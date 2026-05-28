import React, { useState, useContext, useLocation } from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = ({ onNavClick = () => {}, hideLogin = false, minimalMode = false }) => {
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useRouterLocation();

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
            {Object.entries(navMenus).map(([key, menu]) => (
              <div
                key={key}
                className="menu-item-wrapper"
                onMouseEnter={() => setHoveredMenu(key)}
                onMouseLeave={() => setHoveredMenu(null)}
              >
                <button 
                  className={`menu-item-btn ${key === 'help' ? 'has-click' : ''}`}
                  onClick={() => {
                    if (key === 'help') {
                      navigate('/help');
                    }
                  }}
                >
                  {menu.label}
                </button>
                
                {hoveredMenu === key && key !== 'help' && (
                  <div className={`menu-dropdown ${key === 'experience' ? 'reviews-dropdown' : ''}`}>
                    <div className="dropdown-content">
                      {menu.sections[0].items.map((item, idx) => (
                        <div key={idx} className={`dropdown-item ${key === 'experience' ? 'review-item' : ''}`}>
                          {key === 'experience' ? (
                            <>
                              <div className="review-stars">
                                {[...Array(item.stars)].map((_, i) => (
                                  <span key={i} className="star">⭐</span>
                                ))}
                              </div>
                              <div className="review-content">
                                <div className="review-title">{item.title}</div>
                                <div className="review-text">{item.description}</div>
                              </div>
                            </>
                          ) : (
                            <>
                              <span className="item-icon">{item.icon}</span>
                              <div className="item-info">
                                <div className="item-title">{item.title}</div>
                                <div className="item-description">{item.description}</div>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {hoveredMenu === key && key === 'help' && (
                  <div className="menu-dropdown">
                    <div className="dropdown-content">
                      {menu.sections[0].items.map((item, idx) => (
                        <div key={idx} className="dropdown-item" onClick={() => navigate('/help')}>
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
            ))}
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
                    <button 
                      className="dropdown-option"
                      onClick={() => {
                        navigate('/profile');
                        setShowProfileDropdown(false);
                      }}
                    >
                      My Profile
                    </button>
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


