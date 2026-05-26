import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/Help.css';

const Help = () => {
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const navigate = useNavigate();

  const quickHelpCards = [
    {
      id: 1,
      title: 'Booking',
      description: 'Learn how to book your flight and manage your reservations',
      icon: '✈️',
      content: {
        subtitle: 'Complete Guide to Booking Flights',
        details: [
          'Search for flights by entering departure and arrival cities',
          'Select your travel date and number of passengers (adults, children, infants)',
          'Choose your preferred cabin class (Economy, Business, First Class)',
          'Browse available flights and compare prices',
          'Select your preferred flight and fare type',
          'Proceed to seat selection to choose your seats',
          'Enter passenger details for all travelers',
          'Complete your booking and receive confirmation'
        ]
      }
    },
    {
      id: 2,
      title: 'Baggage',
      description: 'Check baggage allowance, fees, and important guidelines',
      icon: '🧳',
      content: {
        subtitle: 'Baggage Policy & Allowance',
        details: [
          'Economy Class: 1 checked baggage (23 kg) + 1 carry-on bag (7 kg)',
          'Business Class: 2 checked baggage (32 kg each) + 2 carry-on bags',
          'First Class: 3 checked baggage (32 kg each) + 2 carry-on bags + personal item',
          'Excess baggage charges apply for items exceeding limits',
          'Carry-on bag dimensions: 22 x 14 x 9 inches',
          'Checked baggage dimensions: Must not exceed 158 cm (L+W+H)',
          'Fragile items and electronics should be packed securely',
          'Contact support for special baggage requirements'
        ]
      }
    },
    {
      id: 3,
      title: 'Payments',
      description: 'Explore payment options and troubleshoot payment issues',
      icon: '💳',
      content: {
        subtitle: 'Payment Methods & Information',
        details: [
          'We accept all major credit and debit cards: Visa, Mastercard, American Express',
          'Digital payment options: Google Pay, Apple Pay',
          'Bank transfer and net banking available',
          'All payments are secured with SSL encryption',
          'Your payment information is never stored on our servers',
          'Payment confirmation received instantly via email',
          'Refunds processed within 5-7 business days',
          'For payment issues, contact our support team with your booking reference'
        ]
      }
    },
    {
      id: 4,
      title: 'Check-in',
      description: 'Get help with online and airport check-in procedures',
      icon: '📋',
      content: {
        subtitle: 'Check-in Options & Process',
        details: [
          'Online check-in opens 24 hours before departure',
          'Check-in through website or mobile app available',
          'Arrive at airport at least 3 hours before international flights',
          'Arrive at airport at least 2 hours before domestic flights',
          'Airport check-in available at dedicated counters',
          'Self-service kiosks available at major airports',
          'Boarding passes can be printed or received on mobile device',
          'Select your preferred seat during check-in (if not already selected)'
        ]
      }
    },
  ];

  const faqs = [
    {
      id: 1,
      question: 'How do I book a flight on BlueWing?',
      answer: 'Visit the homepage and use the search bar to enter your departure and arrival cities, select your travel dates, choose the number of passengers (adults, children, and infants), and select your preferred cabin class. Browse the available flights, select one, choose your preferred seats during the seat selection step, enter passenger details, and complete your booking.',
    },
    {
      id: 2,
      question: 'How do I select seats for my flight?',
      answer: 'After selecting a flight and fare, you\'ll be taken to the seat selection page. You can choose your preferred cabin class (Economy, Business, or First Class), view available seats in the aircraft layout, and select seats for each passenger. The seat prices vary by cabin class. You must select the exact number of seats matching your passenger count before proceeding.',
    },
    {
      id: 3,
      question: 'What cabin classes are available?',
      answer: 'BlueWing offers three cabin classes: Economy - our most affordable option with standard seating, Business - premium comfort with extra legroom and better amenities, and First Class - our luxury option with the highest comfort and exclusive services. Each class has different seat availability and pricing.',
    },
    {
      id: 4,
      question: 'How do I enter passenger details?',
      answer: 'On the passenger details page, you\'ll enter information for each adult and child passenger including first name, last name, gender, and date of birth for children. You\'ll also need to provide contact information such as your country, mobile number, and email address. This information is required to complete your booking.',
    },
    {
      id: 5,
      question: 'What information do I need to provide to book a flight?',
      answer: 'You\'ll need: Departure and arrival cities, travel date, number of passengers (adults, children, infants), preferred cabin class, seat selections for each passenger, full names and gender of all passengers, date of birth for children, and contact details including mobile number and email address.',
    },
  ];

  const contactDetails = [
    {
      type: 'Phone',
      value: '+1 (800) 123-4567',
      icon: '📞',
    },
    {
      type: 'Email',
      value: 'support@bluewing.com',
      icon: '✉️',
    },
    {
      type: 'Live Chat',
      value: 'Available 24/7',
      icon: '💬',
    },
  ];

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="help-page">
      <Navbar />
      
      {/* Header Section */}
      <div className="help-header">
        <div className="help-header-content">
          <h1 className="help-title">How can we help you?</h1>
          <p className="help-subtitle">Find answers to your questions and get support</p>
        </div>
      </div>

      {/* Quick Help Cards Section */}
      <section className="quick-help-section">
        <div className="container">
          <h2 className="section-title">Quick Help</h2>
          <div className="quick-help-grid">
            {quickHelpCards.map((card) => (
              <div key={card.id} className="quick-help-card">
                <div className="card-icon">{card.icon}</div>
                <h3 className="card-title">{card.title}</h3>
                <p className="card-description">{card.description}</p>
                <button 
                  className="card-link"
                  onClick={() => setExpandedCard(expandedCard === card.id ? null : card.id)}
                >
                  {expandedCard === card.id ? 'Show less ↑' : 'Learn more →'}
                </button>
              </div>
            ))}
          </div>

          {expandedCard && (
            <div className="quick-help-details">
              {quickHelpCards.map((card) => (
                expandedCard === card.id && (
                  <div key={card.id} className="detail-box">
                    <button 
                      className="close-details-btn"
                      onClick={() => setExpandedCard(null)}
                    >
                      ✕
                    </button>
                    <h3 className="detail-title">{card.content.subtitle}</h3>
                    <ul className="detail-list">
                      {card.content.details.map((detail, idx) => (
                        <li key={idx}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="faq-container">
            {faqs.map((faq) => (
              <div key={faq.id} className="faq-item">
                <div
                  className="faq-question"
                  onClick={() => toggleFAQ(faq.id)}
                >
                  <h3>{faq.question}</h3>
                  <span className={`faq-toggle ${expandedFAQ === faq.id ? 'open' : ''}`}>
                    ▼
                  </span>
                </div>
                {expandedFAQ === faq.id && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-box">
            <h2 className="contact-title">Still need help?</h2>
            <p className="contact-subtitle">Get in touch with our customer support team</p>
            
            <div className="contact-details-grid">
              {contactDetails.map((detail, index) => (
                <div key={index} className="contact-detail">
                  <div className="detail-icon">{detail.icon}</div>
                  <h4 className="detail-type">{detail.type}</h4>
                  <p className="detail-value">{detail.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer-like Section */}
      <footer className="help-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>BlueWing</h4>
              <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/flight-selection">Book Flight</a></li>
                <li><a href="/help">Help & Support</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                <li><a href="#about">About Us</a></li>
                <li><a href="#careers">Careers</a></li>
                <li><a href="#press">Press</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Legal</h4>
              <ul>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms of Service</a></li>
                <li><a href="#cookies">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 BlueWing Airlines. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Help;
