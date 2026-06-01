import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ReviewCard from '../components/ReviewCard';
import '../styles/Experiences.css';

const Experiences = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5000/api/reviews');
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        // Ensure reviews are sorted by latest first
        const sortedReviews = data.data.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setReviews(sortedReviews);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="experiences-page">
        <div className="experiences-container">
          {/* Header */}
          <div className="experiences-header">
            <h1>✈️ Customer Experiences</h1>
            <p>See what our passengers have to say about their journey with BlueWing</p>
          </div>

          {/* Reviews List */}
          <div className="reviews-section">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading reviews...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <p>⚠️ {error}</p>
                <button className="btn-retry" onClick={fetchReviews}>
                  Try Again
                </button>
              </div>
            ) : reviews.length === 0 ? (
              <div className="empty-state">
                <p className="empty-icon">📝</p>
                <p className="empty-text">No reviews yet</p>
                <p className="empty-subtext">Be the first to share your experience!</p>
              </div>
            ) : (
              <div className="reviews-list">
                <p className="reviews-count">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                {reviews.map((review, index) => (
                  <ReviewCard key={index} review={review} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Experiences;
