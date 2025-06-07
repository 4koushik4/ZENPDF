import React from 'react';
import './Updates.css';

const Updates = () => {
  const updates = [
    {
      version: "1.0.0",
      date: "March 15, 2024",
      changes: [
        "Initial release of ZEN PDF",
        "Added 13 essential PDF tools",
        "Implemented local file processing",
        "Added responsive design"
      ]
    },
    {
      version: "0.9.0",
      date: "March 10, 2024",
      changes: [
        "Beta testing phase",
        "Performance optimizations",
        "UI/UX improvements",
        "Bug fixes and stability improvements"
      ]
    },
    {
      version: "0.8.0",
      date: "March 5, 2024",
      changes: [
        "Added PDF compression tool",
        "Implemented batch processing",
        "Enhanced error handling",
        "Improved file validation"
      ]
    },
    {
      version: "0.7.0",
      date: "March 1, 2024",
      changes: [
        "Added watermark feature",
        "Implemented PDF signing",
        "Added page numbering",
        "Enhanced security features"
      ]
    }
  ];

  return (
    <div className="updates-container">
      <h1>Updates & Changelog</h1>
      
      <div className="updates-list">
        {updates.map((update, index) => (
          <div key={index} className="update-item">
            <div className="update-header">
              <h2>Version {update.version}</h2>
              <span className="update-date">{update.date}</span>
            </div>
            <ul className="update-changes">
              {update.changes.map((change, changeIndex) => (
                <li key={changeIndex}>{change}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="updates-section">
        <h2>Upcoming Features</h2>
        <div className="upcoming-features">
          <div className="feature-item">
            <h3>OCR Support</h3>
            <p>Convert scanned PDFs to searchable text</p>
          </div>
          <div className="feature-item">
            <h3>Batch Processing</h3>
            <p>Process multiple files simultaneously</p>
          </div>
          <div className="feature-item">
            <h3>Cloud Storage</h3>
            <p>Optional cloud storage integration</p>
          </div>
        </div>
      </div>

      <div className="updates-section">
        <h2>Stay Updated</h2>
        <p>Follow us on GitHub to stay informed about new features and updates:</p>
        <a 
          href="https://github.com/4koushik4/zenpdftools" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="github-button"
        >
          Follow on GitHub
        </a>
      </div>
    </div>
  );
};

export default Updates; 