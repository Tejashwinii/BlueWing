import React, { useState } from 'react';
import '../styles/Subscribe.css';

const Subscribe = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', text: '' });

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setStatus({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    // Simulate subscribe action (replace with real API call)
    setStatus({ type: 'success', text: 'Subscribed! Check your inbox for confirmation.' });
    setEmail('');
  };

  return (
    <div className="subscribe-page">
      <div className="subscribe-hero">
        <div className="hero-content">
          <h1>Subscribe to BlueWing</h1>
          <p>Get exclusive offers, travel tips and flight deals delivered straight to your inbox.</p>

          <form className="subscribe-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email"
            />
            <button className="btn-subscribe" type="submit">Subscribe</button>
          </form>

          {status.text && (
            <div className={`subscribe-status ${status.type}`}>{status.text}</div>
          )}
        </div>

        <div className="hero-visual">
          <img src="/assets/subscribe-illustration.png" alt="Subscribe" />
        </div>
      </div>

      <div className="subscribe-benefits">
        <h2>Why Subscribe?</h2>
        <ul>
          <li>Early access to sales and promotional fares.</li>
          <li>Personalised recommendations and travel tips.</li>
          <li>Exclusive partner offers and discounts.</li>
        </ul>
      </div>
    </div>
  );
};

export default Subscribe;
