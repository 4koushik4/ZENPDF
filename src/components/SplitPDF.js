// src/components/SplitPDF.js
import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import "./SplitPDF.css";

const SplitPDF = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [pageRange, setPageRange] = useState("");
  const [splitPdfUrl, setSplitPdfUrl] = useState(null);
    const [pdfName, setPdfName] = useState(null);
  

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSplit = async () => {
    if (!selectedFile || !pageRange) {
      alert("Please upload a file and enter a page range!");
      return;
    }

    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(selectedFile);
    fileReader.onload = async () => {
      const pdfBytes = fileReader.result;
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const newPdf = await PDFDocument.create();

      const pages = pageRange.split(",").map((range) => {
        if (range.includes("-")) {
          const [start, end] = range.split("-").map(Number);
          return Array.from({ length: end - start + 1 }, (_, i) => start + i - 1);
        }
        return [Number(range) - 1];
      }).flat();

      for (let pageIndex of pages) {
        if (pageIndex < pdfDoc.getPageCount()) {
          const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageIndex]);
          newPdf.addPage(copiedPage);
        }
      }

      const splitPdfBytes = await newPdf.save();
      const blob = new Blob([splitPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setSplitPdfUrl(url);
    };
  };

  return (
    <div className="split">
    <div className="split-container">
      <h2>Split PDF</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <input
        type="text"
        placeholder="Enter page range (e.g., 1-3,5)"
        value={pageRange}
        onChange={(e) => setPageRange(e.target.value)}
      />
       <input
        type="text"
        placeholder="Enter PDF name (e.g., myfile.pdf)"
        value={pdfName}
        onChange={(e) => setPdfName(e.target.value)}
      />
      <button onClick={handleSplit}>Split PDF</button>
      {splitPdfUrl && (
        <a href={splitPdfUrl} download={pdfName}>
          <button className="download-btn">Download Split PDF</button>
        </a>
      )}
    </div>
    </div>
  );
};

export default SplitPDF;
