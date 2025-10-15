import React, { useState, useRef } from "react";
import { PDFDocument, degrees } from "pdf-lib"; // ✅ import degrees
import * as pdfjsLib from "pdfjs-dist";
import "./RotatePDF.css";

// ✅ Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const RotatePDF = () => {
  const [pages, setPages] = useState([]);
  const [rotations, setRotations] = useState([]);
  const [fileName, setFileName] = useState("rotated");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const fileInputRef = useRef();
  const [originalPdfBytes, setOriginalPdfBytes] = useState(null);

  // ✅ Handle PDF upload and preview generation
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError(null);
    setSuccess(false);
    setPages([]);
    setRotations([]);
    setSelectedPage(null);
    setOriginalPdfBytes(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      setOriginalPdfBytes(new Uint8Array(arrayBuffer));

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const pagePreviews = [];
      const pageRotations = [];

      for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const viewport = page.getViewport({ scale: 0.2 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const src = canvas.toDataURL("image/png");
        pagePreviews.push({
          id: i,
          src,
          pageNumber: i + 1,
        });
        pageRotations.push(0); // start all pages with 0°
      }

      setPages(pagePreviews);
      setRotations(pageRotations);
    } catch (err) {
      console.error("Error loading PDF:", err);
      setError("Error loading PDF file. Please try another file.");
    }
  };

  // ✅ Select a specific page
  const handlePageSelect = (pageIndex) => {
    setSelectedPage(pageIndex);
  };

  // ✅ Change rotation for individual page
  const handleRotationChange = (pageIndex, angle) => {
    setRotations((prev) => {
      const newRotations = [...prev];
      newRotations[pageIndex] = angle;
      return newRotations;
    });
  };

  // ✅ Handle final PDF download with rotations
  const handleDownload = async () => {
    if (!pages.length || !originalPdfBytes) {
      setError("Please select a PDF file first.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const pdfDoc = await PDFDocument.load(originalPdfBytes);
      const newPdf = await PDFDocument.create();

      for (let i = 0; i < pdfDoc.getPageCount(); i++) {
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);

        // ✅ Apply rotation using pdf-lib's degrees()
        if (rotations[i] !== 0) {
          copiedPage.setRotation(degrees(rotations[i]));
        }

        newPdf.addPage(copiedPage);
      }

      // ✅ Save and download file
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileName || "rotated"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess(true);
    } catch (err) {
      console.error("Error creating PDF:", err);
      setError(`Error creating rotated PDF: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const rotatedPagesCount = rotations.filter((rot) => rot !== 0).length;

  return (
    <div className="rotate-pages">
      <div className="rotate-pages-container">
        <h2>Rotate PDF Pages</h2>
        <p style={{ color: "#fff", opacity: 0.8, marginBottom: "20px" }}>
          Click a page to select it, then choose rotation. Download when ready.
        </p>

        {/* File Input */}
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
            {/* Stats */}
            <div
              style={{
                textAlign: "center",
                color: "#fff",
                marginBottom: "15px",
                background: "rgba(255,255,255,0.1)",
                padding: "10px",
                borderRadius: "8px",
              }}
            >
              <strong>Total Pages: {pages.length}</strong> |{" "}
              <strong style={{ color: "#4facfe" }}>
                Rotated: {rotatedPagesCount}
              </strong>
              {selectedPage !== null && (
                <span style={{ color: "#ffcc00", marginLeft: "15px" }}>
                  • Selected: Page {selectedPage + 1} (
                  {rotations[selectedPage]}°)
                </span>
              )}
            </div>

            {/* Page Grid */}
            <div className="page-grid">
              {pages.map((page, index) => (
                <div
                  key={page.id}
                  className="page-preview"
                  onClick={() => handlePageSelect(index)}
                  style={{ cursor: "pointer" }}
                >
                  <div
                    style={{
                      position: "relative",
                      background: "white",
                      padding: "10px",
                      borderRadius: "8px",
                      border:
                        selectedPage === index
                          ? "3px solid #ffcc00"
                          : rotations[index] !== 0
                          ? "3px solid #4facfe"
                          : "1px solid #ddd",
                      transform:
                        selectedPage === index ? "scale(1.05)" : "scale(1)",
                      transition: "all 0.3s ease",
                      boxShadow:
                        selectedPage === index
                          ? "0 5px 15px rgba(255, 204, 0, 0.5)"
                          : "0 2px 5px rgba(0,0,0,0.1)",
                    }}
                  >
                    <img
                      src={page.src}
                      alt={`Page ${page.pageNumber}`}
                      style={{
                        width: "120px",
                        height: "160px",
                        objectFit: "contain",
                        transform: `rotate(${rotations[index]}deg)`,
                        transition: "transform 0.3s ease",
                        marginBottom: "8px",
                      }}
                    />

                    <div
                      style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        marginBottom: "8px",
                        color: "#333",
                      }}
                    >
                      Page {page.pageNumber}
                      {rotations[index] !== 0 && (
                        <span
                          style={{
                            color: "#4facfe",
                            fontSize: "12px",
                            display: "block",
                          }}
                        >
                          {rotations[index]}°
                        </span>
                      )}
                    </div>

                    {/* Rotation Controls */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "5px",
                        marginBottom: "8px",
                      }}
                    >
                      {[0, 90, 180, 270].map((angle) => (
                        <button
                          key={angle}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRotationChange(index, angle);
                          }}
                          style={{
                            padding: "4px 8px",
                            background:
                              rotations[index] === angle
                                ? "#0072ff"
                                : "#6c757d",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "11px",
                          }}
                        >
                          {angle}°
                        </button>
                      ))}
                    </div>

                    {/* Quick Rotate Buttons */}
                    <div
                      style={{
                        display: "flex",
                        gap: "4px",
                        justifyContent: "center",
                      }}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRotationChange(
                            index,
                            (rotations[index] - 90 + 360) % 360
                          );
                        }}
                        style={{
                          padding: "3px 6px",
                          background: "#4facfe",
                          color: "white",
                          border: "none",
                          borderRadius: "3px",
                          cursor: "pointer",
                          fontSize: "10px",
                        }}
                        title="Rotate -90°"
                      >
                        ⟲ -90
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRotationChange(
                            index,
                            (rotations[index] + 90) % 360
                          );
                        }}
                        style={{
                          padding: "3px 6px",
                          background: "#4facfe",
                          color: "white",
                          border: "none",
                          borderRadius: "3px",
                          cursor: "pointer",
                          fontSize: "10px",
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
            <div
              className="download-section"
              style={{
                textAlign: "center",
                marginTop: "30px",
                padding: "20px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "10px",
              }}
            >
              <div className="form-group">
                <label
                  htmlFor="fileName"
                  style={{ color: "#fff", fontSize: "18px" }}
                >
                  Output Filename:
                </label>
                <input
                  type="text"
                  id="fileName"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Enter filename"
                  style={{
                    width: "80%",
                    maxWidth: "300px",
                    margin: "10px auto",
                  }}
                />
              </div>

              <button
                className="download-btn"
                onClick={handleDownload}
                disabled={loading}
                type="button"
                style={{
                  padding: "15px 30px",
                  fontSize: "18px",
                  background: "linear-gradient(135deg, #00c6ff, #0072ff)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? "Creating PDF..." : "Download PDF"}
              </button>

              <div style={{ color: "#fff", marginTop: "10px", fontSize: "14px" }}>
                {rotatedPagesCount > 0 ? (
                  <span style={{ color: "#4facfe" }}>
                    ✓ {rotatedPagesCount} page
                    {rotatedPagesCount !== 1 ? "s" : ""} rotated • All{" "}
                    {pages.length} pages included
                  </span>
                ) : (
                  <span style={{ color: "#ffcc00" }}>
                    ⚠ No pages rotated • All {pages.length} pages included as
                    original
                  </span>
                )}
              </div>
            </div>
          </>
        )}

        {error && <div className="error-message">{error}</div>}

        {success && (
          <div className="success-message">
            ✅ PDF downloaded successfully! All {pages.length} pages included.
          </div>
        )}

        {pages.length === 0 && !error && (
          <div
            style={{
              textAlign: "center",
              color: "#fff",
              marginTop: "20px",
              opacity: 0.8,
            }}
          >
            Select a PDF file to rotate pages
          </div>
        )}
      </div>
    </div>
  );
};

export default RotatePDF;
