import React from 'react';
import { Download, FileDown } from 'lucide-react';
import { saveAs } from 'file-saver';

const DownloadButton = ({ convertedFile, originalFileName, targetFormat, onDownload }) => {
  const handleDownload = () => {
    if (!convertedFile) return;
    
    // Generate filename with new extension
    const baseName = originalFileName.replace(/\.[^/.]+$/, "");
    const newFileName = `${baseName}_converted.${targetFormat}`;
    
    // Download the file
    saveAs(convertedFile, newFileName);
    
    // Call the callback if provided
    onDownload && onDownload();
  };

  if (!convertedFile) {
    return null;
  }

  return (
    <div className="download-section">
      <button 
        className="btn download-btn"
        onClick={handleDownload}
      >
        <Download size={20} />
        Download Converted File
      </button>
      
      <div className="file-preview">
        <FileDown size={24} />
        <div className="file-info">
          <p><strong>Original:</strong> {originalFileName}</p>
          <p><strong>Converted:</strong> {originalFileName.replace(/\.[^/.]+$/, "")}_converted.{targetFormat}</p>
        </div>
      </div>
      
      <style jsx>{`
        .download-section {
          text-align: center;
          margin: 30px 0;
        }
        
        .download-btn {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          font-size: 18px;
          padding: 15px 30px;
          border-radius: 12px;
          margin-bottom: 20px;
          box-shadow: 0 8px 20px rgba(40, 167, 69, 0.3);
        }
        
        .download-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 25px rgba(40, 167, 69, 0.4);
        }
        
        .file-preview {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 15px;
          display: flex;
          align-items: center;
          gap: 15px;
          margin: 0 auto;
          max-width: 400px;
        }
        
        .file-preview svg {
          color: #28a745;
          flex-shrink: 0;
        }
        
        .file-info {
          text-align: left;
          flex: 1;
        }
        
        .file-info p {
          margin: 5px 0;
          font-size: 14px;
          color: #333;
        }
        
        .file-info strong {
          color: #495057;
        }
        
        @media (max-width: 768px) {
          .download-btn {
            font-size: 16px;
            padding: 12px 24px;
          }
          
          .file-preview {
            flex-direction: column;
            text-align: center;
          }
          
          .file-info {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default DownloadButton;
