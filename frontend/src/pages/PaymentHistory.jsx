import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/PaymentHistory.css';

const PaymentHistory = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load transactions from localStorage
    const storedTransactions = JSON.parse(localStorage.getItem('paymentHistory') || '[]');
    // Sort by most recent first
    const sorted = storedTransactions.sort((a, b) => b.id - a.id);
    setTransactions(sorted);
    setLoading(false);
  }, []);

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all payment history?')) {
      localStorage.removeItem('paymentHistory');
      setTransactions([]);
    }
  };

  const getTotalSpent = () => {
    return transactions
      .filter(t => t.status === 'success')
      .reduce((sum, t) => {
        const amount = parseFloat(String(t.amount).replace(/[^\d.]/g, '')) || 0;
        return sum + amount;
      }, 0);
  };

  const getSuccessfulTransactions = () => {
    return transactions.filter(t => t.status === 'success').length;
  };

  return (
    <>
      <Navbar minimalMode={true} />
      <div className="payment-history-page">
        <div className="history-container">
          {/* Header */}
          <div className="history-header">
            <h1>Payment History</h1>
            <button className="btn btn-back" onClick={() => navigate('/')}>
              ← Back
            </button>
          </div>

          {/* Statistics */}
          {transactions.length > 0 && (
            <div className="history-stats">
              <div className="stat-card">
                <p className="stat-label">Total Transactions</p>
                <p className="stat-value">{transactions.length}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Successful Payments</p>
                <p className="stat-value success-text">{getSuccessfulTransactions()}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Total Amount Paid</p>
                <p className="stat-value">₹ {getTotalSpent().toFixed(2)}</p>
              </div>
            </div>
          )}

          {/* Transactions Table */}
          {loading ? (
            <p className="loading-text">Loading transactions...</p>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <p className="empty-icon">📭</p>
              <p className="empty-text">No payment history yet</p>
              <button className="btn btn-primary" onClick={() => navigate('/')}>
                Start Booking
              </button>
            </div>
          ) : (
            <>
              <div className="transactions-table-wrapper">
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Card Number</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className={`transaction-row ${transaction.status}`}>
                        <td className="date-cell">{transaction.date}</td>
                        <td className="card-cell">{transaction.cardNumber}</td>
                        <td className="amount-cell">₹ {transaction.amount}</td>
                        <td className="status-cell">
                          <span className={`status-badge ${transaction.status}`}>
                            {transaction.status === 'success' ? '✓ Success' : '✕ Failed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Clear History Button */}
              <div className="history-actions">
                <button
                  className="btn btn-danger"
                  onClick={handleClearHistory}
                >
                  Clear History
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PaymentHistory;
