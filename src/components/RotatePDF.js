import React, { useState, useRef, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from 'pdfjs-dist';

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

  // Check if PDF.js is loaded
  useEffect(() => {
    console.log("PDF.js version:", pdfjsLib.version);
  }, []);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setError(null);
    setSuccess(false);
    setPages([]);
    setRotations([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Load PDF document
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      const pagePreviews = [];
      const pageRotations = [];

      // Render each page
      for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const viewport = page.getViewport({ scale: 0.3 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Render PDF page to canvas
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;

        const src = canvas.toDataURL("image/png");
        pagePreviews.push({ 
          id: i, 
          src, 
          pageNumber: i + 1 
        });
        pageRotations.push(0); // Default rotation
      }

      setPages(pagePreviews);
      setRotations(pageRotations);
    } catch (err) {
      console.error("Error loading PDF:", err);
      setError("Error loading PDF file. Please try another file.");
    }
  };

  const handleRotationChange = (index, delta) => {
    setRotations((prev) =>
      prev.map((rot, i) =>
        i === index ? (rot + delta + 360) % 360 : rot
      )
    );
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

      for (let i = 0; i < pdfDoc.getPageCount(); i++) {
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
        copiedPage.setRotation((rotations[i] * Math.PI) / 180);
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
            <div className="page-grid">
              {pages.map((page, index) => (
                <div key={page.id} className="page-preview">
                  <img
                    src={page.src}
                    alt={`Page ${page.pageNumber}`}
                    className="thumbnail-img"
                  />
                  <div className="page-number">Page {page.pageNumber}</div>
                  <div className="rotation-controls">
                    <button 
                      type="button"
                      onClick={() => handleRotationChange(index, -90)}
                    >
                      ⟲
                    </button>
                    <span className="rotation-degree">{rotations[index]}°</span>
                    <button 
                      type="button"
                      onClick={() => handleRotationChange(index, 90)}
                    >
                      ⟳
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
              {loading ? "Creating PDF..." : "Download Rotated PDF"}
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
            Select a PDF file to see page previews
          </div>
        )}
      </div>
    </div>
  );
};

export default RotatePDF;
