import React from 'react';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

const ConversionProgress = ({ progress, status, error, onReset }) => {
  const getStatusIcon = () => {
    if (error) return <AlertCircle size={24} className="error-icon" />;
    if (progress === 100) return <CheckCircle size={24} className="success-icon" />;
    return <Loader size={24} className="loading-icon" />;
  };

  const getStatusColor = () => {
    if (error) return '#dc3545';
    if (progress === 100) return '#28a745';
    return '#667eea';
  };

  return (
    <div className="conversion-progress">
      <div className="progress-header">
        <div className="status-icon">
          {getStatusIcon()}
        </div>
        <div className="status-text">
          <h3>{error ? 'Conversion Failed' : progress === 100 ? 'Conversion Complete!' : 'Converting...'}</h3>
          <p>{status || (progress === 100 ? 'Your file has been converted successfully!' : 'Please wait while we process your file')}</p>
        </div>
      </div>
      
      <div className="progress-bar-container">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${progress}%`,
              backgroundColor: getStatusColor()
            }}
          />
        </div>
        <div className="progress-text">
          {error ? 'Error' : `${Math.round(progress)}%`}
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      {progress === 100 && (
        <div className="success-message">
          <p>✅ File converted successfully! Click the download button to save your file.</p>
        </div>
      )}
      
      <style jsx>{`
        .conversion-progress {
          background: white;
          border-radius: 15px;
          padding: 25px;
          margin: 20px 0;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .progress-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .status-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .loading-icon {
          animation: spin 1s linear infinite;
          color: #667eea;
        }
        
        .success-icon {
          color: #28a745;
        }
        
        .error-icon {
          color: #dc3545;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .status-text h3 {
          margin: 0 0 5px 0;
          color: #333;
          font-size: 18px;
        }
        
        .status-text p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }
        
        .progress-bar-container {
          margin: 20px 0;
        }
        
        .progress-bar {
          width: 100%;
          height: 10px;
          background: #e9ecef;
          border-radius: 5px;
          overflow: hidden;
          margin-bottom: 10px;
        }
        
        .progress-fill {
          height: 100%;
          border-radius: 5px;
          transition: width 0.3s ease, background-color 0.3s ease;
        }
        
        .progress-text {
          text-align: center;
          font-weight: 600;
          color: #333;
          font-size: 16px;
        }
        
        .error-message {
          background: #f8d7da;
          color: #721c24;
          padding: 15px;
          border-radius: 10px;
          margin: 15px 0;
          border-left: 4px solid #dc3545;
        }
        
        .success-message {
          background: #d4edda;
          color: #155724;
          padding: 15px;
          border-radius: 10px;
          margin: 15px 0;
          border-left: 4px solid #28a745;
        }
        
        .error-message p,
        .success-message p {
          margin: 0;
          font-size: 14px;
        }
        
        @media (max-width: 768px) {
          .conversion-progress {
            padding: 20px;
          }
          
          .progress-header {
            flex-direction: column;
            text-align: center;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default ConversionProgress;
