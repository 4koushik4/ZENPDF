import React, { useState, useRef } from 'react';
import './RemovePages.css';
import { PDFDocument, degrees } from 'pdf-lib';

const RotatePDF = () => {
  const [file, setFile] = useState(null);
  const [selectedPages, setSelectedPages] = useState('');
  const [rotation, setRotation] = useState('90');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const resetForm = () => {
    setFile(null);
    setSelectedPages('');
    setRotation('90');
    setFileName('');
    setError('');
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      // Set default filename based on the uploaded file
      const baseName = selectedFile.name.replace('.pdf', '');
      setFileName(`${baseName}-rotated`);
      setError('');
    } else {
      setFile(null);
      setError('Please select a valid PDF file');
    }
  };

  const handlePagesChange = (e) => {
    setSelectedPages(e.target.value);
    setError('');
  };

  const handleRotationChange = (e) => {
    setRotation(e.target.value);
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

    if (!selectedPages) {
      setError('Please enter pages to rotate');
      return;
    }

    if (!fileName) {
      setError('Please enter a filename');
      return;
    }

    setLoading(true);

    try {
      // Parse the selected pages
      const pagesToRotate = new Set();
      const ranges = selectedPages.split(',').map(range => range.trim());
      
      for (const range of ranges) {
        if (range.includes('-')) {
          const [start, end] = range.split('-').map(num => parseInt(num.trim()));
          if (isNaN(start) || isNaN(end) || start > end) {
            throw new Error('Invalid page range format');
          }
          for (let i = start; i <= end; i++) {
            pagesToRotate.add(i);
          }
        } else {
          const page = parseInt(range);
          if (isNaN(page)) {
            throw new Error('Invalid page number format');
          }
          pagesToRotate.add(page);
        }
      }

      // Read the PDF file
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const totalPages = pdfDoc.getPageCount();

      // Validate page numbers
      for (const page of pagesToRotate) {
        if (page < 1 || page > totalPages) {
          throw new Error(`Page ${page} is out of range (1-${totalPages})`);
        }
      }

      // Rotate the selected pages
      for (let i = 0; i < totalPages; i++) {
        if (pagesToRotate.has(i + 1)) {
          const page = pdfDoc.getPage(i);
          // Use PDF-lib's degrees function for rotation
          page.setRotation(degrees(parseInt(rotation)));
        }
      }

      // Save the new PDF
      const pdfBytes = await pdfDoc.save();
      
      // Create a download link
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(true);
      resetForm();
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'An error occurred while rotating pages');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="remove-pages">
      <div className="remove-pages-container">
        <h2>Rotate PDF Pages</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="pdfFile">Select PDF File:</label>
            <input
              ref={fileInputRef}
              type="file"
              id="pdfFile"
              accept=".pdf"
              onChange={handleFileChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="pages">Pages to Rotate:</label>
            <input
              type="text"
              id="pages"
              value={selectedPages}
              onChange={handlePagesChange}
              placeholder="e.g., 1,3,5-7"
              required
            />
            <small className="help-text">
              Enter page numbers or ranges (e.g., 1,3,5-7)
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="rotation">Rotation Angle:</label>
            <select
              id="rotation"
              value={rotation}
              onChange={handleRotationChange}
              required
              style={{ color: '#000' }}
            >
              <option value="90" style={{ color: '#000' }}>90° Clockwise</option>
              <option value="180" style={{ color: '#000' }}>180°</option>
              <option value="270" style={{ color: '#000' }}>90° Counter-clockwise</option>
            </select>
          </div>

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
            {loading ? 'Rotating Pages...' : 'Rotate Pages'}
          </button>
        </form>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Pages rotated successfully!</div>}
      </div>
    </div>
  );
};

export default RotatePDF; 