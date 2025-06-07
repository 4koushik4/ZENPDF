import React, { useState, useRef } from "react";
import "./CompressPDF.css";
import config from '../config';

const CompressPDF = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [compressedPdf, setCompressedPdf] = useState(null);
  const [originalSize, setOriginalSize] = useState(null);
  const [compressedSize, setCompressedSize] = useState(null);
  const [compressionRatio, setCompressionRatio] = useState(null);
  const [pdfName, setPdfName] = useState("");
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check if file is a PDF
      if (!file.type.includes('pdf')) {
        setError("Please upload a PDF file");
        return;
      }
      // Check if file is too large (e.g., > 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setError("File size must be less than 50MB");
        return;
      }
      setPdfFile(file);
      setPdfName(file.name.replace('.pdf', ''));
      setError(null);
      setSuccess(false);
      setCompressedPdf(null);
      setOriginalSize(null);
      setCompressedSize(null);
      setCompressionRatio(null);
    }
  };

  const handleNameChange = (e) => {
    setPdfName(e.target.value);
  };

  const compressPDF = async () => {
    if (!pdfFile) {
      setError("Please upload a PDF file first.");
      return;
    }

    setIsCompressing(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', pdfFile);

      console.log('Sending request to backend...');
      const response = await fetch(`${config.apiUrl}/compress`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/pdf',
        },
      }).catch(err => {
        console.error('Network error:', err);
        throw new Error('Cannot connect to the server. Please try again later.');
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to compress PDF');
      }

      // Get compression info from headers
      const originalSize = response.headers.get('X-Original-Size');
      const compressedSize = response.headers.get('X-Compressed-Size');
      const compressionRatio = response.headers.get('X-Compression-Ratio');

      setOriginalSize(originalSize);
      setCompressedSize(compressedSize);
      setCompressionRatio(compressionRatio);

      // Get the compressed file as a blob
      const compressedBlob = await response.blob();
      setCompressedPdf(URL.createObjectURL(compressedBlob));
      setSuccess(true);
    } catch (err) {
      console.error('Compression error:', err);
      setError(err.message || 'Failed to connect to the server. Please make sure the backend is running on port 5000.');
    } finally {
      setIsCompressing(false);
    }
  };

  const resetForm = () => {
    setPdfFile(null);
    setCompressedPdf(null);
    setOriginalSize(null);
    setCompressedSize(null);
    setCompressionRatio(null);
    setPdfName("");
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="compress-pdf">
      <div className="compress-pdf-container">
        <h2>Compress PDF</h2>
        <p className="info-text">Files will be compressed to reduce size while maintaining quality</p>
        
        <div className="form-group">
          <input 
            type="file" 
            accept="application/pdf" 
            onChange={handleFileChange} 
            className="file-input" 
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            placeholder="Enter PDF name (e.g., myfile.pdf)"
            value={pdfName}
            onChange={handleNameChange}
            className="name-input"
          />
        </div>

        <button 
          onClick={compressPDF} 
          className="compress-button"
          disabled={isCompressing || !pdfFile}
        >
          {isCompressing ? 'Compressing...' : 'Compress PDF'}
        </button>
        
        {error && <p className="error-message">{error}</p>}
        
        {success && originalSize && compressedSize && (
          <div className="compression-info">
            <p>Original Size: {originalSize} MB</p>
            <p>Compressed Size: {compressedSize} MB</p>
            <p>Compression Ratio: {compressionRatio}%</p>
          </div>
        )}
        
        {compressedPdf && (
          <div className="download-section">
            <a 
              href={compressedPdf} 
              download={`${pdfName}-compressed.pdf`} 
              className="download-link"
            >
              Download Compressed PDF
            </a>
            <button onClick={resetForm} className="reset-button">
              Compress Another PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompressPDF;