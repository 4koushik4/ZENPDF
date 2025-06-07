import React, { useState, useRef } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import './AddPageNumbers.css';

const AddPageNumbers = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const resetForm = () => {
    setFile(null);
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
      const baseName = selectedFile.name.replace('.pdf', '');
      setFileName(`${baseName}-numbered`);
      setError('');
    } else {
      setFile(null);
      setError('Please select a valid PDF file');
    }
  };

  const handleFileNameChange = (e) => {
    setFileName(e.target.value);
    setError('');
  };

  const addPageNumbers = async (pdfDoc) => {
    const numPages = pdfDoc.getPageCount();
    const font = await pdfDoc.embedFont('Helvetica');

    for (let i = 0; i < numPages; i++) {
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();
      
      // Calculate font size (2% of page height)
      const fontSize = height * 0.02;
      
      // Add page number at bottom center
      page.drawText(`${i + 1}`, {
        x: width / 2 - fontSize / 2,
        y: fontSize + 10,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
    }

    return pdfDoc;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!file) {
      setError('Please select a PDF file');
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
      
      const newPdfDoc = await addPageNumbers(pdfDoc);
      const pdfBytes = await newPdfDoc.save();

      // Create download link
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
      setError('An error occurred while processing the PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-page-numbers">
      <div className="add-page-numbers-container">
        <h2>Add Page Numbers to PDF</h2>
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
            {loading ? 'Adding Page Numbers...' : 'Add Page Numbers'}
          </button>
        </form>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Page numbers added successfully!</div>}
      </div>
    </div>
  );
};

export default AddPageNumbers; 