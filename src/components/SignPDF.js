import React, { useState, useRef } from 'react';
import './SignPDF.css';
import { PDFDocument, rgb } from 'pdf-lib';

const SignPDF = () => {
  const [file, setFile] = useState(null);
  const [signature, setSignature] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [selectedPages, setSelectedPages] = useState('all');
  const [selectedStyle, setSelectedStyle] = useState({
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: 'black',
    position: 'bottom-right',
    showDate: true,
    showLine: true
  });
  const fileInputRef = useRef(null);

  const styleOptions = {
    fontSize: [16, 20, 24, 28, 32],
    fontFamily: ['Helvetica-Bold', 'Helvetica', 'Times-Roman-Bold', 'Times-Roman'],
    color: ['black', 'blue', 'red', 'darkgreen'],
    position: ['bottom-right', 'bottom-left', 'top-right', 'top-left', 'center']
  };

  const resetForm = () => {
    setFile(null);
    setSignature('');
    setFileName('');
    setSelectedPages('all');
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
      const baseName = selectedFile.name.replace('.pdf', '');
      setFileName(`${baseName}-signed`);
      setError('');
    } else {
      setFile(null);
      setError('Please select a valid PDF file');
    }
  };

  const handleSignatureChange = (e) => {
    setSignature(e.target.value);
    setError('');
  };

  const handleFileNameChange = (e) => {
    setFileName(e.target.value);
    setError('');
  };

  const handlePagesChange = (e) => {
    setSelectedPages(e.target.value);
    setError('');
  };

  const handleStyleChange = (property, value) => {
    setSelectedStyle(prev => ({
      ...prev,
      [property]: value
    }));
  };

  const getPositionCoordinates = (position, width, height) => {
    switch (position) {
      case 'bottom-right':
        return { x: width - 250, y: 50 };
      case 'bottom-left':
        return { x: 50, y: 50 };
      case 'top-right':
        return { x: width - 250, y: height - 50 };
      case 'top-left':
        return { x: 50, y: height - 50 };
      case 'center':
        return { x: width / 2 - 100, y: height / 2 };
      default:
        return { x: width - 250, y: 50 };
    }
  };

  const getColorRGB = (color) => {
    switch (color) {
      case 'blue':
        return rgb(0, 0, 0.8);
      case 'red':
        return rgb(0.8, 0, 0);
      case 'darkgreen':
        return rgb(0, 0.5, 0);
      default:
        return rgb(0, 0, 0);
    }
  };

  const parsePageRange = (input, totalPages) => {
    if (input.toLowerCase() === 'all') {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    const pages = new Set();
    const parts = input.split(',').map(part => part.trim());

    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(num => parseInt(num.trim()));
        if (isNaN(start) || isNaN(end) || start > end) {
          throw new Error('Invalid page range format');
        }
        for (let i = start; i <= end && i <= totalPages; i++) {
          pages.add(i - 1); // Convert to 0-based index
        }
      } else {
        const page = parseInt(part);
        if (isNaN(page)) {
          throw new Error('Invalid page number format');
        }
        if (page > 0 && page <= totalPages) {
          pages.add(page - 1); // Convert to 0-based index
        }
      }
    }

    return Array.from(pages).sort((a, b) => a - b);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    if (!signature) {
      setError('Please enter your signature');
      return;
    }

    if (!fileName) {
      setError('Please enter a filename');
      return;
    }

    setLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const totalPages = pdfDoc.getPageCount();

      // Parse selected pages
      const pagesToSign = parsePageRange(selectedPages, totalPages);

      // Add signature to selected pages
      for (const pageIndex of pagesToSign) {
        const page = pdfDoc.getPage(pageIndex);
        const { width, height } = page.getSize();
        const position = getPositionCoordinates(selectedStyle.position, width, height);
        const color = getColorRGB(selectedStyle.color);

        // Add signature text
        page.drawText(signature, {
          x: position.x,
          y: position.y,
          size: selectedStyle.fontSize,
          color: color,
          font: await pdfDoc.embedFont(selectedStyle.fontFamily),
        });

        // Add line if selected
        if (selectedStyle.showLine) {
          page.drawLine({
            start: { x: position.x, y: position.y - 5 },
            end: { x: position.x + 200, y: position.y - 5 },
            thickness: 1,
            color: color,
          });
        }

        // Add date if selected
        if (selectedStyle.showDate) {
          const today = new Date().toLocaleDateString();
          page.drawText(today, {
            x: position.x,
            y: position.y - 25,
            size: selectedStyle.fontSize * 0.5,
            color: color,
            font: await pdfDoc.embedFont('Helvetica'),
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
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
      setError(err.message || 'An error occurred while signing the PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sign-pdf">
      <div className="sign-pdf-container">
        <h2>Sign PDF</h2>
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
            <label htmlFor="signature">Your Signature:</label>
            <input
              type="text"
              id="signature"
              value={signature}
              onChange={handleSignatureChange}
              placeholder="Enter your signature"
              required
              style={{ color: '#000' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="pages">Pages to Sign:</label>
            <input
              type="text"
              id="pages"
              value={selectedPages}
              onChange={handlePagesChange}
              placeholder="e.g., all, 1,3,5-7"
              required
            />
            <small className="help-text">
              Enter 'all' for all pages, or specific page numbers/ranges (e.g., 1,3,5-7)
            </small>
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

          <div className="form-group">
            <label>Signature Style:</label>
            <div className="style-options">
              <div>
                <label>Font Size:</label>
                <select
                  value={selectedStyle.fontSize}
                  onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value))}
                >
                  {styleOptions.fontSize.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>Font Family:</label>
                <select
                  value={selectedStyle.fontFamily}
                  onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                >
                  {styleOptions.fontFamily.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>Color:</label>
                <select
                  value={selectedStyle.color}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                >
                  {styleOptions.color.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>Position:</label>
                <select
                  value={selectedStyle.position}
                  onChange={(e) => handleStyleChange('position', e.target.value)}
                >
                  {styleOptions.position.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedStyle.showDate}
                    onChange={(e) => handleStyleChange('showDate', e.target.checked)}
                  />
                  Show Date
                </label>
              </div>

              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedStyle.showLine}
                    onChange={(e) => handleStyleChange('showLine', e.target.checked)}
                  />
                  Show Line
                </label>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Signing PDF...' : 'Sign PDF'}
          </button>
        </form>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">PDF signed successfully!</div>}
      </div>
    </div>
  );
};

export default SignPDF; 