import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authAPI, bookingAPI, flightAPI } from '../utils/api';
import Navbar from '../components/Navbar';
import airplaneImg from '../assets/profile_airplane.png';
import '../styles/UserProfile.css';

const UserProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Profile data state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    city: '',
    country: '',
  });

  // Fetch user profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await authAPI.getProfile();
        if (response.success && response.data.user) {
          const userData = response.data.user;
          const rawDob = userData.dateOfBirth || userData.dob || userData.birthDate;
          let parsedDob = '';
          if (rawDob) {
            const d = new Date(rawDob);
            if (!isNaN(d.getTime())) parsedDob = d.toISOString().split('T')[0];
          }

          setProfileData({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            phone: userData.phone || '',
            gender: userData.gender || userData.Gender || userData.sex || '',
            dateOfBirth: parsedDob,
            address: userData.address || '',
            city: userData.city || '',
            country: userData.country || '',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setMessage({ type: 'error', text: 'Failed to load profile data' });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch booking history - wrapped in useCallback for reuse
  const fetchBookings = useCallback(async () => {
    if (user) {
      try {
        setBookingsLoading(true);
        const response = await bookingAPI.getUserBookings(user._id);
        if (response.success) {
          const bookingsData = response.data?.bookings || response.data || [];
          const bookingsArray = Array.isArray(bookingsData) ? bookingsData : [];
          
          const flightMap = {};
          const enrichedBookings = await Promise.all(bookingsArray.map(async (booking) => {
            const flightId = booking.flightId?._id || booking.flightId || booking.flight;
            
            if (flightId && !flightMap[flightId]) {
              try {
                const flightResponse = await flightAPI.getFlightById(flightId);
                flightMap[flightId] = flightResponse.data?.flight || flightResponse.data || {};
              } catch (e) {
                // If it fails, keep empty obj so we don't crash
                flightMap[flightId] = {}; 
              }
            }
            
            const flightData = (typeof booking.flightId === 'object' && booking.flightId !== null) 
              ? booking.flightId 
              : (flightMap[flightId] || {});
            
            return {
              ...booking,
              flightData,
              travelDate: flightData.date || flightData.departureDate || flightData.travelDate || flightData.departureTime
            };
          }));
          
          setBookings(enrichedBookings);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setBookings([]);
      } finally {
        setBookingsLoading(false);
      }
    }
  }, [user]);

  // Fetch bookings when tab changes or when returning to this page
  useEffect(() => {
    if (activeTab === 'history') {
      fetchBookings();
    }
  }, [activeTab, fetchBookings, refreshKey]);

  // Refresh bookings when page regains focus (user returns from ticket-summary)
  useEffect(() => {
    const handleFocus = () => {
      if (activeTab === 'history') {
        fetchBookings();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [activeTab, fetchBookings]);

  // Check if user came back from ticket-summary with updated booking
  useEffect(() => {
    if (location.state?.refreshBookings && activeTab === 'history') {
      fetchBookings();
      // Clear the state to prevent re-fetching
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, activeTab, fetchBookings, navigate, location.pathname]);

  // Refresh handler for manual refresh
  const handleRefreshBookings = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setMessage({ type: '', text: '' });
      
      const response = await authAPI.updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        gender: profileData.gender,
        dateOfBirth: profileData.dateOfBirth,
        address: profileData.address,
        city: profileData.city,
        country: profileData.country,
      });

      if (response.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewTicket = (booking) => {
    // Get flight data - could be in flightId (populated) or flight
    const flightData = booking.flightId || booking.flight || {};
    
    // Navigate to ticket summary with booking data
    navigate('/ticket-summary', {
      state: {
        bookingId: booking._id,
        bookingReference: booking.bookingReference,
        journey: {
          from: flightData.from,
          to: flightData.to,
          departureTime: flightData.departureTime || flightData.departureDate,
          arrivalTime: flightData.arrivalTime,
          flightNumber: flightData.flightNumber,
          airline: flightData.airline,
        },
        selectedFare: {
          type: booking.fareType?.name || booking.fareType,
          price: booking.pricing?.totalAmount || booking.totalAmount,
        },
        passengers: {
          adults: booking.passengers?.filter(p => p.type === 'adult' || !p.type) || booking.passengers || [],
          children: booking.passengers?.filter(p => p.type === 'child') || [],
        },
        contactDetails: booking.contactDetails || {},
        transactionId: booking.paymentId?.transactionId || booking.payment?.transactionId || '',
      }
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-GB'); // dd/mm/yyyy
  };

  return (
    <div className="user-profile-page">
      <Navbar />
      
      <div className="profile-container">
        <div className="back-button-container" onClick={() => navigate('/')}>
          ← Back to Home
        </div>

        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-header-content">
            <div className="profile-header-left">
              <div className="profile-name">{profileData.firstName} {profileData.lastName}</div>
              <div className="profile-email">{profileData.email}</div>
            </div>
          </div>
          <img src={airplaneImg} className="airplane-bg" alt="Airplane" />
        </div>

        {/* Top Tabs */}
        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button 
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>

        {/* Main Content */}
        <div className="profile-content">
          {activeTab === 'profile' && (
            <div className="content-card">
              <div className="card-header">
                <h2>Personal Information</h2>
              </div>
              
              {isLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading profile...</p>
                </div>
              ) : (
                <>
                  {message.text && (
                    <div className={`alert-message ${message.type}`}>
                      {message.type === 'success' ? '✓' : '⚠'} {message.text}
                    </div>
                  )}
                  
                  <div className="form-grid">
                    <div className="form-field">
                      <label>First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div className="form-field">
                      <label>Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter last name"
                      />
                    </div>
                    <div className="form-field">
                      <label>Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        disabled={true}
                        placeholder="Email address"
                      />
                    </div>
                    <div className="form-field">
                      <label>Phone Number</label>
                      <input
                        type="text"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="form-field">
                      <label>Gender</label>
                      <select
                        name="gender"
                        value={profileData.gender}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Date of Birth</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={profileData.dateOfBirth}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="form-field full-width">
                      <label>Address</label>
                      <input
                        type="text"
                        name="address"
                        value={profileData.address}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter your address"
                      />
                    </div>
                    <div className="form-field">
                      <label>City</label>
                      <input
                        type="text"
                        name="city"
                        value={profileData.city}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter city"
                      />
                    </div>
                    <div className="form-field">
                      <label>Country</label>
                      <input
                        type="text"
                        name="country"
                        value={profileData.country}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter country"
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    {!isEditing ? (
                      <button className="btn-edit" onClick={() => setIsEditing(true)}>
                        Edit Profile
                      </button>
                    ) : (
                      <>
                        <button 
                          className="btn-save" 
                          onClick={handleSave}
                          disabled={isSaving}
                        >
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button 
                          className="btn-cancel" 
                          onClick={() => setIsEditing(false)}
                          disabled={isSaving}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="content-card">
              <div className="card-header history-header">
                <h2>Booking History</h2>
                <button 
                  className="btn-refresh" 
                  onClick={handleRefreshBookings}
                  disabled={bookingsLoading}
                  title="Refresh bookings"
                >
                  {bookingsLoading ? '⟳' : '🔄'} Refresh
                </button>
              </div>
              
              {bookingsLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading bookings...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">✈️</span>
                  <h3>No Bookings Yet</h3>
                  <p>You haven't made any flight bookings yet.</p>
                  <button className="btn-book-now" onClick={() => navigate('/')}>
                    Book a Flight
                  </button>
                </div>
              ) : (
                <div className="bookings-table-wrapper">
                  <table className="bookings-table">
                    <thead>
                      <tr>
                        <th>Booking Ref</th>
                        <th>Route</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking._id}>
                          <td>
                            <span className="booking-ref-code">{booking.bookingReference}</span>
                          </td>
                          <td>
                            <div className="route-cell">
                              <span className="route-from">{booking.flightData?.from || booking.flightId?.from || booking.flight?.from || 'N/A'}</span>
                              <span className="route-arrow">→</span>
                              <span className="route-to">{booking.flightData?.to || booking.flightId?.to || booking.flight?.to || 'N/A'}</span>
                            </div>
                          </td>
                          <td>{formatDate(booking.travelDate)}</td>
                          <td className="amount-cell">₹{(booking.pricing?.totalAmount || booking.totalAmount || 0).toLocaleString()}</td>
                          <td>
                            <span className={`status-badge status-${booking.bookingStatus || booking.status}`}>
                              {booking.bookingStatus || booking.status}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn-view-ticket"
                              onClick={() => handleViewTicket(booking)}
                            >
                              View Ticket
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;