import React, { useState, useRef } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import "./RotatePDF.css";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const RotatePDF = () => {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]); // { pageNumber, src, rotation }
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef();

  // Load PDF and generate thumbnails
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile || selectedFile.type !== "application/pdf") {
      setError("Please select a valid PDF file");
      return;
    }

    setFile(selectedFile);
    setError("");
    setSuccess(false);
    setSelectedIndex(null);
    setPages([]);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      const tempPages = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.3 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        await page.render({ canvasContext: ctx, viewport }).promise;
        tempPages.push({ pageNumber: i, src: canvas.toDataURL(), rotation: 0 });
      }

      setPages(tempPages);
    } catch (err) {
      console.error(err);
      setError("Error loading PDF pages");
    }
  };

  const handleSelectPage = (index) => {
    setSelectedIndex(index);
  };

  const handleRotationChange = async (angleValue) => {
    if (selectedIndex === null || !file) return;
    const angle = parseInt(angleValue) % 360;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      const page = await pdf.getPage(selectedIndex + 1);
      const viewport = page.getViewport({ scale: 0.3, rotation: angle });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      await page.render({ canvasContext: ctx, viewport }).promise;

      const updatedPages = [...pages];
      updatedPages[selectedIndex].rotation = angle;
      updatedPages[selectedIndex].src = canvas.toDataURL();

      setPages(updatedPages);
      setSelectedIndex(null); // reset selection
    } catch (err) {
      console.error(err);
      setError("Error updating page preview");
    }
  };

  const handleDownload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      for (let i = 0; i < pages.length; i++) {
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
        copiedPage.setRotation(degrees(pages[i].rotation || 0));
        newPdf.addPage(copiedPage);
      }

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name.replace(".pdf", "-rotated.pdf");
      link.click();
      URL.revokeObjectURL(url);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Error generating rotated PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rotate-pdf-container">
      <h2>Rotate PDF Pages</h2>

      <div className="form-group">
        <label>Select PDF File:</label>
        <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} />
      </div>

      {error && <div className="error-message">{error}</div>}

      {pages.length > 0 && (
        <div className="page-grid">
          {pages.map((page, index) => (
            <div
              key={page.pageNumber}
              className={`page-preview ${selectedIndex === index ? "selected" : ""}`}
              onClick={() => handleSelectPage(index)}
            >
              <img src={page.src} alt={`Page ${page.pageNumber}`} />
              <div className="page-number">
                Page {page.pageNumber} {page.rotation ? `(${page.rotation}°)` : ""}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedIndex !== null && (
        <div className="form-group">
          <label>Set rotation for Page {pages[selectedIndex].pageNumber}:</label>
          <select
            value={pages[selectedIndex].rotation}
            onChange={(e) => handleRotationChange(e.target.value)}
          >
            <option value="0">No Rotation</option>
            <option value="90">90° Clockwise</option>
            <option value="180">180°</option>
            <option value="270">90° Counter-clockwise</option>
            <option value="360">360°</option>
          </select>
        </div>
      )}

      {pages.length > 0 && (
        <button onClick={handleDownload} disabled={loading}>
          {loading ? "Creating PDF..." : "Download Rotated PDF"}
        </button>
      )}

      {success && <div className="success-message">PDF rotated successfully!</div>}
    </div>
  );
};

export default RotatePDF;
