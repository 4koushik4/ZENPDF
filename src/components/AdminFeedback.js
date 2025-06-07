import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminFeedback.css';

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is authenticated
    const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/feedback');  // Redirect to feedback page if not authenticated
      return;
    }

    // Load feedbacks from localStorage
    const loadFeedbacks = () => {
      try {
        const storedFeedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
        setFeedbacks(storedFeedbacks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (error) {
        console.error('Error loading feedbacks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeedbacks();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    navigate('/feedback');  // Redirect to feedback page on logout
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="admin-feedback-page">
        <div className="admin-feedback-container">
          <div className="loading">Loading feedbacks...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-feedback-page">
      <div className="admin-feedback-container">
        <div className="admin-header">
          <h2>Admin Feedback Dashboard</h2>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>

        {feedbacks.length === 0 ? (
          <div className="no-feedback">No feedback received yet.</div>
        ) : (
          <div className="feedback-list">
            {feedbacks.map((feedback) => (
              <div key={feedback.id} className="feedback-card">
                <div className="feedback-header">
                  <h3>{feedback.name}</h3>
                  <span className="feedback-date">{formatDate(feedback.createdAt)}</span>
                </div>
                <div className="feedback-email">{feedback.email}</div>
                <div className="feedback-type">Type: {feedback.type}</div>
                <div className="feedback-message">{feedback.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFeedback; 