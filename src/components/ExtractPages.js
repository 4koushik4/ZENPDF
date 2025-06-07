import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import "./ExtractPages.css";

const ExtractPages = () => {
  const [file, setFile] = useState(null);
  const [pageRange, setPageRange] = useState("");
  const [extractedPdfUrl, setExtractedPdfUrl] = useState(null);
  const [pdfName, setPdfName] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleExtract = async () => {
    if (!file || !pageRange) {
      alert("Please select a PDF file and enter page numbers.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const existingPdfBytes = new Uint8Array(event.target.result);
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const newPdfDoc = await PDFDocument.create();

      const pagesToExtract = parsePageRange(pageRange, pdfDoc.getPageCount());

      for (let pageIndex of pagesToExtract) {
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageIndex - 1]);
        newPdfDoc.addPage(copiedPage);
      }

      const newPdfBytes = await newPdfDoc.save();
      const newPdfBlob = new Blob([newPdfBytes], { type: "application/pdf" });
      const newPdfUrl = URL.createObjectURL(newPdfBlob);
      setExtractedPdfUrl(newPdfUrl);
    };

    reader.readAsArrayBuffer(file);
  };

  const parsePageRange = (input, totalPages) => {
    let pages = new Set();
    let parts = input.split(",");

    for (let part of parts) {
      if (part.includes("-")) {
        let [start, end] = part.split("-").map(Number);
        for (let i = start; i <= end && i <= totalPages; i++) {
          pages.add(i);
        }
      } else {
        let pageNum = parseInt(part);
        if (pageNum > 0 && pageNum <= totalPages) {
          pages.add(pageNum);
        }
      }
    }

    return [...pages].sort((a, b) => a - b);
  };

  return (
    <div className="extract">
    <div className="extract-container">
      <h2>Extract Pages from PDF</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <input
        type="text"
        placeholder="Enter page numbers (e.g., 1,3,5-7)"
        value={pageRange}
        onChange={(e) => setPageRange(e.target.value)}
      />
       <input
        type="text"
        placeholder="Enter PDF name (e.g., myfile.pdf)"
        value={pdfName}
        onChange={(e) => setPdfName(e.target.value)}
      />
      <button onClick={handleExtract}>Extract Pages</button>
      {extractedPdfUrl && (
        <a href={extractedPdfUrl} download={pdfName}>
          Download Extracted PDF
        </a>
      )}
    </div>
    </div>
  );
};

export default ExtractPages;
