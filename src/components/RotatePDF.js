import React, { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import "./RotatePDF.css";

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

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        const pdfDoc = await PDFDocument.load(arrayBuffer);

        const numPages = pdfDoc.getPageCount();
        const pagePreviews = [];
        const pageRotations = [];

        for (let i = 0; i < numPages; i++) {
          const page = pdfDoc.getPage(i);
          const viewportScale = 0.15;

          // Render page to canvas for preview
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const { width, height } = page.getSize();
          canvas.width = width * viewportScale;
          canvas.height = height * viewportScale;

          // Draw page content on canvas
          // pdf-lib doesn't render to canvas directly; for previews, we'll just show a placeholder
          // In a real app, you would use PDF.js to render thumbnails
          ctx.fillStyle = "#f0f0f0";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "#000";
          ctx.font = `${10 * viewportScale}px Arial`;
          ctx.fillText(`Page ${i + 1}`, 10, 20);

          const src = canvas.toDataURL("image/png");
          pagePreviews.push({ id: i, src, pageNumber: i + 1 });
          pageRotations.push(0); // default rotation 0°
        }

        setPages(pagePreviews);
        setRotations(pageRotations);
      };

      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error(err);
      setError("Error loading PDF file");
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
    if (!pages.length) return;
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
      link.click();
      URL.revokeObjectURL(url);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Error creating rotated PDF");
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
            <div className="page-grid" style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {pages.map((page, index) => (
                <div key={page.id} className="page-preview" style={{ textAlign: "center" }}>
                  <img
                    src={page.src}
                    alt={`Page ${page.pageNumber}`}
                    style={{ width: "150px", height: "auto", display: "block", marginBottom: "5px" }}
                  />
                  <div>Page {page.pageNumber}</div>
                  <div>
                    <button onClick={() => handleRotationChange(index, -90)}>⟲</button>
                    <span style={{ margin: "0 5px" }}>{rotations[index]}°</span>
                    <button onClick={() => handleRotationChange(index, 90)}>⟳</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="form-group" style={{ marginTop: "15px" }}>
              <label htmlFor="fileName">Output Filename:</label>
              <input
                type="text"
                id="fileName"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
              />
            </div>

            <button onClick={handleDownload} disabled={loading}>
              {loading ? "Creating PDF..." : "Download Rotated PDF"}
            </button>
          </>
        )}

        {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}
        {success && <div style={{ color: "green", marginTop: "10px" }}>✅ PDF rotated and downloaded successfully!</div>}
      </div>
    </div>
  );
};

export default RotatePDF;
