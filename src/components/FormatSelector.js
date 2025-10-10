import React from 'react';
import { FileText, FileSpreadsheet, FileImage, FileCode, File } from 'lucide-react';

const FormatSelector = ({ selectedFile, selectedFormat, onFormatSelect, supportedFormats }) => {
  const formatIcons = {
    'pdf': '📄',
    'xlsx': '📊',
    'xls': '📊',
    'docx': '📝',
    'doc': '📝',
    'txt': '📃',
    'csv': '📋',
    'png': '🖼️',
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'gif': '🖼️',
    'webp': '🖼️',
    'json': '📋',
    'html': '🌐',
    'xml': '📄'
  };

  const formatNames = {
    'pdf': 'PDF Document',
    'xlsx': 'Excel Spreadsheet',
    'xls': 'Excel Spreadsheet',
    'docx': 'Word Document',
    'doc': 'Word Document',
    'txt': 'Text File',
    'csv': 'CSV File',
    'png': 'PNG Image',
    'jpg': 'JPEG Image',
    'jpeg': 'JPEG Image',
    'gif': 'GIF Image',
    'webp': 'WebP Image',
    'json': 'JSON File',
    'html': 'HTML File',
    'xml': 'XML File'
  };

  if (!selectedFile) {
    return null;
  }

  return (
    <div className="format-selector">
      <h3>Choose Output Format</h3>
      <div className="format-grid">
        {supportedFormats.map((format) => (
          <div
            key={format}
            className={`format-card ${selectedFormat === format ? 'selected' : ''}`}
            onClick={() => onFormatSelect(format)}
          >
            <div className="format-icon">
              {formatIcons[format] || '📁'}
            </div>
            <h4>{format.toUpperCase()}</h4>
            <p>{formatNames[format] || format}</p>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .format-selector {
          margin: 30px 0;
        }
        
        .format-selector h3 {
          margin-bottom: 20px;
          color: #333;
          text-align: center;
        }
        
        .format-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin: 20px 0;
        }
        
        .format-card {
          background: white;
          border-radius: 15px;
          padding: 20px;
          text-align: center;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          cursor: pointer;
          border: 2px solid transparent;
        }
        
        .format-card:hover {
          transform: translateY(-5px);
          border-color: #667eea;
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.2);
        }
        
        .format-card.selected {
          border-color: #667eea;
          background: linear-gradient(135deg, #667eea10, #764ba210);
          transform: translateY(-5px);
        }
        
        .format-icon {
          font-size: 48px;
          margin-bottom: 10px;
        }
        
        .format-card h4 {
          margin: 10px 0 5px 0;
          color: #333;
          font-size: 18px;
        }
        
        .format-card p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }
        
        @media (max-width: 768px) {
          .format-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          }
          
          .format-card {
            padding: 15px;
          }
          
          .format-icon {
            font-size: 36px;
          }
        }
      `}</style>
    </div>
  );
};

export default FormatSelector;
