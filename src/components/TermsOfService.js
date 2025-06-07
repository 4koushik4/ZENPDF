import React from 'react';
import './TermsOfService.css';

const TermsOfService = () => {
  return (
    <div className="terms-page">
      <div className="terms-container">
        <h1>Terms of Service</h1>
        <div className="terms-content">
          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing and using ZEN PDF Tools ("the Service"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this Service.</p>
          </section>

          <section>
            <h2>2. Use License</h2>
            <p>Permission is granted to temporarily use the Service for personal, non-commercial purposes. This license shall automatically terminate if you violate any of these restrictions and may be terminated by ZEN PDF at any time.</p>
            <ul>
              <li>You must not modify or copy the materials</li>
              <li>You must not use the materials for any commercial purpose</li>
              <li>You must not attempt to decompile or reverse engineer any software contained in the Service</li>
              <li>You must not remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section>
            <h2>3. User Responsibilities</h2>
            <p>As a user of the Service, you agree to:</p>
            <ul>
              <li>Provide accurate and complete information when using the Service</li>
              <li>Maintain the security of your account and password</li>
              <li>Not use the Service for any illegal or unauthorized purpose</li>
              <li>Not upload or transmit any viruses or malicious code</li>
              <li>Not attempt to gain unauthorized access to any portion of the Service</li>
            </ul>
          </section>

          <section>
            <h2>4. Privacy Policy</h2>
            <p>Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy, which also governs the Service and informs users of our data collection practices.</p>
          </section>

          <section>
            <h2>5. File Handling and Security</h2>
            <p>Regarding PDF file processing:</p>
            <ul>
              <li>We do not store your PDF files permanently on our servers</li>
              <li>Files are processed in memory and deleted after processing</li>
              <li>We implement industry-standard security measures to protect your data</li>
              <li>You are responsible for maintaining backups of your files</li>
            </ul>
          </section>

          <section>
            <h2>6. Service Limitations</h2>
            <p>The Service is provided "as is" and may have limitations including:</p>
            <ul>
              <li>Maximum file size restrictions</li>
              <li>Processing time limitations</li>
              <li>Number of operations per day</li>
              <li>Supported file formats and features</li>
            </ul>
          </section>

          <section>
            <h2>7. Disclaimer</h2>
            <p>The materials on the Service are provided on an 'as is' basis. ZEN PDF makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
          </section>

          <section>
            <h2>8. Limitations</h2>
            <p>In no event shall ZEN PDF or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the Service.</p>
          </section>

          <section>
            <h2>9. Revisions and Errata</h2>
            <p>The materials appearing on the Service could include technical, typographical, or photographic errors. ZEN PDF does not warrant that any of the materials on its Service are accurate, complete, or current. ZEN PDF may make changes to the materials contained on its Service at any time without notice.</p>
          </section>

          <section>
            <h2>10. Links</h2>
            <p>ZEN PDF has not reviewed all of the sites linked to its Service and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by ZEN PDF of the site. Use of any such linked website is at the user's own risk.</p>
          </section>

          <section>
            <h2>11. Modifications</h2>
            <p>ZEN PDF may revise these terms of service at any time without notice. By using this Service, you are agreeing to be bound by the then current version of these terms of service.</p>
          </section>

          <section>
            <h2>12. Governing Law</h2>
            <p>These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>
          </section>

          <section className="last-updated">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService; 