import React from 'react';
import './Support.css';

const Support = () => {
  return (
    <div className="support-container">
      <h1>Support Center</h1>
      
      <div className="support-section">
        <h2>Need Help?</h2>
        <p>We're here to help you get the most out of ZEN PDF. Choose the best way to reach us:</p>
        
        <div className="support-options">
          <div className="support-card">
            <h3>Email Support</h3>
            <p>For detailed inquiries or technical issues</p>
            <a href="mailto:koushikjuluri4444@gmail.com" className="support-button">
              Contact Support
            </a>
          </div>

          <div className="support-card">
            <h3>GitHub Issues</h3>
            <p>For bug reports and feature requests</p>
            <a href="https://github.com/4koushik4/ZENPDF/issues" target="_blank" rel="noopener noreferrer" className="support-button">
              Report Issue
            </a>
          </div>

          <div className="support-card">
            <h3>Documentation</h3>
            <p>Check our guides and tutorials</p>
            <a href="/faq" className="support-button">
              View FAQ
            </a>
          </div>
        </div>
      </div>

      <div className="support-section">
        <h2>Common Issues</h2>
        <div className="issues-list">
          <div className="issue-item">
            <h3>File Upload Issues</h3>
            <p>If you're having trouble uploading files, please ensure:</p>
            <ul>
              <li>Your file is in a supported format</li>
              <li>The file size is under 100MB</li>
              <li>You're using a modern web browser</li>
            </ul>
          </div>

          <div className="issue-item">
            <h3>Processing Errors</h3>
            <p>If you encounter processing errors:</p>
            <ul>
              <li>Try refreshing the page</li>
              <li>Clear your browser cache</li>
              <li>Try a different browser</li>
            </ul>
          </div>

          <div className="issue-item">
            <h3>Browser Compatibility</h3>
            <p>For the best experience, use:</p>
            <ul>
              <li>Google Chrome (latest version)</li>
              <li>Mozilla Firefox (latest version)</li>
              <li>Microsoft Edge (latest version)</li>
              <li>Safari (latest version)</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="support-section">
        <h2>Response Time</h2>
        <p>We aim to respond to all support inquiries within 24 hours during business days. For urgent issues, please include "URGENT" in your email subject line.</p>
      </div>
    </div>
  );
};

export default Support; 