import React, { useState, useRef } from 'react';
import './RemovePages.css';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const RemovePages = () => {
  const [file, setFile] = useState(null);
  const [pageImages, setPageImages] = useState([]); // thumbnails
  const [pagesToRemove, setPagesToRemove] = useState([]); // indices
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
      const baseName = selectedFile.name.replace('.pdf', '');
      setFileName(`${baseName}-pages-removed`);

      // render thumbnails
      const fileReader = new FileReader();
      fileReader.onload = async function () {
        try {
          const typedarray = new Uint8Array(this.result);
          const loadingTask = pdfjsLib.getDocument({ data: typedarray });
          const pdf = await loadingTask.promise;
          const images = [];

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1 }); // better clarity
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport }).promise;
            images.push(canvas.toDataURL());
          }

          setPageImages(images);
          setPagesToRemove([]);
        } catch (err) {
          console.error('Error rendering PDF:', err);
          setError('Unable to preview pages. Please try another file.');
        }
      };
      fileReader.readAsArrayBuffer(selectedFile);
    } else {
      setFile(null);
      setError('Please select a valid PDF file');
      setPageImages([]);
      setPagesToRemove([]);
    }
  };

  const togglePageRemove = (idx) => {
    setPagesToRemove((prev) =>
      prev.includes(idx)
        ? prev.filter((i) => i !== idx)
        : [...prev, idx]
    );
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
    if (pageImages.length === 0) {
      setError('No pages to process');
      return;
    }
    if (pagesToRemove.length === pageImages.length) {
      setError('Cannot remove all pages. At least one must remain.');
      return;
    }

    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const totalPages = pdfDoc.getPageCount();
      const newPdfDoc = await PDFDocument.create();

      for (let i = 0; i < totalPages; i++) {
        if (!pagesToRemove.includes(i)) {
          const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
          newPdfDoc.addPage(copiedPage);
        }
      }

      const pdfBytes = await newPdfDoc.save();
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
      setFile(null);
      setPageImages([]);
      setPagesToRemove([]);
      setFileName('');
      setError('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'An error occurred while removing pages');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="remove-pages">
      <div className="remove-pages-container">
        <h2>Remove PDF Pages</h2>
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

          {pageImages.length > 0 && (
            <div
              className="remove-page-thumbnails"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                justifyContent: 'center',
                margin: '20px 0 24px 0',
              }}
            >
              {pageImages.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => togglePageRemove(idx)}
                  title={
                    pagesToRemove.includes(idx)
                      ? 'Unmark for removal'
                      : 'Mark for removal'
                  }
                  style={{
                    border: pagesToRemove.includes(idx)
                      ? '3px solid #dc3545'
                      : '1px solid #ccc',
                    borderRadius: 8,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                    width: 120,
                    height: 160,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    background: '#fff',
                  }}
                >
                  <img
                    src={img}
                    alt={`Page ${idx + 1}`}
                    style={{
                      width: 110,
                      height: 150,
                      objectFit: 'contain',
                      borderRadius: 6,
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: 4,
                      left: 4,
                      background: pagesToRemove.includes(idx)
                        ? '#dc3545'
                        : '#ccc',
                      color: 'white',
                      borderRadius: '50%',
                      width: 24,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: 14,
                      border: '2px solid #fff',
                    }}
                  >
                    {idx + 1}
                  </span>
                </div>
              ))}
            </div>
          )}

          {pageImages.length > 0 && (
            <div className="form-group">
              <label htmlFor="fileName">Output Filename:</label>
              <input
                type="text"
                id="fileName"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Enter filename (without .pdf extension)"
                required
              />
            </div>
          )}

          {pageImages.length > 0 && (
            <button type="submit" disabled={loading} className="BUTTON">
              {loading ? 'Removing Pages...' : 'Remove Selected Pages'}
            </button>
          )}
        </form>

        {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="success-message">Pages removed successfully!</div>
        )}
      </div>
    </div>
  );
};

export default RemovePages;
