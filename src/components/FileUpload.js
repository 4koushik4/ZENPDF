import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';

const FileUpload = ({ onFileSelect, selectedFile, onRemoveFile }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
      'application/json': ['.json'],
      'text/html': ['.html'],
      'application/xml': ['.xml'],
    },
    multiple: false,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'xlsx':
      case 'xls':
        return '📊';
      case 'docx':
      case 'doc':
        return '📝';
      case 'txt':
        return '📃';
      case 'csv':
        return '📋';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'webp':
        return '🖼️';
      case 'json':
        return '📋';
      case 'html':
        return '🌐';
      case 'xml':
        return '📄';
      default:
        return '📁';
    }
  };

  return (
    <div className="file-upload-section">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? 'active' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="dropzone-content">
            <Upload size={48} className="upload-icon" />
            <h3>Drop your file here, or click to select</h3>
            <p>Supports PDF, Excel, Word, Images, Text, CSV, JSON, HTML, XML</p>
            <p className="file-size-limit">Maximum file size: 50MB</p>
          </div>
        </div>
      ) : (
        <div className="selected-file">
          <div className="file-info">
            <div className="file-icon">
              {getFileIcon(selectedFile.name)}
            </div>
            <div className="file-details">
              <h4>{selectedFile.name}</h4>
              <p>{formatFileSize(selectedFile.size)}</p>
            </div>
            <button
              className="remove-file-btn"
              onClick={onRemoveFile}
              title="Remove file"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .file-upload-section {
          margin-bottom: 30px;
        }
        
        .dropzone {
          border: 3px dashed #ddd;
          border-radius: 15px;
          padding: 40px 20px;
          text-align: center;
          background: #fafafa;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .dropzone:hover,
        .dropzone.active {
          border-color: #667eea;
          background: linear-gradient(135deg, #667eea10, #764ba210);
        }
        
        .dropzone-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }
        
        .upload-icon {
          color: #667eea;
        }
        
        .file-size-limit {
          color: #666;
          font-size: 14px;
        }
        
        .selected-file {
          background: white;
          border-radius: 15px;
          padding: 20px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .file-info {
          display: flex;
          align-items: center;
          gap: 15px;
          background: transparent;
          padding: 0;
          margin: 0;
          border: none;
        }
        
        .file-icon {
          font-size: 48px;
        }
        
        .file-details {
          flex: 1;
        }
        
        .file-details h4 {
          margin: 0 0 5px 0;
          color: #333;
        }
        
        .file-details p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }
        
        .remove-file-btn {
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .remove-file-btn:hover {
          background: #c82333;
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default FileUpload;
