import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left-aligned items */}
        <div className="left-items">
          <div className="logo">
            <Link to="/home">
  <img src="https://postimg.cc/CdGPW42d" alt="ZEN PDF" style={{ height: "40px" }} />
</Link>


          </div>
          <div className="fun-zone-link">
            <Link 
              to="/Fundraiser" 
              className="fun-zone-btn"
              onClick={() => {
                setDropdownOpen(false);
                setMobileMenuOpen(false);
              }}
            >
              🎪 Fun Zone 🎡
            </Link>
          </div>
        </div>

        {/* Mobile menu button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        {/* Right-aligned items */}
        <div className={`right-items ${mobileMenuOpen ? "mobile-open" : ""}`}>
          {/* Dropdown Menu */}
          <div className="dropdown" ref={dropdownRef}>
            <button 
              className="dropdown-btn" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              All PDF Tools <span className={`dropdown-arrow ${dropdownOpen ? "open" : ""}`}>▼</span>
            </button>
            
            {dropdownOpen && (
              <div 
                className="dropdown-menu"
                role="menu"
              >
                <div className="dropdown-column">
                  <h4>Organize</h4>
                  <ul>
                    <li><Link to="/extract-pages" onClick={() => { setDropdownOpen(false); setMobileMenuOpen(false); }}>Extract Pages</Link></li>
                    <li><Link to="/remove-pages" onClick={() => { setDropdownOpen(false); setMobileMenuOpen(false); }}>Remove Pages</Link></li>
                    <li><Link to="/merge" onClick={() => { setDropdownOpen(false); setMobileMenuOpen(false); }}>Merge PDF</Link></li>
                    <li><Link to="/split" onClick={() => { setDropdownOpen(false); setMobileMenuOpen(false); }}>Split Pages</Link></li>
                  </ul>
                </div>
                <div className="dropdown-column">
                  <h4>Omptimize</h4>
                  <ul>
                    <li><Link to="/compress" onClick={() => { setDropdownOpen(false); setMobileMenuOpen(false); }}>Compress PDF</Link></li>
                    <li><Link to="/image-to-pdf" onClick={() => { setDropdownOpen(false); setMobileMenuOpen(false); }}>Image to PDF</Link></li>
                  </ul>
                </div>
                <div className="dropdown-column">
                  <h4>Edit</h4>
                  <ul>
                    <li><Link to="/rotate-pdf" onClick={() => { setDropdownOpen(false); setMobileMenuOpen(false); }}>RotatePDF</Link></li>
                    <li><Link to="/reorder-pages" onClick={() => { setDropdownOpen(false); setMobileMenuOpen(false); }}>Reorder Pages</Link></li>
                    <li><Link to="/page-numbers" onClick={() => { setDropdownOpen(false); setMobileMenuOpen(false); }}>Add Page Numbers</Link></li>
                    <li><Link to="/pdf-page-insert" onClick={() => { setDropdownOpen(false); setMobileMenuOpen(false); }}>Insert PDF</Link></li>
                  </ul>
                </div>
                <div className="dropdown-column">
                  <h4>PDF Security</h4>
                  <ul>
                    <li><Link to="/password-protect" onClick={() => { setDropdownOpen(false); setMobileMenuOpen(false); }}>Password Protect</Link></li>
                    <li><Link to="/watermark" onClick={() => { setDropdownOpen(false); setMobileMenuOpen(false); }}>Add Watermark</Link></li>
                    <li><Link to="/sign-pdf" onClick={() => { setDropdownOpen(false); setMobileMenuOpen(false); }}>Sign PDF</Link></li>
                    <li><Link to="/unlock-pdf" onClick={() => { setDropdownOpen(false); setMobileMenuOpen(false); }}>Unlock PDF</Link></li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Regular Navigation Links */}
          <ul className="nav-links">
            <li><Link to="/home" onClick={() => { setDropdownOpen(false); setMobileMenuOpen(false); }}>Home</Link></li>
            <li><Link to="/merge" onClick={() => { setDropdownOpen(false); setMobileMenuOpen(false); }}>Merge PDF</Link></li>
            <li><Link to="/split" onClick={() => { setDropdownOpen(false); setMobileMenuOpen(false); }}>Split PDF</Link></li>
            <li><Link to="/compress" onClick={() => { setDropdownOpen(false); setMobileMenuOpen(false); }}>Compress PDF</Link></li>
            
            
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
