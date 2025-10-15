import React, { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import "./ReorderPages.css";

// Configure PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const ReorderPages = () => {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]); // { id, pageNumber, src }
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef();

  // Load PDF and create thumbnails
  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile || selectedFile.type !== "application/pdf") {
      setError("Please select a valid PDF file");
      return;
    }
    setFile(selectedFile);
    setFileName(selectedFile.name.replace(".pdf", "-reordered"));
    setError("");
    setSuccess(false);
    setSelectedIndex(null);
    setPages([]);

    try {
      const fileReader = new FileReader();
      fileReader.onload = async function () {
        const typedarray = new Uint8Array(this.result);
        const loadingTask = pdfjsLib.getDocument({ data: typedarray });
        const pdf = await loadingTask.promise;
        const tempPages = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.3 }); // smaller preview
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: context, viewport }).promise;
          const img = canvas.toDataURL();
          tempPages.push({ id: i, pageNumber: i, src: img });
        }

        setPages(tempPages);
      };
      fileReader.readAsArrayBuffer(selectedFile);
    } catch (err) {
      console.error("PDF Load Error:", err);
      setError("Error reading PDF. Please try again.");
    }
  };

  // Handle page swapping selection
  const handlePageClick = (index) => {
    if (selectedIndex === null) {
      // Select first page
      setSelectedIndex(index);
    } else if (selectedIndex === index) {
      // Deselect if same page clicked again
      setSelectedIndex(null);
    } else {
      // Swap pages
      const newPages = [...pages];
      [newPages[selectedIndex], newPages[index]] = [
        newPages[index],
        newPages[selectedIndex],
      ];
      setPages(newPages);
      setSelectedIndex(null);
    }
  };

  // Rebuild and download PDF after reorder
  const handleDownload = async () => {
    if (!file) {
      setError("Please select a PDF first");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const existingPdfBytes = new Uint8Array(event.target.result);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const newPdfDoc = await PDFDocument.create();

        for (let page of pages) {
          const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [
            page.pageNumber - 1,
          ]);
          newPdfDoc.addPage(copiedPage);
        }

        const newPdfBytes = await newPdfDoc.save();
        const blob = new Blob([newPdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${fileName}.pdf`;
        link.click();
        URL.revokeObjectURL(url);

        setSuccess(true);
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error("Error rebuilding PDF:", err);
      setError("Error while creating reordered PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="remove-pages">
      <div className="remove-pages-container">
        <h2>Reorder PDF Pages (Click to Swap)</h2>

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
          <div className="page-grid">
            {pages.map((page, index) => (
              <div
                key={page.id}
                className={`page-preview ${
                  selectedIndex === index ? "selected" : ""
                }`}
                onClick={() => handlePageClick(index)}
              >
                <img src={page.src} alt={`Page ${page.pageNumber}`} />
                <div className="page-number">Page {page.pageNumber}</div>
              </div>
            ))}
          </div>
        )}

        {pages.length > 0 && (
          <div className="form-group">
            <label htmlFor="fileName">Output Filename:</label>
            <input
              type="text"
              id="fileName"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
          </div>
        )}

        {pages.length > 0 && (
          <button onClick={handleDownload} disabled={loading}>
            {loading ? "Creating PDF..." : "Download Reordered PDF"}
          </button>
        )}

        {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="success-message">
            ✅ PDF reordered and downloaded successfully!
          </div>
        )}
      </div>
    </div>
  );
};

export default ReorderPages;
