import React, { useState, useEffect } from 'react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [activeFAQ, setActiveFAQ] = useState(null);
  const [adminCredentials, setAdminCredentials] = useState({ username: 'admin', password: '' });
  const [adminError, setAdminError] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Check if admin is already logged in
    const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    setIsAdminLoggedIn(isAuthenticated);
    if (isAuthenticated) {
      loadMessages();
    }
  }, []);

  const loadMessages = () => {
    try {
      const storedMessages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
      setMessages(storedMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

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
      setIsAdminLoggedIn(true);
      loadMessages();
      setAdminError('');
    } else {
      setAdminError('Invalid credentials');
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    setIsAdminLoggedIn(false);
    setMessages([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const newMessage = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString()
      };
      
      const existingMessages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
      const updatedMessages = [...existingMessages, newMessage];
      localStorage.setItem('contactMessages', JSON.stringify(updatedMessages));
      
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: 'general'
      });
    } catch (error) {
      setError('There was an error submitting your message. Please try again.');
      console.error('Error submitting form:', error);
    }
  };

  const toggleFAQ = (index) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I get started with ZEN PDF?",
      answer: "Getting started is easy! Simply visit our homepage and choose the PDF tool you need. No registration required for basic features. For advanced features, you can create a free account."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we take security seriously. All file processing is done in memory and files are automatically deleted after processing. We use industry-standard encryption and security measures to protect your data."
    },
    {
      question: "What file formats are supported?",
      answer: "We support various PDF operations including merging, splitting, compressing, and converting. Our tools work with PDF files and can convert to/from common formats like Word, Excel, and images."
    },
    {
      question: "Do you offer technical support?",
      answer: "Yes, we offer technical support through email and our help center. Premium users get priority support and faster response times."
    }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        <h1>Contact Us</h1>
        
        {isAdminLoggedIn ? (
          <div className="admin-messages-section">
            <div className="admin-header">
              <h2>Admin Dashboard - Contact Messages</h2>
              <button onClick={handleAdminLogout} className="admin-logout-button">
                Logout
              </button>
            </div>
            
            {messages.length === 0 ? (
              <div className="no-messages">No messages received yet.</div>
            ) : (
              <div className="messages-list">
                {messages.map((message) => (
                  <div key={message.id} className="message-card">
                    <div className="message-header">
                      <h3>{message.subject}</h3>
                      <span className="message-date">{formatDate(message.createdAt)}</span>
                    </div>
                    <div className="message-details">
                      <p><strong>From:</strong> {message.name} ({message.email})</p>
                      <p><strong>Category:</strong> {message.category}</p>
                    </div>
                    <div className="message-content">
                      <p>{message.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="contact-content">
              <div className="contact-info">
                <h2>Get in Touch</h2>
                <p>Have questions or feedback? We'd love to hear from you. Fill out the form and we'll get back to you as soon as possible.</p>
                
                <div className="contact-details">
                  <div className="contact-item">
                    <i className="fas fa-envelope"></i>
                    <div>
                      <h3>Email</h3>
                      <li><a href="mailto:koushikjuluri44@gmail.com">koushikjuluri44@gmail.com</a></li>
                      <li><a href="mailto:koushikjuluri4444@gmail.com">koushikjuluri4444@gmail.com</a></li>
                      
                    </div>
                  </div>

                  <div className="contact-item">
                    <i className="fas fa-clock"></i>
                    <div>
                      <h3>Business Hours</h3>
                      <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                      <p>Saturday: 10:00 AM - 4:00 PM</p>
                      <p>Sunday: Closed</p>
                      <p>Holidays: Limited Support</p>
                    </div>
                  </div>

                  <div className="contact-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <div>
                      <h3>Location</h3>
                      <p>123 Tech Street</p>
                      <p>Silicon Valley, CA 94043</p>
                      <p>United States</p>
                    </div>
                  </div>

                  <div className="contact-item">
                    <i className="fas fa-phone"></i>
                    <div>
                      <h3>Phone</h3>
                      <p>Support: +91 7396098014</p>
                      <p>Sales: +91 9493086760</p>
                      <p>Emergency: +91 837694442</p>
                    </div>
                  </div>
                </div>

                <div className="social-links">
                  <h3>Follow Us</h3>
                  <div className="social-icons">
                    <a href="https://twitter.com/zenpdf" target="_blank" rel="noopener noreferrer" title="Twitter">
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a href="https://linkedin.com/company/zenpdf" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                      <i className="fab fa-linkedin"></i>
                    </a>
                    <a href="https://facebook.com/zenpdf" target="_blank" rel="noopener noreferrer" title="Facebook">
                      <i className="fab fa-facebook"></i>
                    </a>
                    <a href="https://instagram.com/zenpdf" target="_blank" rel="noopener noreferrer" title="Instagram">
                      <i className="fab fa-instagram"></i>
                    </a>
                    <a href="https://youtube.com/zenpdf" target="_blank" rel="noopener noreferrer" title="YouTube">
                      <i className="fab fa-youtube"></i>
                    </a>
                    <a href="https://github.com/zenpdf" target="_blank" rel="noopener noreferrer" title="GitHub">
                      <i className="fab fa-github"></i>
                    </a>
                  </div>
                </div>
              </div>

              <div className="contact-form-container">
                {submitted ? (
                  <div className="success-message">
                    <h2>Thank You!</h2>
                    <p>Your message has been sent successfully. We'll get back to you soon!</p>
                    <button 
                      className="submit-again-button"
                      onClick={() => setSubmitted(false)}
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label htmlFor="name">Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Your name"
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
                        placeholder="Your email address"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="category">Category</label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                      >
                        <option value="general">General Inquiry</option>
                        <option value="technical">Technical Support</option>
                        <option value="billing">Billing Question</option>
                        <option value="partnership">Partnership Opportunity</option>
                        <option value="feedback">Product Feedback</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="subject">Subject</label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        placeholder="Message subject"
                      />
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
                        placeholder="Your message"
                      />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="submit-button">
                      Send Message
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

            <div className="faq-section">
              <h2>Frequently Asked Questions</h2>
              <div className="faq-list">
                {faqs.map((faq, index) => (
                  <div 
                    key={index} 
                    className={`faq-item ${activeFAQ === index ? 'active' : ''}`}
                    onClick={() => toggleFAQ(index)}
                  >
                    <div className="faq-question">
                      <h3>{faq.question}</h3>
                      <i className={`fas fa-chevron-${activeFAQ === index ? 'up' : 'down'}`}></i>
                    </div>
                    {activeFAQ === index && (
                      <div className="faq-answer">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="support-section">
              <h2>Additional Support Options</h2>
              <div className="support-options">
                <div className="support-option">
                  <i className="fas fa-book"></i>
                  <h3>Documentation</h3>
                  <p>Browse our comprehensive documentation and guides</p>
                  <a href="/docs" className="support-link">View Docs</a>
                </div>
                <div className="support-option">
                  <i className="fas fa-video"></i>
                  <h3>Video Tutorials</h3>
                  <p>Watch step-by-step video tutorials</p>
                  <a href="/tutorials" className="support-link">Watch Videos</a>
                </div>
                <div className="support-option">
                  <i className="fas fa-comments"></i>
                  <h3>Community Forum</h3>
                  <p>Join our community for discussions and help</p>
                  <a href="/forum" className="support-link">Join Forum</a>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Contact;