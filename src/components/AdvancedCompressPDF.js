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
      if (useTargetSize) formData.append('targetSizeMB', targetSize);

      console.log('Sending request to compress PDF...');
      const response = await fetch(`${config.pdfApiUrl}/compress`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        let errorMessage = 'Failed to compress PDF';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }

      // Get compression info from headers
      const originalSize = response.headers.get('X-Original-Size');
      const compressedSize = response.headers.get('X-Compressed-Size');
      const compressionRatio = response.headers.get('X-Compression-Ratio');
      const qualityUsed = response.headers.get('X-Quality-Used');
      const targetSizeUsed = response.headers.get('X-Target-Size');

      setCompressionResults({
        originalSize: (originalSize / (1024 * 1024)).toFixed(2) + ' MB',
        compressedSize: (compressedSize / (1024 * 1024)).toFixed(2) + ' MB',
        compressionRatio,
        qualityUsed,
        targetSizeUsed
      });

      // Get the compressed PDF as blob
      const blob = await response.blob();
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
      case 'high': return 'Minimal quality loss, best for printing and professional use';
      case 'medium': return 'Balanced compression, good for general use and sharing';
      case 'low': return 'Maximum compression, suitable for web viewing and email';
      default: return '';
    }
  };

  return (
    <div className="advanced-compress-container">
      {/* Upload & Settings */}
      <div className="upload-section">
        <input type="file" accept=".pdf" onChange={handleFileChange} />
      </div>
      <div className="compression-settings">
        <select value={quality} onChange={e => setQuality(e.target.value)}>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <input type="checkbox" checked={useTargetSize} onChange={e => setUseTargetSize(e.target.checked)} />
        {useTargetSize && <input type="number" value={targetSize} onChange={e => setTargetSize(e.target.value)} />}
      </div>

      {/* Actions */}
      <button onClick={handleCompress} disabled={!file || compressing}>
        {compressing ? 'Compressing...' : 'Compress PDF'}
      </button>
      <button onClick={resetForm}>Reset</button>

      {/* Compression Results */}
      {compressionResults && (
        <div className="compression-results">
          <p>Original Size: {compressionResults.originalSize}</p>
          <p>Compressed Size: {compressionResults.compressedSize}</p>
          <p>Compression Ratio: {compressionResults.compressionRatio}</p>
          <p>Quality Used: {compressionResults.qualityUsed}</p>
          {compressionResults.targetSizeUsed && <p>Target Size: {compressionResults.targetSizeUsed} MB</p>}
        </div>
      )}

      {/* Download */}
      {compressedPdf && (
        <button onClick={downloadCompressedPdf}>Download Compressed PDF</button>
      )}
    </div>
  );
};

export default AdvancedCompressPDF;
