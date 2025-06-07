import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Feedback.css';

const Feedback = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'suggestion',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ username: 'koushik', password: '' });
  const [adminError, setAdminError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleAdminChange = (e) => {
    setAdminCredentials({
      ...adminCredentials,
      [e.target.name]: e.target.value
    });
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    if (adminCredentials.username === 'admin' && adminCredentials.password === 'Bhavani@88') {
      localStorage.setItem('adminAuthenticated', 'true');
      navigate('/adminfeedback');
    } else {
      setAdminError('Invalid credentials');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const existingFeedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
      const newFeedback = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString()
      };
      const updatedFeedbacks = [...existingFeedbacks, newFeedback];
      localStorage.setItem('feedbacks', JSON.stringify(updatedFeedbacks));
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        type: 'suggestion',
        message: ''
      });
    } catch (error) {
      console.error('Error saving feedback:', error);
    }
  };

  return (
    <div className="feedback-page">
      <div className="feedback-container">
        <h1>Feedback & Suggestions</h1>
        
        <div className="feedback-content">
          <div className="feedback-info">
            <h2>Help Us Improve</h2>
            <p>Your feedback is valuable to us! Whether you have a suggestion, found a bug, or want to share your experience, we'd love to hear from you.</p>
            
            <div className="feedback-types">
              <div className="feedback-type">
                <h3>Suggestions</h3>
                <p>Share your ideas for new features or improvements</p>
              </div>
              <div className="feedback-type">
                <h3>Bug Reports</h3>
                <p>Help us identify and fix issues</p>
              </div>
              <div className="feedback-type">
                <h3>General Feedback</h3>
                <p>Share your experience using ZEN PDF</p>
              </div>
            </div>
          </div>

          <div className="feedback-form-container">
            {submitted ? (
              <div className="success-message">
                <h2>Thank You!</h2>
                <p>Your feedback has been submitted successfully. We appreciate your input!</p>
                <button 
                  className="submit-again-button"
                  onClick={() => setSubmitted(false)}
                >
                  Submit Another Feedback
                </button>
              </div>
            ) : (
              <form className="feedback-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="type">Feedback Type</label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="suggestion">Suggestion</option>
                    <option value="bug">Bug Report</option>
                    <option value="general">General Feedback</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                  />
                </div>

                <button type="submit" className="submit-button">
                  Submit Feedback
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="admin-login-box">
          <h3>Admin Login</h3>
          <form onSubmit={handleAdminSubmit} className="admin-login-form">
            <div className="form-group">
              <label htmlFor="admin-username">Username</label>
              <input
                type="text"
                id="admin-username"
                name="username"
                value={adminCredentials.username}
                onChange={handleAdminChange}
                required
                placeholder="Enter admin username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="admin-password">Password</label>
              <input
                type="password"
                id="admin-password"
                name="password"
                value={adminCredentials.password}
                onChange={handleAdminChange}
                required
                placeholder="Enter admin password"
              />
            </div>

            {adminError && <div className="error-message">{adminError}</div>}

            <button type="submit" className="admin-login-button">
              Login as Admin
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Feedback; 