import React, { useState, useRef } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import "./RotatePDF.css";

// Configure PDF.js worker (CDN path that matches pdfjs-dist version)
// If you bundle pdfjs differently in your project you may change this.
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const RotatePDF = () => {
  const [pages, setPages] = useState([]); // { id, src, pageNumber }
  const [rotations, setRotations] = useState([]); // degrees per page (0|90|180|270)
  const [fileName, setFileName] = useState("rotated");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const fileInputRef = useRef();
  const [originalPdfBytes, setOriginalPdfBytes] = useState(null);

  // Utility: ensure rotations array length equals pages length
  const ensureRotationsLength = (len, current = []) => {
    if (!current || current.length !== len) {
      return new Array(len).fill(0);
    }
    return current.slice(0, len);
  };

  // Load file and create small previews via pdf.js
  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(false);
    setPages([]);
    setRotations([]);
    setSelectedPage(null);
    setOriginalPdfBytes(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const u8 = new Uint8Array(arrayBuffer);
      setOriginalPdfBytes(u8);

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pagePreviews = [];
      for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        // small scale for thumbnails
        const viewport = page.getViewport({ scale: 0.2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        await page.render({ canvasContext: ctx, viewport }).promise;
        const src = canvas.toDataURL("image/png");
        pagePreviews.push({
          id: i,
          src,
          pageNumber: i + 1,
        });
      }

      setPages(pagePreviews);
      setRotations(ensureRotationsLength(pagePreviews.length, []));
      setSelectedPage(null);
    } catch (err) {
      console.error("Error loading PDF:", err);
      setError("Error loading PDF file. Try another file or a different PDF.");
    }
  };

  // When a page is clicked
  const handlePageSelect = (pageIndex) => {
    setSelectedPage(pageIndex);
  };

  // Change rotation for a page (angle must be 0|90|180|270)
  const handleRotationChange = (pageIndex, angle) => {
    setRotations((prev) => {
      const newRot = ensureRotationsLength(Math.max(prev.length, pageIndex + 1), prev);
      newRot[pageIndex] = angle % 360;
      return newRot;
    });
    // keep success/error states cleared so user sees latest status
    setSuccess(false);
    setError(null);
  };

  // Quick helper to rotate by delta (e.g., +90 or -90)
  const rotateDelta = (pageIndex, delta) => {
    setRotations((prev) => {
      const newRot = ensureRotationsLength(Math.max(prev.length, pageIndex + 1), prev);
      const next = (newRot[pageIndex] + delta + 360) % 360;
      newRot[pageIndex] = next;
      return newRot;
    });
    setSuccess(false);
    setError(null);
  };

  // Download rotated PDF - uses pdf-lib degrees()
  const handleDownload = async () => {
    if (!pages.length || !originalPdfBytes) {
      setError("Please select a PDF file first.");
      return;
    }

    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const pdfDoc = await PDFDocument.load(originalPdfBytes);
      const newPdf = await PDFDocument.create();

      // ensure rotations array length
      const pageCount = pdfDoc.getPageCount();
      const effectiveRotations = ensureRotationsLength(pageCount, rotations);

      for (let i = 0; i < pageCount; i++) {
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);

        // apply rotation using pdf-lib helper degrees()
        if (typeof effectiveRotations[i] === "number" && effectiveRotations[i] % 360 !== 0) {
          copiedPage.setRotation(degrees(effectiveRotations[i]));
        } else {
          // ensure 0 rotation explicitly (not required but explicit)
          copiedPage.setRotation(degrees(0));
        }

        newPdf.addPage(copiedPage);
      }

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileName?.trim() || "rotated"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess(true);
    } catch (err) {
      console.error("Error creating rotated PDF:", err);
      setError(`Error creating rotated PDF: ${err?.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const rotatedPagesCount = rotations.filter((r) => r % 360 !== 0).length;

  return (
    <div className="rotate-pages" style={{ padding: 20 }}>
      <div className="rotate-pages-container" style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ color: "#fff" }}>Rotate PDF Pages</h2>
        <p style={{ color: "#fff", opacity: 0.85 }}>
          Click a page to select it. Use the panel or the page controls to rotate individual pages.
        </p>

        {/* File Input */}
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label htmlFor="pdfFile" style={{ color: "#fff", marginRight: 8 }}>Select PDF File:</label>
          <input
            ref={fileInputRef}
            id="pdfFile"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            style={{ display: "inline-block" }}
          />
        </div>

        {/* top stats */}
        {pages.length > 0 && (
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
            background: "rgba(255,255,255,0.04)",
            padding: 10,
            borderRadius: 8
          }}>
            <div style={{ color: "#fff" }}>
              <strong>Total Pages:</strong> {pages.length} &nbsp; | &nbsp;
              <strong>Rotated:</strong> <span style={{ color: "#4facfe" }}>{rotatedPagesCount}</span>
            </div>

            <div style={{ color: "#fff" }}>
              {selectedPage !== null ? (
                <span style={{ color: "#ffcc00" }}>Selected: Page {selectedPage + 1} ({rotations[selectedPage] ?? 0}°)</span>
              ) : (
                <span style={{ opacity: 0.8 }}>Click a page to select it</span>
              )}
            </div>
          </div>
        )}

        {/* Main content: left = pages grid, right = selected controls */}
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          {/* Pages Grid */}
          <div style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))",
            gap: 12
          }}>
            {pages.length === 0 ? (
              <div style={{ color: "#fff", padding: 20, textAlign: "center", borderRadius: 8 }}>
                No PDF loaded
              </div>
            ) : pages.map((page, idx) => {
              const rot = rotations[idx] ?? 0;
              const isSelected = selectedPage === idx;
              return (
                <div
                  key={page.id}
                  onClick={() => handlePageSelect(idx)}
                  style={{
                    cursor: "pointer",
                    padding: 10,
                    borderRadius: 8,
                    background: "#fff",
                    boxShadow: isSelected ? "0 6px 18px rgba(0,0,0,0.25)" : "0 2px 6px rgba(0,0,0,0.08)",
                    border: isSelected ? "3px solid #ffcc00" : (rot % 360 !== 0 ? "2px solid #4facfe" : "1px solid #ddd"),
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                  }}
                >
                  <img
                    src={page.src}
                    alt={`Page ${page.pageNumber}`}
                    style={{
                      width: 120,
                      height: 160,
                      objectFit: "contain",
                      transform: `rotate(${rot}deg)`,
                      transition: "transform 0.25s ease",
                      marginBottom: 8,
                      background: "#fff"
                    }}
                  />
                  <div style={{ textAlign: "center", width: "100%" }}>
                    <div style={{ fontWeight: 700 }}>Page {page.pageNumber}</div>
                    <div style={{ fontSize: 12, color: rot % 360 !== 0 ? "#4facfe" : "#777" }}>
                      {rot % 360 !== 0 ? `${rot}°` : "0°"}
                    </div>

                    {/* inline quick controls */}
                    <div style={{ display: "flex", gap: 6, marginTop: 8, justifyContent: "center" }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); rotateDelta(idx, -90); }}
                        type="button"
                        title="Rotate -90°"
                        style={{
                          padding: "6px 8px",
                          borderRadius: 6,
                          border: "none",
                          cursor: "pointer",
                          fontSize: 12,
                          background: "#e6f3ff"
                        }}
                      >
                        ⟲
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRotationChange(idx, 0); }}
                        type="button"
                        title="Set 0°"
                        style={{
                          padding: "6px 8px",
                          borderRadius: 6,
                          border: "none",
                          cursor: "pointer",
                          fontSize: 12,
                          background: rot === 0 ? "#cfe8ff" : "#f2f2f2"
                        }}
                      >0°</button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRotationChange(idx, 90); }}
                        type="button"
                        title="Set 90°"
                        style={{
                          padding: "6px 8px",
                          borderRadius: 6,
                          border: "none",
                          cursor: "pointer",
                          fontSize: 12,
                          background: rot === 90 ? "#cfe8ff" : "#f2f2f2"
                        }}
                      >90°</button>
                      <button
                        onClick={(e) => { e.stopPropagation(); rotateDelta(idx, 90); }}
                        type="button"
                        title="Rotate +90°"
                        style={{
                          padding: "6px 8px",
                          borderRadius: 6,
                          border: "none",
                          cursor: "pointer",
                          fontSize: 12,
                          background: "#e6f3ff"
                        }}
                      >
                        ⟳
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Controls panel (visible when a page is selected) */}
          <div style={{ width: 320, minWidth: 240 }}>
            <div style={{
              background: "rgba(255,255,255,0.03)",
              padding: 12,
              borderRadius: 8,
              color: "#fff"
            }}>
              <h3 style={{ marginTop: 0 }}>Selected Page Controls</h3>
              {selectedPage === null ? (
                <div style={{ opacity: 0.9 }}>Select a page to show controls here.</div>
              ) : (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 14, marginBottom: 8 }}>
                      Page <strong>{selectedPage + 1}</strong>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      Current rotation: <strong>{rotations[selectedPage] ?? 0}°</strong>
                    </div>

                    {/* Big rotate buttons */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <button
                        onClick={() => rotateDelta(selectedPage, -90)}
                        type="button"
                        style={{
                          flex: 1,
                          padding: "10px 12px",
                          borderRadius: 8,
                          border: "none",
                          cursor: "pointer",
                          background: "#4facfe",
                          color: "#fff",
                          fontWeight: 700
                        }}
                      >
                        ⟲ -90°
                      </button>
                      <button
                        onClick={() => rotateDelta(selectedPage, 90)}
                        type="button"
                        style={{
                          flex: 1,
                          padding: "10px 12px",
                          borderRadius: 8,
                          border: "none",
                          cursor: "pointer",
                          background: "#4facfe",
                          color: "#fff",
                          fontWeight: 700
                        }}
                      >
                        +90° ⟳
                      </button>
                    </div>

                    {/* Set exact rotations */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      {[0, 90, 180, 270].map((angle) => (
                        <button
                          key={angle}
                          onClick={() => handleRotationChange(selectedPage, angle)}
                          type="button"
                          style={{
                            flex: 1,
                            padding: "8px 10px",
                            borderRadius: 8,
                            border: rotations[selectedPage] === angle ? "2px solid #fff" : "none",
                            cursor: "pointer",
                            background: rotations[selectedPage] === angle ? "#0b63d6" : "#f2f2f2",
                            color: rotations[selectedPage] === angle ? "#fff" : "#333",
                            fontWeight: 700
                          }}
                        >
                          {angle}°
                        </button>
                      ))}
                    </div>

                    <div style={{ fontSize: 12, opacity: 0.9 }}>
                      Use these controls to adjust the selected page. All pages (rotated or not) will be included when you download.
                    </div>
                  </div>

                  {/* Button to clear selection */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => setSelectedPage(null)}
                      type="button"
                      style={{
                        flex: 1,
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: "none",
                        cursor: "pointer",
                        background: "#666",
                        color: "#fff"
                      }}
                    >
                      Deselect
                    </button>
                    <button
                      onClick={() => handleRotationChange(selectedPage, 0)}
                      type="button"
                      style={{
                        flex: 1,
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: "none",
                        cursor: "pointer",
                        background: "#ffcc00",
                        color: "#000",
                        fontWeight: 700
                      }}
                    >
                      Reset 0°
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Download / Filename */}
            <div style={{ marginTop: 12, background: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 8 }}>
              <label htmlFor="fileName" style={{ display: "block", color: "#fff", marginBottom: 6 }}>Output filename</label>
              <input
                id="fileName"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="rotated"
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
              />

              <button
                onClick={handleDownload}
                disabled={loading}
                type="button"
                style={{
                  width: "100%",
                  marginTop: 12,
                  padding: "12px 16px",
                  borderRadius: 8,
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  background: "linear-gradient(135deg,#00c6ff,#0072ff)",
                  color: "#fff",
                  fontWeight: 700
                }}
              >
                {loading ? "Creating PDF..." : `Download PDF (${pages.length} pages)`}
              </button>

              <div style={{ marginTop: 8, color: "#fff", fontSize: 13 }}>
                {rotatedPagesCount > 0 ? (
                  <span style={{ color: "#4facfe" }}>✓ {rotatedPagesCount} rotated</span>
                ) : (
                  <span style={{ color: "#ffcc00" }}>⚠ No pages rotated</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* error / success */}
        {error && (
          <div style={{
            marginTop: 14,
            padding: 10,
            borderRadius: 8,
            background: "#ffdddd",
            color: "#900"
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            marginTop: 14,
            padding: 10,
            borderRadius: 8,
            background: "#e6ffed",
            color: "#0a7f2a"
          }}>
            ✅ PDF downloaded successfully! All {pages.length} pages included.
          </div>
        )}
      </div>
    </div>
  );
};

export default RotatePDF;
