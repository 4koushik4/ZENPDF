import React, { useState, useRef } from 'react';
import './RemovePages.css';
import { PDFDocument } from 'pdf-lib';

const ReorderPages = () => {
  const [file, setFile] = useState(null);
  const [pageOrder, setPageOrder] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const resetForm = () => {
    setFile(null);
    setPageOrder('');
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
      setFileName(`${baseName}-reordered`);
      setError('');
    } else {
      setFile(null);
      setError('Please select a valid PDF file');
    }
  };

  const handlePageOrderChange = (e) => {
    setPageOrder(e.target.value);
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

    if (!pageOrder) {
      setError('Please enter the new page order');
      return;
    }

    if (!fileName) {
      setError('Please enter a filename');
      return;
    }

    setLoading(true);

    try {
      // Parse the page order
      const newOrder = pageOrder.split(',').map(num => parseInt(num.trim()));
      
      // Validate that all entries are numbers
      if (newOrder.some(isNaN)) {
        throw new Error('Invalid page number format');
      }

      // Read the PDF file
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const totalPages = pdfDoc.getPageCount();

      // Validate page numbers
      for (const pageNum of newOrder) {
        if (pageNum < 1 || pageNum > totalPages) {
          throw new Error(`Page ${pageNum} is out of range (1-${totalPages})`);
        }
      }

      // Validate that all pages are included
      const uniquePages = new Set(newOrder);
      if (uniquePages.size !== totalPages) {
        throw new Error(`Please include all pages (1-${totalPages}) in the new order`);
      }

      // Create a new PDF document
      const newPdfDoc = await PDFDocument.create();

      // Copy pages in the new order
      for (const pageNum of newOrder) {
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageNum - 1]);
        newPdfDoc.addPage(copiedPage);
      }

      // Save the new PDF
      const pdfBytes = await newPdfDoc.save();
      
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
      setError(err.message || 'An error occurred while reordering pages');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="remove-pages">
      <div className="remove-pages-container">
        <h2>Reorder PDF Pages</h2>
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
            <label htmlFor="pageOrder">New Page Order:</label>
            <input
              type="text"
              id="pageOrder"
              value={pageOrder}
              onChange={handlePageOrderChange}
              placeholder="e.g., 3,1,2,4"
              required
            />
            <small className="help-text">
              Enter the new order of pages (e.g., 3,1,2,4)
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
          <button type="submit" disabled={loading}>
            {loading ? 'Reordering Pages...' : 'Reorder Pages'}
          </button>
        </form>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Pages reordered successfully!</div>}
      </div>
    </div>
  );
};

export default ReorderPages; 