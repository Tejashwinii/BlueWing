import React from 'react';
import '../styles/ReviewCard.css';

const ReviewCard = ({ review }) => {
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={`star ${i < rating ? 'filled' : 'empty'}`}>
        ⭐
      </span>
    ));
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <div className="review-card">
      <div className="review-header">
        <span className="reviewer-name">{review.userName || 'Anonymous'}</span>
        <div className="review-stars">
          {renderStars(review.rating)}
        </div>
      </div>
      <div className="review-body">
        <p className="review-text">"{review.comment}"</p>
      </div>
      <div className="review-footer">
        <span className="review-date">{formatDate(review.createdAt)}</span>
      </div>
    </div>
  );
};

export default ReviewCard;
