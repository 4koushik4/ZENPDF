import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./home0.css";

const Home0 = () => {
  const navigate = useNavigate();
  const [isClicked, setIsClicked] = useState(false);
  const [butterflies, setButterflies] = useState([]);

  const createButterfly = () => {
    const colors = ['#FF9AA2', '#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA'];
    return {
      id: Date.now() + Math.random(),
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      endX: (Math.random() - 0.5) * 200,
      endY: (Math.random() - 0.5) * 200,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 25 + 15,
      delay: Math.random() * 0.5,
      duration: Math.random() * 2 + 1
    };
  };

  const handleClick = () => {
    setIsClicked(true);
    const newButterflies = Array.from({ length: 20 }, createButterfly);
    setButterflies(newButterflies);
    setTimeout(() => navigate("/"), 1800);
  };

  return (
    <div className="home0-container">
      <div className="content-wrapper">
        <h1 className="app-title">ZenPDF</h1>
        <p className="instruction">Click on home to start</p>
        <button 
          className={`home-button ${isClicked ? "button-active" : ""}`}
          onClick={handleClick}
          disabled={isClicked}
        >
          🏠
        </button>
      </div>

      {butterflies.map((butterfly) => (
        <div 
          key={butterfly.id}
          className="butterfly"
          style={{
            '--start-x': `${butterfly.startX}%`,
            '--start-y': `${butterfly.startY}%`,
            '--end-x': `${butterfly.endX}vw`,
            '--end-y': `${butterfly.endY}vh`,
            '--color': butterfly.color,
            '--size': `${butterfly.size}px`,
            '--delay': `${butterfly.delay}s`,
            '--duration': `${butterfly.duration}s`
          }}
        >
          <div className="wing left-wing"></div>
          <div className="wing right-wing"></div>
        </div>
      ))}

      <footer className="home0-footer">
        <div className="footer-content">
          <p>Transform your documents with ZenPDF</p>
          <div className="features-list">
            <span>Merge PDFs</span>
            <span>Split PDFs</span>
            <span>Image to PDF</span>
            <span>Edit</span>
            <span>&More...</span>
          </div>
          <p className="copyright">© {new Date().getFullYear()} ZenPDF</p>
        </div>
      </footer>
    </div>
  );
};

export default Home0;