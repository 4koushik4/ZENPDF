import React from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="legal-container">
      <h1>Privacy Policy</h1>
      <div className="legal-content">
        <section>
          <h2>1. Information We Don't Collect</h2>
          <p>ZEN PDF is committed to your privacy. We do not collect or store any of your data, including:</p>
          <ul>
            <li>PDF files you upload</li>
            <li>Personal information</li>
            <li>Usage statistics</li>
            <li>IP addresses</li>
          </ul>
        </section>

        <section>
          <h2>2. Local Processing</h2>
          <p>All PDF processing is done locally in your browser. Your files never leave your device, ensuring complete privacy and security.</p>
        </section>

        <section>
          <h2>3. Third-Party Services</h2>
          <p>We use the following third-party services that may collect anonymous usage data:</p>
          <ul>
            <li>Google Analytics (anonymous usage statistics)</li>
            <li>Font Awesome (icons)</li>
          </ul>
        </section>

        <section>
          <h2>4. Cookies</h2>
          <p>We use minimal cookies only for essential functionality. No tracking cookies are used.</p>
        </section>

        <section>
          <h2>5. Changes to Privacy Policy</h2>
          <p>We may update this privacy policy from time to time. Any changes will be posted on this page.</p>
        </section>

        <section>
          <h2>6. Contact</h2>
          <p>If you have any questions about this privacy policy, please contact us at <a href="mailto:koushikjuluri44@gmail.com">koushikjuluri44@gmail.com</a></p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 