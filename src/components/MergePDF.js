// src/components/MergePDF.js
import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import './MergePDF.css';

const MergePDF = () => {
  const [files, setFiles] = useState([]);
  const [mergedPdf, setMergedPdf] = useState(null);
  const [downloadName, setDownloadName] = useState(null);

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    setFiles([...files, ...newFiles]);
  };

  const removeFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
  };

  const moveFile = (index, direction) => {
    const updatedFiles = [...files];
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < updatedFiles.length) {
      [updatedFiles[index], updatedFiles[newIndex]] = [updatedFiles[newIndex], updatedFiles[index]];
      setFiles(updatedFiles);
    }
  };

  const mergePDFs = async () => {
    if (files.length < 2) {
      alert("Please add at least two PDF files to merge.");
      return;
    }
    
    const mergedPdfDoc = await PDFDocument.create();
    
    for (let file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach(page => mergedPdfDoc.addPage(page));
    }
    
    const mergedPdfBytes = await mergedPdfDoc.save();
    setMergedPdf(mergedPdfBytes);
  };

  const handleDownload = () => {
    if (!mergedPdf) {
      alert("No merged PDF available. Please merge files first.");
      return;
    }
    
    const blob = new Blob([mergedPdf], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="merge-container">
    <div className="merge">
      <h2>Merge PDFs</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} multiple />
      <ul className="file-list">
        {files.map((file, index) => (
          <li key={index} className="file-item">
            {file.name}
            <div>
              <button className="sort-btn" onClick={() => moveFile(index, -1)}>↑</button>
              <button className="sort-btn" onClick={() => moveFile(index, 1)}>↓</button>
              <button className="remove-btn" onClick={() => removeFile(index)}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
      <button className="merge-btn" onClick={mergePDFs}>Merge PDFs</button>
      {mergedPdf && (
        <div className="download-container">
          <input 
            type="text" 
            className="download-input" 
            value={downloadName} 
            onChange={(e) => setDownloadName(e.target.value)} 
            placeholder="Enter filename" 
          />
          <button className="download-btn" onClick={handleDownload}>Download Merged PDF</button>
        </div>
      )}
    </div>
    </div>
  );
};

export default MergePDF;
