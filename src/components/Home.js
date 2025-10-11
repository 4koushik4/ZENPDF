import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>ZEN PDF</h1>
        <p>All-in-one PDF management made easy!</p>
      </header>

      <section className="about-section">
        <div className="about-content">
          <h2>Welcome to ZEN PDF</h2>
          <p className="about-description">
            Your comprehensive solution for all PDF management needs. We provide a suite of powerful tools designed to make PDF manipulation simple, efficient, and secure. Whether you're a student, professional, or casual user, our platform offers everything you need to handle PDF files with confidence.
          </p>
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <h3>Secure</h3>
              <p>Your files are processed locally, ensuring complete privacy and security. No data is stored on our servers.</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <h3>Fast</h3>
              <p>Optimized for speed with instant processing and real-time previews. No waiting, no delays.</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <h3>Precise</h3>
              <p>Advanced algorithms for accurate PDF manipulation and conversion. Perfect results every time.</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💡</span>
              <h3>Intuitive</h3>
              <p>User-friendly interface designed for both beginners and professionals. No learning curve required.</p>
            </div>
          </div>
          <div className="about-highlights">
            <div className="highlight-item">
              <h4>Why Choose ZEN PDF?</h4>
              <ul>
                <li>✨ 100% Free to use</li>
                <li>🔐 No file saving required</li>
                <li>🚀 Instant processing</li>
                <li>📱 Works on all devices</li>
              </ul>
            </div>
            <div className="highlight-item">
              <h4>Key Benefits</h4>
              <ul>
                <li>💼 Professional-grade tools</li>
                <li>🛡️ Privacy-focused</li>
                <li>🎨 Modern interface</li>
                <li>📈 Regular updates</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div className="home-grid">
        <Link to="/extract-pages" className="home-card">
          <h2>Extract Pages</h2>
          <p>Extract specific pages from PDF</p>
        </Link>
        <Link to="/remove-pages" className="home-card">
          <h2>Remove Pages</h2>
          <p>Delete unwanted pages from PDF</p>
        </Link>
        <Link to="/rotate-pdf" className="home-card">
          <h2>Rotate PDF</h2>
          <p>Rotate PDF pages in any direction</p>
        </Link>
        <Link to="/reorder-pages" className="home-card">
          <h2>Reorder Pages</h2>
          <p>Rearrange PDF pages in any order</p>
        </Link>
        <Link to="/merge" className="home-card">
          <h2>Merge PDFs</h2>
          <p>Combine multiple PDFs into one</p>
        </Link>
        <Link to="/split" className="home-card">
          <h2>Split PDF</h2>
          <p>Split PDF into multiple files</p>
        </Link>
        <Link to="/compress" className="home-card">
          <h2>Compress PDF</h2>
          <p>Reduce PDF file size</p>
        </Link>
        <Link to="/file-converter" className="home-card">
          <h2>Image to PDF</h2>
          <p>Convert files to any format</p>
        </Link>
        <Link to="/page-numbers" className="home-card">
          <h2>Add Page Numbers</h2>
          <p>Add page numbers to your PDF</p>
        </Link>
        <Link to="/password-protect" className="home-card">
          <h2>Password Protect</h2>
          <p>Secure PDF with password</p>
        </Link>
        <Link to="/watermark" className="home-card">
          <h2>Add Watermark</h2>
          <p>Add text or image watermark</p>
        </Link>
        <Link to="/sign-pdf" className="home-card">
          <h2>Sign PDF</h2>
          <p>Add digital signature to PDF</p>
        </Link>
        <Link to="/unlock-pdf" className="home-card">
          <h2>Unlock PDF</h2>
          <p>Remove password from PDF</p>
        </Link>
        <Link to="/pdf-page-insert" className="home-card">
          <h2>Insert PDF</h2>
          <p>Insert PDF into another PDF or insert a blank page</p>
        </Link>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section about-section">
            <h3>About ZEN PDF</h3>
            <p>A powerful, all-in-one PDF solution that puts your privacy first. Process your documents locally with our secure, fast, and intuitive tools. No data leaves your device, ensuring complete confidentiality.</p>
            <div className="creator-bio">
              <div className="creator-photo">
                <img src="https://i.postimg.cc/Wzxsd1Tq/koushik.jpg" alt="Koushik Juluri" />
              </div>
              <p>Created with ❤️ by Koushik Juluri</p>
              <p className="creator-title">Full Stack Developer</p>
              <p className="creator-description">Passionate about building secure, user-friendly web applications. Specializing in React, Node.js, and Python development. Always focused on creating intuitive solutions that make a difference.</p>
              <div className="creator-links">
                <a href="https://github.com/4koushik4/ZENPDF" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-github"></i>
                </a>
                <a href="https://www.linkedin.com/in/koushikjuluri/" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-linkedin"></i>
                </a>
                <a href="mailto:koushikjuluri44@gmail.com">
                  <i className="fas fa-envelope"></i>
                </a>
              </div>
            </div>
          </div>

          <div className="footer-section links-section">
            <h3>Quick Links</h3>
            <div className="footer-links-grid">
              <div className="links-column">
                <h4>Resources</h4>
                <ul>
                  <li><a href="/faq">FAQ</a></li>
                  <li><a href="/support">Support</a></li>
                  <li><a href="/updates">Updates</a></li>
                </ul>
              </div>
              <div className="links-column">
                <h4>Legal</h4>
                <ul>
                  <li><a href="/privacy-policy">Privacy Policy</a></li>
                  <li><a href="/terms">Terms of Service</a></li>
                </ul>
              </div>
              <div className="links-column">
                <h4>Connect</h4>
                <ul>
                  <li><a href="/feedback">Feedback</a></li>
                  <li><a href="/Contact">Contact</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="footer-section tech-section">
            <h3>Built With</h3>
            <div className="tech-stack">
              <div className="tech-category">
                <h4>Frontend</h4>
                <span>React.js</span>
                <span>HTML5</span>
                <span>CSS3</span>
                <span>JavaScript</span>
              </div>
              <div className="tech-category">
                <h4>Backend</h4>
                <span>Node.js</span>
                <span>Express.js</span>
                <span>Python</span>
                <span>Flask</span>
              </div>
              <div className="tech-category">
                <h4>PDF Processing</h4>
                <span>PDF.js</span>
                <span>PyPDF2</span>
                <span>pdf-lib</span>
              </div>
              <div className="tech-category">
                <h4>Tools & Libraries</h4>
                <span>Git</span>
                <span>npm</span>
                <span>pip</span>
                <span>Webpack</span>
              </div>
            </div>
            <div className="footer-stats">
              <div className="stat-item">
                <span className="stat-number">13+</span>
                <span className="stat-label">PDF Tools</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-label">Free</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Available</span>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 ZEN PDF. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
