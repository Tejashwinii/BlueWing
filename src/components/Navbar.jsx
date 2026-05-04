import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = ({ onNavClick = () => {}, hideLogin = false, minimalMode = false }) => {
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const navMenus = {
    book: {
      label: 'BOOK',
      mainTitle: 'Book a flight',
      sections: [
        {
          items: [
            { title: 'Book a flight', icon: '✈️' },
            { title: 'Manage your booking', icon: '📋' },
            { title: 'Check flight status', icon: '📍' },
          ],
        },
      ],
    },
    manage: {
      label: 'MANAGE',
      mainTitle: 'Manage your booking',
      sections: [
        {
          items: [
            { title: 'My bookings', icon: '📅' },
            { title: 'Check-in online', icon: '💳' },
            { title: 'Baggage information', icon: '🧳' },
          ],
        },
      ],
    },
    experience: {
      label: 'EXPERIENCE',
      mainTitle: 'Experience BlueWing',
      sections: [
        {
          items: [
            { title: 'Our cabins', icon: '✨' },
            { title: 'Amenities', icon: '🍽️' },
            { title: 'Airport lounges', icon: '☕' },
          ],
        },
      ],
    },
    whereFly: {
      label: 'WHERE WE FLY',
      mainTitle: 'Our destinations',
      sections: [
        {
          items: [
            { title: 'Our destinations', icon: '🌍' },
            { title: 'Explore regions', icon: '🏙️' },
            { title: 'Our travel partners', icon: '🤝' },
          ],
        },
      ],
    },
    loyalty: {
      label: 'LOYALTY',
      mainTitle: 'BlueWing Rewards',
      sections: [
        {
          items: [
            { title: 'Skywards program', icon: '⭐' },
            { title: 'Earn miles', icon: '🎁' },
            { title: 'Redeem rewards', icon: '🏆' },
          ],
        },
      ],
    },
    help: {
      label: 'HELP',
      mainTitle: 'Help and contacts',
      sections: [
        {
          heading: 'Help and contacts',
          items: [
            { title: 'Changing or cancelling', icon: '🔄' },
            { title: 'Visa and passport help', icon: '📋' },
            { title: 'Feedback and complaints', icon: '💬' },
          ],
        },
        {
          heading: 'Changes to our operations',
          items: [
            { title: 'Delayed or damage baggage support', icon: '🛄' },
            { title: 'Lost property', icon: '🔍' },
            { title: 'Dubai Connect', icon: '🤝' },
          ],
        },
        {
          heading: 'Special assistance',
          items: [
            { title: 'Accessible and inclusive travel hub', icon: '♿' },
            { title: 'Special assistance and requests', icon: '🤝' },
          ],
        },
      ],
    },
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <span className="logo-text">BlueWing</span>
        </div>

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
                  className="menu-item-btn"
                  onClick={() => onNavClick(key)}
                >
                  {menu.label}
                </button>
                
                {hoveredMenu === key && (
                  <div className="menu-panel">
                    <div className="panel-header">
                      <h3>{menu.mainTitle}</h3>
                      <span className="close-panel">×</span>
                    </div>
                    
                    <div className="panel-content">
                      {menu.sections.map((section, sIdx) => (
                        <div key={sIdx} className="panel-section">
                          {section.heading && (
                            <h4 className="section-heading">{section.heading}</h4>
                          )}
                          <div className="section-items">
                            {section.items.map((item, idx) => (
                              <a key={idx} href="#" className="panel-item">
                                <span className="item-title">{item.title}</span>
                                <span className="item-arrow">›</span>
                              </a>
                            ))}
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

        {/* Right Actions - Hidden in minimalMode */}
        {!minimalMode && (
          <div className="navbar-right">
            {user && user.role === 'admin' ? (
              <div className="profile-section">
                <button 
                  className="profile-icon-btn"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                >
                  👤 {user.name}
                </button>
                {showProfileDropdown && (
                  <div className="profile-dropdown">
                    <button 
                      className="dropdown-item"
                      onClick={() => {
                        navigate('/admin-dashboard');
                        setShowProfileDropdown(false);
                      }}
                    >
                      Dashboard
                    </button>
                    <button 
                      className="dropdown-item"
                      onClick={() => {
                        navigate('/');
                        setShowProfileDropdown(false);
                      }}
                    >
                      Home
                    </button>
                    <button 
                      className="dropdown-item logout"
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
                <Link to="/login" className="nav-btn">
                  LOG IN
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


