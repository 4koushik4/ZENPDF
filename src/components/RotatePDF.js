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
  const fileInputRef = useRef();

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setError(null);
    setSuccess(false);
    setPages([]);
    setRotations([]);

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

  const handleRotationChange = (index, angle) => {
    setRotations(prev => {
      const newRotations = [...prev];
      // Add the angle and ensure it stays within 0-360 degrees
      newRotations[index] = (newRotations[index] + angle + 360) % 360;
      return newRotations;
    });
  };

  const handleSetRotation = (index, angle) => {
    setRotations(prev => {
      const newRotations = [...prev];
      newRotations[index] = angle;
      return newRotations;
    });
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

  const rotateAll = (angle) => {
    setRotations(prev => prev.map(() => angle));
  };

  const resetAll = () => {
    setRotations(prev => prev.map(() => 0));
  };

  return (
    <div className="rotate-pages">
      <div className="rotate-pages-container">
        <h2>Rotate PDF Pages</h2>

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

            {/* Page Grid with Rotation Controls */}
            <div className="page-grid">
              {pages.map((page, index) => (
                <div key={page.id} className="page-preview">
                  <img
                    src={page.src}
                    alt={`Page ${page.pageNumber}`}
                    className="thumbnail-img"
                    style={{
                      transform: `rotate(${rotations[index]}deg)`,
                      transition: 'transform 0.3s ease'
                    }}
                  />
                  <div className="page-number">Page {page.pageNumber}</div>
                  
                  {/* Rotation Controls */}
                  <div className="rotation-controls">
                    <button 
                      type="button"
                      className="rotate-btn left"
                      onClick={() => handleRotationChange(index, -90)}
                      title="Rotate -90°"
                    >
                      ⟲ -90°
                    </button>
                    
                    <div className="rotation-display">
                      <select
                        value={rotations[index]}
                        onChange={(e) => handleSetRotation(index, parseInt(e.target.value))}
                        className="rotation-select"
                      >
                        <option value={0}>0°</option>
                        <option value={90}>90°</option>
                        <option value={180}>180°</option>
                        <option value={270}>270°</option>
                      </select>
                    </div>
                    
                    <button 
                      type="button"
                      className="rotate-btn right"
                      onClick={() => handleRotationChange(index, 90)}
                      title="Rotate +90°"
                    >
                      +90° ⟳
                    </button>
                  </div>

                  {/* Quick Rotation Buttons */}
                  <div className="quick-actions" style={{ 
                    marginTop: '8px', 
                    display: 'flex', 
                    gap: '5px',
                    justifyContent: 'center'
                  }}>
                    <button 
                      type="button"
                      className="quick-btn"
                      onClick={() => handleSetRotation(index, 0)}
                    >
                      0°
                    </button>
                    <button 
                      type="button"
                      className="quick-btn"
                      onClick={() => handleSetRotation(index, 90)}
                    >
                      90°
                    </button>
                    <button 
                      type="button"
                      className="quick-btn"
                      onClick={() => handleSetRotation(index, 180)}
                    >
                      180°
                    </button>
                    <button 
                      type="button"
                      className="quick-btn"
                      onClick={() => handleSetRotation(index, 270)}
                    >
                      270°
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="form-group">
              <label htmlFor="fileName">Output Filename:</label>
              <input
                type="text"
                id="fileName"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Enter filename"
              />
            </div>

            <button 
              className="download-btn" 
              onClick={handleDownload} 
              disabled={loading}
              type="button"
            >
              {loading ? "Creating Rotated PDF..." : "Download Rotated PDF"}
            </button>
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
            Select a PDF file to see page previews and set rotations
          </div>
        )}
      </div>
    </div>
  );
};

export default RotatePDF;
