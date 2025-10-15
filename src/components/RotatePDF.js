import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";

export default function RotatePDF() {
  const [pdfFile, setPdfFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [pageRotations, setPageRotations] = useState([]);
  const [outputName, setOutputName] = useState("rotated");
  const [loading, setLoading] = useState(false);

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pageCount = pdfDoc.getPageCount();

    setPdfFile(pdfDoc);
    setPages(Array.from({ length: pageCount }, (_, i) => i));
    setPageRotations(Array(pageCount).fill(0));
  };

  // Select a page
  const handleSelectPage = (index) => {
    setSelectedPage(index === selectedPage ? null : index);
  };

  // Rotate single page by degree
  const rotatePage = (index, degree) => {
    const updated = [...pageRotations];
    updated[index] = (updated[index] + degree + 360) % 360;
    setPageRotations(updated);
  };

  // Rotate selected page
  const rotateSelectedPage = (degree) => {
    if (selectedPage === null) return;
    rotatePage(selectedPage, degree);
  };

  // Set specific rotation
  const setPageRotation = (index, degree) => {
    const updated = [...pageRotations];
    updated[index] = degree;
    setPageRotations(updated);
  };

  // Deselect page
  const deselectPage = () => setSelectedPage(null);

  // Download rotated PDF
  const handleDownload = async () => {
    if (!pdfFile) return;
    setLoading(true);

    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(pdfFile, pages);

    copiedPages.forEach((page, i) => {
      const rotation = pageRotations[i] || 0;
      page.setRotation(rotation * (Math.PI / 180));
      newPdf.addPage(page);
    });

    const pdfBytes = await newPdf.save();
    saveAs(new Blob([pdfBytes]), `${outputName || "rotated"}.pdf`);
    setLoading(false);
  };

  const buttonStyle = {
    background: "rgba(255,255,255,0.25)",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "#fff",
    borderRadius: "6px",
    padding: "6px 12px",
    cursor: "pointer",
    fontSize: "0.9rem",
    transition: "all 0.2s ease",
  };

  const smallButtonStyle = {
    ...buttonStyle,
    fontSize: "0.8rem",
    margin: "5px",
    background: "rgba(255,255,255,0.2)",
  };

  const miniButtonStyle = {
    background: "rgba(255,255,255,0.2)",
    border: "none",
    borderRadius: "4px",
    color: "#fff",
    fontSize: "0.8rem",
    padding: "4px 6px",
    cursor: "pointer",
    transition: "background 0.2s ease",
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{
        background: "linear-gradient(135deg, #ff9a9e, #fad0c4)",
        color: "white",
      }}
    >
      <h1 className="text-3xl font-bold mb-6">Rotate PDF</h1>

      {/* File Upload */}
      <div className="mb-6">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileUpload}
          className="text-black"
        />
      </div>

      {/* If no PDF yet */}
      {!pdfFile && (
        <p className="text-white/80">
          Upload a PDF to begin rotating individual pages.
        </p>
      )}

      {/* PDF Preview */}
      {pdfFile && (
        <div className="rotate-pages ">
          <div className="rotate-pages-conatiner">
        <div className="flex flex-col items-center w-full max-w-5xl">
          <div className="flex flex-wrap justify-center gap-4 bg-white/10 p-4 rounded-2xl shadow-md">
            {pages.map((_, i) => (
              <div
                key={i}
                onClick={() => handleSelectPage(i)}
                style={{
                  width: "120px",
                  padding: "10px",
                  borderRadius: "12px",
                  border:
                    selectedPage === i
                      ? "3px solid #ffcc70"
                      : "2px solid transparent",
                  background: "rgba(255,255,255,0.1)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    height: "160px",
                    background: "white",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#333",
                    fontWeight: "bold",
                  }}
                >
                  Page {i + 1}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "8px",
                    marginTop: "6px",
                  }}
                >
                  <button
                    style={miniButtonStyle}
                    onClick={(e) => {
                      e.stopPropagation();
                      rotatePage(i, -90);
                    }}
                  >
                    ↺
                  </button>
                  <span>{pageRotations[i]}°</span>
                  <button
                    style={miniButtonStyle}
                    onClick={(e) => {
                      e.stopPropagation();
                      rotatePage(i, 90);
                    }}
                  >
                    ↻
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Page Controls */}
          {selectedPage !== null && (
            <div
              style={{
                background: "rgba(255,255,255,0.15)",
                borderRadius: 12,
                padding: "20px 25px",
                textAlign: "center",
                marginTop: 20,
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}
            >
              <h3
                style={{
                  fontSize: "1.1rem",
                  marginBottom: 6,
                  color: "#ffd36b",
                }}
              >
                Selected Page Controls
              </h3>
              <p style={{ fontSize: "0.9rem", marginBottom: 15 }}>
                Page {selectedPage + 1} ({pageRotations[selectedPage]}°)
              </p>

              <p style={{ marginBottom: 6 }}>
                Current rotation: <b>{pageRotations[selectedPage]}°</b>
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => rotateSelectedPage(-90)}
                  style={buttonStyle}
                >
                  ↺ -90°
                </button>
                <button
                  onClick={() => setPageRotation(selectedPage, 0)}
                  style={buttonStyle}
                >
                  0°
                </button>
                <button
                  onClick={() => rotateSelectedPage(90)}
                  style={buttonStyle}
                >
                  +90° ↻
                </button>
                <button
                  onClick={() => setPageRotation(selectedPage, 180)}
                  style={buttonStyle}
                >
                  180°
                </button>
                <button
                  onClick={() => setPageRotation(selectedPage, 270)}
                  style={buttonStyle}
                >
                  270°
                </button>
              </div>

              <div style={{ marginTop: 15 }}>
                <button onClick={deselectPage} style={smallButtonStyle}>
                  Deselect
                </button>
                <button
                  onClick={() => setPageRotation(selectedPage, 0)}
                  style={smallButtonStyle}
                >
                  Reset 0°
                </button>
              </div>
            </div>
          )}

          {/* Output and Download */}
          <div className="mt-8 text-center">
            <input
              type="text"
              placeholder="Output filename"
              value={outputName}
              onChange={(e) => setOutputName(e.target.value)}
              className="p-2 rounded-md text-black mr-3"
            />
            <button
              onClick={handleDownload}
              disabled={loading}
              style={{
                ...buttonStyle,
                background: "#ffcc70",
                color: "#333",
                fontWeight: "bold",
              }}
            >
              {loading ? "Generating..." : `Download PDF (${pages.length} Pages)`}
            </button>
          </div>
        </div>
        </div>
        </div>
      )}
    </div>
  );
}
