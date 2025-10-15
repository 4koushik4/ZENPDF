import React, { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from 'pdfjs-dist';
import './RotatePDF.css';
// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const RotatePDF = () => {
  const [pages, setPages] = useState([]);
  const [rotations, setRotations] = useState([]);
  const [fileName, setFileName] = useState("rotated");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const fileInputRef = useRef();

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setError(null);
    setSuccess(false);
    setPages([]);
    setRotations([]);
    setCurrentPageIndex(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      const pagePreviews = [];
      const pageRotations = [];

      for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const viewport = page.getViewport({ scale: 0.2 }); // Smaller scale for faster loading

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;

        const src = canvas.toDataURL("image/png");
        pagePreviews.push({ 
          id: i, 
          src, 
          pageNumber: i + 1,
          originalIndex: i
        });
        pageRotations.push(0); // Start with 0° rotation for each page
      }

      setPages(pagePreviews);
      setRotations(pageRotations);
    } catch (err) {
      console.error("Error loading PDF:", err);
      setError("Error loading PDF file. Please try another file.");
    }
  };

  const handleRotationChange = (pageIndex, angle) => {
    setRotations(prev => {
      const newRotations = [...prev];
      newRotations[pageIndex] = angle;
      return newRotations;
    });
  };

  const rotateAll = (angle) => {
    setRotations(prev => prev.map(() => angle));
  };

  const resetAll = () => {
    setRotations(prev => prev.map(() => 0));
  };

  const handleDownload = async () => {
    if (!pages.length || !fileInputRef.current?.files?.[0]) {
      setError("Please select a PDF file first.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const file = fileInputRef.current.files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      // Copy each page and apply the rotation
      for (let i = 0; i < pdfDoc.getPageCount(); i++) {
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
        
        // Apply rotation (convert degrees to radians)
        const rotationAngle = (rotations[i] * Math.PI) / 180;
        copiedPage.setRotation(rotationAngle);
        
        newPdf.addPage(copiedPage);
      }

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      setSuccess(true);
    } catch (err) {
      console.error("Error creating PDF:", err);
      setError("Error creating rotated PDF. Please try again. Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Count how many pages have been rotated (not 0 degrees)
  const rotatedPagesCount = rotations.filter(rot => rot !== 0).length;

  return (
    <div className="rotate-pages">
      <div className="rotate-pages-container">
        <h2>Rotate PDF Pages</h2>
        <p style={{ color: '#fff', opacity: 0.8, marginBottom: '20px' }}>
          Rotate only the pages you need. Unchanged pages will remain as is.
        </p>

        <div className="form-group">
          <label htmlFor="pdfFile">Select PDF File:</label>
          <input
            ref={fileInputRef}
            type="file"
            id="pdfFile"
            accept=".pdf"
            onChange={handleFileChange}
          />
        </div>

        {pages.length > 0 && (
          <>
            {/* Bulk Actions */}
            <div className="bulk-actions" style={{ 
              marginBottom: '20px', 
              display: 'flex', 
              gap: '10px', 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button 
                type="button"
                className="bulk-btn"
                onClick={() => rotateAll(90)}
              >
                Rotate All 90°
              </button>
              <button 
                type="button"
                className="bulk-btn"
                onClick={() => rotateAll(180)}
              >
                Rotate All 180°
              </button>
              <button 
                type="button"
                className="bulk-btn"
                onClick={() => rotateAll(270)}
              >
                Rotate All 270°
              </button>
              <button 
                type="button"
                className="bulk-btn reset-btn"
                onClick={resetAll}
              >
                Reset All
              </button>
            </div>

            {/* Quick Stats */}
            <div style={{ 
              textAlign: 'center', 
              color: '#fff', 
              marginBottom: '15px',
              background: 'rgba(255,255,255,0.1)',
              padding: '10px',
              borderRadius: '8px'
            }}>
              <strong>Total Pages: {pages.length}</strong> | 
              <strong style={{ color: '#4facfe' }}> Rotated: {rotatedPagesCount}</strong> | 
              <strong style={{ color: '#28a745' }}> Unchanged: {pages.length - rotatedPagesCount}</strong>
            </div>

            {/* Page Grid - All pages visible */}
            <div className="page-grid">
              {pages.map((page, index) => (
                <div key={page.id} className="page-preview">
                  <div style={{ 
                    position: 'relative',
                    background: 'white',
                    padding: '10px',
                    borderRadius: '8px',
                    border: rotations[index] !== 0 ? '3px solid #4facfe' : '1px solid #ddd'
                  }}>
                    <img
                      src={page.src}
                      alt={`Page ${page.pageNumber}`}
                      style={{
                        width: '120px',
                        height: '160px',
                        objectFit: 'contain',
                        transform: `rotate(${rotations[index]}deg)`,
                        transition: 'transform 0.3s ease',
                        marginBottom: '8px'
                      }}
                    />
                    
                    <div style={{ 
                      textAlign: 'center', 
                      fontWeight: 'bold', 
                      marginBottom: '8px',
                      color: '#333'
                    }}>
                      Page {page.pageNumber}
                      {rotations[index] !== 0 && (
                        <span style={{ 
                          color: '#4facfe', 
                          fontSize: '12px',
                          display: 'block'
                        }}>
                          {rotations[index]}°
                        </span>
                      )}
                    </div>

                    {/* Rotation Controls */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr',
                      gap: '5px',
                      marginBottom: '8px'
                    }}>
                      <button 
                        type="button"
                        onClick={() => handleRotationChange(index, 0)}
                        style={{
                          padding: '4px 8px',
                          background: rotations[index] === 0 ? '#0072ff' : '#6c757d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        0°
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleRotationChange(index, 90)}
                        style={{
                          padding: '4px 8px',
                          background: rotations[index] === 90 ? '#0072ff' : '#6c757d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        90°
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleRotationChange(index, 180)}
                        style={{
                          padding: '4px 8px',
                          background: rotations[index] === 180 ? '#0072ff' : '#6c757d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        180°
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleRotationChange(index, 270)}
                        style={{
                          padding: '4px 8px',
                          background: rotations[index] === 270 ? '#0072ff' : '#6c757d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        270°
                      </button>
                    </div>

                    {/* Quick Rotate Buttons */}
                    <div style={{ 
                      display: 'flex', 
                      gap: '4px',
                      justifyContent: 'center'
                    }}>
                      <button 
                        type="button"
                        onClick={() => handleRotationChange(index, (rotations[index] - 90 + 360) % 360)}
                        style={{
                          padding: '3px 6px',
                          background: '#4facfe',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '10px'
                        }}
                        title="Rotate -90°"
                      >
                        ⟲ -90
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleRotationChange(index, (rotations[index] + 90) % 360)}
                        style={{
                          padding: '3px 6px',
                          background: '#4facfe',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '10px'
                        }}
                        title="Rotate +90°"
                      >
                        +90 ⟳
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Download Section */}
            <div className="download-section" style={{
              textAlign: 'center',
              marginTop: '30px',
              padding: '20px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '10px'
            }}>
              <div className="form-group">
                <label htmlFor="fileName" style={{ color: '#fff', fontSize: '18px' }}>
                  Output Filename:
                </label>
                <input
                  type="text"
                  id="fileName"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Enter filename"
                  style={{
                    width: '80%',
                    maxWidth: '300px',
                    margin: '10px auto'
                  }}
                />
              </div>

              <button 
                className="download-btn" 
                onClick={handleDownload} 
                disabled={loading}
                type="button"
                style={{
                  padding: '15px 30px',
                  fontSize: '18px',
                  background: 'linear-gradient(135deg, #00c6ff, #0072ff)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? "Creating Rotated PDF..." : "Download Rotated PDF"}
              </button>

              <div style={{ color: '#fff', marginTop: '10px', fontSize: '14px' }}>
                {rotatedPagesCount > 0 ? (
                  <span style={{ color: '#4facfe' }}>
                    ✓ {rotatedPagesCount} page{rotatedPagesCount !== 1 ? 's' : ''} will be rotated
                  </span>
                ) : (
                  <span style={{ color: '#ffcc00' }}>
                    ⚠ No pages rotated yet. Download will create original PDF.
                  </span>
                )}
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            ✅ PDF rotated and downloaded successfully!
          </div>
        )}

        {pages.length === 0 && !error && (
          <div style={{ 
            textAlign: 'center', 
            color: '#fff', 
            marginTop: '20px',
            opacity: 0.8 
          }}>
            Select a PDF file to rotate pages
          </div>
        )}
      </div>
    </div>
  );
};

export default RotatePDF;
