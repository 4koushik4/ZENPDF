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
  const [completedPages, setCompletedPages] = useState([]);
  const fileInputRef = useRef();

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setError(null);
    setSuccess(false);
    setPages([]);
    setRotations([]);
    setCurrentPageIndex(0);
    setCompletedPages([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      const pagePreviews = [];
      const pageRotations = [];

      for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const viewport = page.getViewport({ scale: 0.3 });

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

  const handleRotationChange = (angle) => {
    setRotations(prev => {
      const newRotations = [...prev];
      newRotations[currentPageIndex] = angle;
      return newRotations;
    });
  };

  const markPageAsCompleted = () => {
    if (!completedPages.includes(currentPageIndex)) {
      setCompletedPages(prev => [...prev, currentPageIndex]);
    }
  };

  const goToNextPage = () => {
    markPageAsCompleted();
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const goToPage = (pageIndex) => {
    markPageAsCompleted();
    setCurrentPageIndex(pageIndex);
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
      setError("Error creating rotated PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isAllPagesCompleted = completedPages.length === pages.length && pages.length > 0;

  return (
    <div className="rotate-pages">
      <div className="rotate-pages-container">
        <h2>Rotate PDF Pages - Step by Step</h2>

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
            {/* Progress Indicator */}
            <div className="progress-section" style={{ 
              marginBottom: '20px', 
              textAlign: 'center' 
            }}>
              <div className="progress-text" style={{ 
                color: '#fff', 
                marginBottom: '10px',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                Page {currentPageIndex + 1} of {pages.length}
                {completedPages.includes(currentPageIndex) && " ✓"}
              </div>
              
              <div className="progress-bar" style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'rgba(255,255,255,0.3)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${((currentPageIndex + 1) / pages.length) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(135deg, #00c6ff, #0072ff)',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>

              <div className="page-indicators" style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '5px',
                marginTop: '10px',
                flexWrap: 'wrap'
              }}>
                {pages.map((page, index) => (
                  <button
                    key={page.id}
                    type="button"
                    className={`page-indicator ${index === currentPageIndex ? 'active' : ''} ${completedPages.includes(index) ? 'completed' : ''}`}
                    onClick={() => goToPage(index)}
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      border: '2px solid',
                      borderColor: index === currentPageIndex ? '#0072ff' : 
                                  completedPages.includes(index) ? '#28a745' : '#fff',
                      background: completedPages.includes(index) ? '#28a745' : 'transparent',
                      color: index === currentPageIndex ? '#0072ff' : 
                            completedPages.includes(index) ? '#fff' : '#fff',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Page View */}
            <div className="current-page-section" style={{
              textAlign: 'center',
              marginBottom: '30px'
            }}>
              <h3 style={{ color: '#fff', marginBottom: '15px' }}>
                Current Page: {currentPageIndex + 1}
              </h3>
              
              <div className="current-page-preview" style={{
                display: 'inline-block',
                background: 'white',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
              }}>
                <img
                  src={pages[currentPageIndex].src}
                  alt={`Page ${pages[currentPageIndex].pageNumber}`}
                  style={{
                    width: '200px',
                    height: 'auto',
                    transform: `rotate(${rotations[currentPageIndex]}deg)`,
                    transition: 'transform 0.3s ease',
                    marginBottom: '15px'
                  }}
                />
                
                <div className="rotation-controls" style={{
                  marginBottom: '15px'
                }}>
                  <div style={{ 
                    color: '#333', 
                    marginBottom: '10px',
                    fontWeight: 'bold'
                  }}>
                    Current Rotation: {rotations[currentPageIndex]}°
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    gap: '10px', 
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                  }}>
                    <button 
                      type="button"
                      className="rotation-option"
                      onClick={() => handleRotationChange(0)}
                      style={{
                        padding: '10px 15px',
                        background: rotations[currentPageIndex] === 0 ? '#0072ff' : '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      0°
                    </button>
                    <button 
                      type="button"
                      className="rotation-option"
                      onClick={() => handleRotationChange(90)}
                      style={{
                        padding: '10px 15px',
                        background: rotations[currentPageIndex] === 90 ? '#0072ff' : '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      90°
                    </button>
                    <button 
                      type="button"
                      className="rotation-option"
                      onClick={() => handleRotationChange(180)}
                      style={{
                        padding: '10px 15px',
                        background: rotations[currentPageIndex] === 180 ? '#0072ff' : '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      180°
                    </button>
                    <button 
                      type="button"
                      className="rotation-option"
                      onClick={() => handleRotationChange(270)}
                      style={{
                        padding: '10px 15px',
                        background: rotations[currentPageIndex] === 270 ? '#0072ff' : '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      270°
                    </button>
                  </div>
                </div>

                {/* Navigation Controls */}
                <div className="navigation-controls" style={{
                  display: 'flex',
                  gap: '10px',
                  justifyContent: 'center',
                  marginTop: '20px'
                }}>
                  <button 
                    type="button"
                    onClick={goToPreviousPage}
                    disabled={currentPageIndex === 0}
                    style={{
                      padding: '10px 20px',
                      background: currentPageIndex === 0 ? '#6c757d' : '#0072ff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: currentPageIndex === 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    ← Previous
                  </button>
                  
                  <button 
                    type="button"
                    onClick={markPageAsCompleted}
                    style={{
                      padding: '10px 20px',
                      background: completedPages.includes(currentPageIndex) ? '#28a745' : '#17a2b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    {completedPages.includes(currentPageIndex) ? '✓ Completed' : 'Mark Complete'}
                  </button>
                  
                  <button 
                    type="button"
                    onClick={goToNextPage}
                    disabled={currentPageIndex === pages.length - 1}
                    style={{
                      padding: '10px 20px',
                      background: currentPageIndex === pages.length - 1 ? '#6c757d' : '#0072ff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: currentPageIndex === pages.length - 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Next →
                  </button>
                </div>
              </div>
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
                disabled={loading || !isAllPagesCompleted}
                type="button"
                style={{
                  padding: '15px 30px',
                  fontSize: '18px',
                  background: isAllPagesCompleted ? 
                    'linear-gradient(135deg, #00c6ff, #0072ff)' : 
                    '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isAllPagesCompleted ? 'pointer' : 'not-allowed',
                  opacity: isAllPagesCompleted ? 1 : 0.6
                }}
              >
                {loading ? "Creating Rotated PDF..." : 
                 isAllPagesCompleted ? "Download Rotated PDF" : 
                 "Complete All Pages First"}
              </button>

              {!isAllPagesCompleted && (
                <div style={{ color: '#ffcc00', marginTop: '10px' }}>
                  ⚠ Complete all pages before downloading
                </div>
              )}
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
            Select a PDF file to start rotating pages one by one
          </div>
        )}
      </div>
    </div>
  );
};

export default RotatePDF;
