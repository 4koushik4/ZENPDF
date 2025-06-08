import React, { useState } from 'react';
import './WatermarkPDF.css';
import config from '../config';

const WatermarkPDF = () => {
  const [file, setFile] = useState(null);
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkImage, setWatermarkImage] = useState(null);
  const [watermarkType, setWatermarkType] = useState('text'); // 'text' or 'image'
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // New state variables for watermark options
  const [position, setPosition] = useState('center');
  const [transparency, setTransparency] = useState(0.3);
  const [rotation, setRotation] = useState(45);
  const [layer, setLayer] = useState('above');
  const [selectedPages, setSelectedPages] = useState('all');
  const [fontSize, setFontSize] = useState(50);
  const [imageSize, setImageSize] = useState(100); // Size in percentage

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      // Set default filename based on the uploaded file
      const baseName = selectedFile.name.replace('.pdf', '');
      setFileName(`${baseName}-watermarked`);
      setError('');
    } else {
      setFile(null);
      setError('Please select a valid PDF file');
    }
  };

  const handleWatermarkTextChange = (e) => {
    setWatermarkText(e.target.value);
    setError('');
  };

  const handleWatermarkImageChange = (e) => {
    const selectedImage = e.target.files[0];
    if (selectedImage && (selectedImage.type === 'image/jpeg' || selectedImage.type === 'image/png')) {
      setWatermarkImage(selectedImage);
      setError('');
    } else {
      setWatermarkImage(null);
      setError('Please select a valid image file (JPEG or PNG)');
    }
  };

  const handleWatermarkTypeChange = (e) => {
    setWatermarkType(e.target.value);
    setWatermarkText('');
    setWatermarkImage(null);
    setError('');
  };

  const handleFileNameChange = (e) => {
    setFileName(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    if (watermarkType === 'text' && !watermarkText) {
      setError('Please enter watermark text');
      return;
    }

    if (watermarkType === 'image' && !watermarkImage) {
      setError('Please select a watermark image');
      return;
    }

    if (!fileName) {
      setError('Please enter a filename');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('watermarkType', watermarkType);
      
      if (watermarkType === 'text') {
        formData.append('watermarkText', watermarkText);
      } else {
        formData.append('watermarkImage', watermarkImage);
      }
      
      formData.append('fileName', fileName);
      formData.append('position', position);
      formData.append('transparency', transparency);
      formData.append('rotation', rotation);
      formData.append('layer', layer);
      formData.append('selectedPages', selectedPages);
      formData.append('fontSize', fontSize);
      formData.append('imageSize', imageSize);

      console.log('Sending request to watermark PDF...');
      const response = await fetch(`${config.apiUrl}/watermark-pdf`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'Accept': 'application/pdf',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        let errorMessage = 'Failed to add watermark';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }

      // Check if the response is actually a PDF
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/pdf')) {
        throw new Error('Invalid response format. Expected PDF file.');
      }

      // Get the watermarked PDF as a blob
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(true);
      setFile(null);
      setWatermarkText('');
      setWatermarkImage(null);
      setFileName('');
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'An error occurred while watermarking the PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="watermark-pdf">
      <div className="watermark-pdf-container">
        <h2>Add Watermark to PDF</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="pdfFile">Select PDF File:</label>
            <input
              type="file"
              id="pdfFile"
              accept=".pdf"
              onChange={handleFileChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="watermarkType">Watermark Type:</label>
            <select
              id="watermarkType"
              value={watermarkType}
              onChange={handleWatermarkTypeChange}
            >
              <option value="text">Text Watermark</option>
              <option value="image">Image Watermark</option>
            </select>
          </div>

          {watermarkType === 'text' ? (
            <div className="form-group">
              <label htmlFor="watermarkText">Watermark Text:</label>
              <input
                type="text"
                id="watermarkText"
                value={watermarkText}
                onChange={handleWatermarkTextChange}
                placeholder="Enter watermark text"
                required
              />
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="watermarkImage">Watermark Image:</label>
              <input
                type="file"
                id="watermarkImage"
                accept="image/jpeg,image/png"
                onChange={handleWatermarkImageChange}
                required
              />
              <small>Supported formats: JPEG, PNG</small>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="position">Position:</label>
            <select
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            >
              <option value="center">Center</option>
              <option value="top-left">Top Left</option>
              <option value="top-right">Top Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-right">Bottom Right</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="transparency">Transparency:</label>
            <input
              type="range"
              id="transparency"
              min="0.1"
              max="1"
              step="0.1"
              value={transparency}
              onChange={(e) => setTransparency(parseFloat(e.target.value))}
            />
            <span>{Math.round(transparency * 100)}%</span>
          </div>

          <div className="form-group">
            <label htmlFor="rotation">Rotation (degrees):</label>
            <input
              type="range"
              id="rotation"
              min="0"
              max="360"
              step="45"
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
            />
            <span>{rotation}°</span>
          </div>

          <div className="form-group">
            <label htmlFor="layer">Layer:</label>
            <select
              id="layer"
              value={layer}
              onChange={(e) => setLayer(e.target.value)}
            >
              <option value="above">Above Content</option>
              <option value="below">Below Content</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="selectedPages">Pages:</label>
            <input
              type="text"
              id="selectedPages"
              value={selectedPages}
              onChange={(e) => setSelectedPages(e.target.value)}
              placeholder="all or 1,2,3 or 1-5"
            />
            <small>Enter 'all' for all pages, or specify pages like '1,2,3' or '1-5'</small>
          </div>

          {watermarkType === 'text' ? (
            <div className="form-group">
              <label htmlFor="fontSize">Font Size:</label>
              <input
                type="range"
                id="fontSize"
                min="10"
                max="100"
                step="5"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
              />
              <span>{fontSize}px</span>
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="imageSize">Image Size:</label>
              <input
                type="range"
                id="imageSize"
                min="10"
                max="200"
                step="10"
                value={imageSize}
                onChange={(e) => setImageSize(parseInt(e.target.value))}
              />
              <span>{imageSize}%</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="fileName">Output Filename:</label>
            <input
              type="text"
              id="fileName"
              value={fileName}
              onChange={handleFileNameChange}
              placeholder="Enter filename (without .pdf extension)"
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Adding Watermark...' : 'Add Watermark'}
          </button>
        </form>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Watermark added successfully!</div>}
      </div>
    </div>
  );
};

export default WatermarkPDF; 