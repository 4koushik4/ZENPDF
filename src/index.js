import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Add error boundary
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Add error handling
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});