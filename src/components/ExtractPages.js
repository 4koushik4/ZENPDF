import React, { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import "./ExtractPages.css";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const ExtractPages = () => {
  const [file, setFile] = useState(null);
  const [pageImages, setPageImages] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]);
  const [extractedPdfUrl, setExtractedPdfUrl] = useState(null);
  const [pdfName, setPdfName] = useState("");
  const fileInputRef = useRef();

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    setFile(file);
    setExtractedPdfUrl(null);

    if (!file) return;

    const fileReader = new FileReader();
    fileReader.onload = async function () {
      try {
        const typedarray = new Uint8Array(this.result);

        // Load PDF using PDF.js
        const loadingTask = pdfjsLib.getDocument({ data: typedarray });
        const pdf = await loadingTask.promise;
        const images = [];

        // Generate thumbnails for all pages
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1 }); // use 1 for clearer preview
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: context, viewport }).promise;
          images.push(canvas.toDataURL());
        }

        setPageImages(images);
        setSelectedPages([]);
      } catch (err) {
        console.error("PDF render error:", err);
        alert("Error reading PDF. Please try another file.");
      }
    };
    fileReader.readAsArrayBuffer(file);
  };

  const togglePageSelect = (idx) => {
    setSelectedPages((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleExtract = async () => {
    if (!file || selectedPages.length === 0) {
      alert("Please select a PDF file and at least one page.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const existingPdfBytes = new Uint8Array(event.target.result);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const newPdfDoc = await PDFDocument.create();

        const sortedPages = [...selectedPages].sort((a, b) => a - b);
        for (let pageIndex of sortedPages) {
          const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageIndex]);
          newPdfDoc.addPage(copiedPage);
        }

        const newPdfBytes = await newPdfDoc.save();
        const newPdfBlob = new Blob([newPdfBytes], { type: "application/pdf" });
        const newPdfUrl = URL.createObjectURL(newPdfBlob);
        setExtractedPdfUrl(newPdfUrl);
      } catch (err) {
        console.error("Error extracting pages:", err);
        alert("Something went wrong while extracting pages.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="extract">
      <div className="extract-container">
        <h2>Extract Pages from PDF</h2>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          ref={fileInputRef}
        />

        {pageImages.length > 0 && (
          <div
            className="extract-page-thumbnails"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              justifyContent: "center",
              margin: "20px 0",
            }}
          >
            {pageImages.map((img, idx) => (
              <div
                key={idx}
                className={`extract-thumb ${
                  selectedPages.includes(idx) ? "selected" : ""
                }`}
                style={{
                  border: selectedPages.includes(idx)
                    ? "3px solid #28a745"
                    : "1px solid #ccc",
                  borderRadius: 8,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                  width: 120,
                  height: 160,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  background: "#fff",
                }}
                onClick={() => togglePageSelect(idx)}
                title={
                  selectedPages.includes(idx)
                    ? "Deselect page"
                    : "Select page"
                }
              >
                <img
                  src={img}
                  alt={`Page ${idx + 1}`}
                  style={{
                    width: 110,
                    height: 150,
                    objectFit: "contain",
                    borderRadius: 6,
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    top: 4,
                    left: 4,
                    background: selectedPages.includes(idx)
                      ? "#28a745"
                      : "#ccc",
                    color: "white",
                    borderRadius: "50%",
                    width: 24,
                    height: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: 14,
                    border: "2px solid #fff",
                  }}
                >
                  {idx + 1}
                </span>
              </div>
            ))}
          </div>
        )}

        {pageImages.length > 0 && (
          <input
            type="text"
            placeholder="Enter PDF name (e.g., myfile.pdf)"
            value={pdfName}
            onChange={(e) => setPdfName(e.target.value)}
            style={{ marginBottom: 16 }}
          />
        )}

        {pageImages.length > 0 && (
          <button
            onClick={handleExtract}
            className="extract-btn"
            style={{
              margin: "16px 0",
              padding: "12px 24px",
              fontSize: 18,
              background: "#28a745",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Extract Selected Pages
          </button>
        )}

        {extractedPdfUrl && (
          <a
            href={extractedPdfUrl}
            download={pdfName || "extracted.pdf"}
            className="download-btn"
            style={{ marginTop: 16, display: "inline-block" }}
          >
            Download Extracted PDF
          </a>
        )}
      </div>
    </div>
  );
};

export default ExtractPages;
