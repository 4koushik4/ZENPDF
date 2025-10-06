import React, { useState } from 'react';
import { FaFileUpload, FaSpinner, FaDownload, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './AdvancedCompressPDF.css';
import config from '../config';

const AdvancedCompressPDF = () => {
  const [file, setFile] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const [quality, setQuality] = useState('high');
  const [targetSize, setTargetSize] = useState('');
  const [useTargetSize, setUseTargetSize] = useState(false);
  const [compressionResults, setCompressionResults] = useState(null);
  const [compressedPdf, setCompressedPdf] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setCompressionResults(null);
      setCompressedPdf(null);
      toast.success('PDF file selected successfully!');
    } else {
      setFile(null);
      toast.error('Please select a valid PDF file');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + ' MB';
  };

  const calculateCompressionRatio = (originalSize, compressedSize) => {
    if (originalSize === 0) return '0%';
    const ratio = ((originalSize - compressedSize) / originalSize) * 100;
    return ratio.toFixed(1) + '%';
  };

  const handleCompress = async () => {
    if (!file) {
      toast.error('Please select a PDF file first');
      return;
    }

    if (useTargetSize && (!targetSize || parseFloat(targetSize) <= 0)) {
      toast.error('Please enter a valid target size');
      return;
    }

    setCompressing(true);
    setCompressionResults(null);
    setCompressedPdf(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('quality', quality);
      
      if (useTargetSize) {
        formData.append('targetSizeMB', targetSize);
      }

      const response = await fetch(`${config.pdfApiUrl}/compress`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Failed to compress PDF';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {}
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/pdf')) {
        throw new Error('Invalid response format. Expected PDF file.');
      }

      // Get the response blob first
      const blob = await response.blob();
      
      // Calculate original file size
      const originalSizeBytes = file.size;
      const compressedSizeBytes = blob.size;
      
      // Try to get values from headers first, fallback to calculated values
      const headerOriginalSize = response.headers.get('X-Original-Size');
      const headerCompressedSize = response.headers.get('X-Compressed-Size');
      const headerCompressionRatio = response.headers.get('X-Compression-Ratio');
      const headerQualityUsed = response.headers.get('X-Quality-Used');
      const headerTargetSize = response.headers.get('X-Target-Size');

      // Use header values if available, otherwise calculate dynamically
      const finalOriginalSize = headerOriginalSize ? 
        (parseFloat(headerOriginalSize) / (1024 * 1024)).toFixed(2) + ' MB' : 
        formatFileSize(originalSizeBytes);

      const finalCompressedSize = headerCompressedSize ? 
        (parseFloat(headerCompressedSize) / (1024 * 1024)).toFixed(2) + ' MB' : 
        formatFileSize(compressedSizeBytes);

      const finalCompressionRatio = headerCompressionRatio || 
        calculateCompressionRatio(originalSizeBytes, compressedSizeBytes);

      const finalQualityUsed = headerQualityUsed || quality.charAt(0).toUpperCase() + quality.slice(1);

      // Set compression results with dynamic values
      setCompressionResults({
        originalSize: finalOriginalSize,
        compressedSize: finalCompressedSize,
        compressionRatio: finalCompressionRatio,
        qualityUsed: finalQualityUsed,
        targetSizeUsed: useTargetSize && targetSize ? targetSize + ' MB' : 
          (headerTargetSize ? headerTargetSize + ' MB' : null)
      });

      // Create blob URL for download
      const url = window.URL.createObjectURL(blob);
      setCompressedPdf(url);

      toast.success('PDF compressed successfully!');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'An error occurred while compressing the PDF');
    } finally {
      setCompressing(false);
    }
  };

  const downloadCompressedPdf = () => {
    if (compressedPdf) {
      const link = document.createElement('a');
      link.href = compressedPdf;
      link.download = `compressed_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetForm = () => {
    setFile(null);
    setCompressionResults(null);
    setCompressedPdf(null);
    setTargetSize('');
    setUseTargetSize(false);
    setQuality('high');
  };

  const getQualityDescription = (quality) => {
    switch (quality) {
      case 'high':
        return 'Minimal quality loss, best for printing and professional use';
      case 'medium':
        return 'Balanced compression, good for general use and sharing';
      case 'low':
        return 'Maximum compression, suitable for web viewing and email';
      default:
        return '';
    }
  };

  return (
    <div className="advanced-compress-container">
      <div className="advanced-compress-header">
        <h1>Advanced PDF Compressor</h1>
        <p>Compress your PDFs with quality control and size targeting using Ghostscript</p>
      </div>

      <div className="upload-section">
        <h3>Select PDF File</h3>
        <div className="file-upload-area">
          <input
            type="file"
            id="pdfFile"
            accept=".pdf"
            onChange={handleFileChange}
            className="file-input"
          />
          <label htmlFor="pdfFile" className="file-upload-label">
            <FaFileUpload className="upload-icon" />
            <span>Choose PDF File or Drag & Drop</span>
          </label>
        </div>
        {file && (
          <div className="file-info">
            <p><strong>Selected:</strong> {file.name}</p>
            <p><strong>Size:</strong> {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
        )}
      </div>

      <div className="compression-settings">
        <h3>Compression Settings</h3>
        <div className="setting-group">
          <label htmlFor="quality">Quality Level:</label>
          <select
            id="quality"
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            className="quality-select"
          >
            <option value="high">High Quality (Minimal Loss)</option>
            <option value="medium">Medium Quality (Balanced)</option>
            <option value="low">Low Quality (Maximum Compression)</option>
          </select>
          <div className="quality-description">
            <FaInfoCircle className="info-icon" />
            {getQualityDescription(quality)}
          </div>
        </div>

        <div className="setting-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={useTargetSize}
              onChange={(e) => setUseTargetSize(e.target.checked)}
            />
            <span>Set target file size</span>
          </label>
          {useTargetSize && (
            <div className="target-size-input">
              <input
                type="number"
                value={targetSize}
                onChange={(e) => setTargetSize(e.target.value)}
                placeholder="Enter target size in MB"
                min="0.1"
                step="0.1"
                className="size-input"
              />
              <span className="size-unit">MB</span>
            </div>
          )}
        </div>
      </div>

      <div className="action-buttons">
        <button
          onClick={handleCompress}
          disabled={!file || compressing}
          className={`compress-btn ${!file || compressing ? 'disabled' : ''}`}
        >
          {compressing ? (
            <>
              <FaSpinner className="spinner" />
              Compressing...
            </>
          ) : (
            'Compress PDF'
          )}
        </button>
        <button onClick={resetForm} className="reset-btn">
          Reset
        </button>
      </div>

      {compressionResults && (
        <div className="compression-results">
          <h3>Compression Results</h3>
          <div className="results-grid">
            <div className="result-item">
              <span className="result-label">Original Size:</span>
              <span className="result-value">{compressionResults.originalSize}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Compressed Size:</span>
              <span className="result-value success">{compressionResults.compressedSize}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Compression Ratio:</span>
              <span className="result-value success">{compressionResults.compressionRatio}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Quality Used:</span>
              <span className="result-value">{compressionResults.qualityUsed}</span>
            </div>
            {compressionResults.targetSizeUsed && (
              <div className="result-item">
                <span className="result-label">Target Size:</span>
                <span className="result-value">{compressionResults.targetSizeUsed}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {compressedPdf && (
        <div className="download-section">
          <h3>Download Compressed PDF</h3>
          <button onClick={downloadCompressedPdf} className="download-btn">
            <FaDownload className="download-icon" />
            Download Compressed PDF
          </button>
        </div>
      )}

      <div className="info-section">
        <h4>How Advanced Compression Works</h4>
        <ul>
          <li><strong>High Quality:</strong> Maintains 300 DPI resolution, best for printing and professional documents</li>
          <li><strong>Medium Quality:</strong> Uses 200 DPI resolution, perfect for general use and sharing</li>
          <li><strong>Low Quality:</strong> Uses 150 DPI resolution, ideal for web viewing and email attachments</li>
          <li><strong>Target Size:</strong> Automatically adjusts quality to meet your specified file size</li>
          <li><strong>Smart Compression:</strong> Uses Ghostscript for professional-grade PDF optimization</li>
        </ul>
      </div>
    </div>
  );
};

export default AdvancedCompressPDF;
