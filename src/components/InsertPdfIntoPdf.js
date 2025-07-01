import React, { useState, useEffect } from 'react';
import './InsertPdfIntoPdf.css';

const PdfInserter = () => {
  const [mainPdfData, setMainPdfData] = useState(null);
  const [insertPdfs, setInsertPdfs] = useState({});
  const [totalInsertPdfs, setTotalInsertPdfs] = useState(0);
  const [mainPdfPageCount, setMainPdfPageCount] = useState(0);
  const [mainStatus, setMainStatus] = useState({ message: '', type: '', show: false });
  const [progress, setProgress] = useState({ message: '', show: false });
  const [result, setResult] = useState({ show: false, downloadUrl: '', fileName: '' });
  const [pdfStatuses, setPdfStatuses] = useState({});

  // Update summary text
  const getSummaryText = () => {
    if (!mainPdfData) {
      return '📋 Step 1: Upload your main PDF document (Required)';
    }
    
    if (totalInsertPdfs === 0) {
      return `✅ Main PDF: ${mainPdfData.fileName} (${mainPdfPageCount} pages) | 📋 Step 2: Add at least 1 PDF to insert`;
    } else {
      const totalInsertPages = Object.values(insertPdfs).reduce((sum, pdf) => sum + pdf.pageCount, 0);
      return `✅ Main PDF: ${mainPdfPageCount} pages | ✅ Insert PDFs: ${totalInsertPdfs} file${totalInsertPdfs > 1 ? 's' : ''} (${totalInsertPages} page${totalInsertPages > 1 ? 's' : ''}) | Ready to process!`;
    }
  };

  // Check if process button should be enabled
  const canProcess = mainPdfData && totalInsertPdfs > 0;

  // Handle main PDF upload
  const handleMainPdfUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.PDFLib.PDFDocument.load(arrayBuffer);
      const pageCount = pdf.getPageCount();
      
      setMainPdfData({
        bytes: arrayBuffer,
        pageCount: pageCount,
        fileName: file.name
      });
      
      setMainPdfPageCount(pageCount);
      setMainStatus({
        message: `✅ ${file.name} loaded (${pageCount} pages)`,
        type: 'success',
        show: true
      });
      
    } catch (error) {
      setMainStatus({
        message: '❌ Error loading main PDF',
        type: 'error',
        show: true
      });
      setMainPdfData(null);
      setMainPdfPageCount(0);
    }
  };

  // Handle insert PDF upload
  const handleInsertPdfUpload = async (slotNumber, event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.PDFLib.PDFDocument.load(arrayBuffer);
      const pageCount = pdf.getPageCount();
      
      const isNewPdf = !insertPdfs[slotNumber];
      
      setInsertPdfs(prev => ({
        ...prev,
        [slotNumber]: {
          bytes: arrayBuffer,
          pageCount: pageCount,
          fileName: file.name,
          insertAfterPage: prev[slotNumber]?.insertAfterPage || 1
        }
      }));
      
      if (isNewPdf) {
        setTotalInsertPdfs(prev => prev + 1);
      }
      
      setPdfStatuses(prev => ({
        ...prev,
        [slotNumber]: {
          message: `✅ ${file.name} (${pageCount} pages)`,
          type: 'success',
          show: true
        }
      }));
      
    } catch (error) {
      setPdfStatuses(prev => ({
        ...prev,
        [slotNumber]: {
          message: '❌ Error loading PDF',
          type: 'error',
          show: true
        }
      }));
    }
  };

  // Handle page input change
  const handlePageInputChange = (slotNumber, value) => {
    const pageNumber = parseInt(value) || 0;
    setInsertPdfs(prev => ({
      ...prev,
      [slotNumber]: {
        ...prev[slotNumber],
        insertAfterPage: pageNumber
      }
    }));
  };

  // Remove insert PDF
  const removeInsertPdf = (slotNumber) => {
    if (insertPdfs[slotNumber]) {
      setInsertPdfs(prev => {
        const newPdfs = { ...prev };
        delete newPdfs[slotNumber];
        return newPdfs;
      });
      setTotalInsertPdfs(prev => prev - 1);
    }
    
    setPdfStatuses(prev => ({
      ...prev,
      [slotNumber]: { message: '', type: '', show: false }
    }));
  };

  // Clear all data
  const clearAll = () => {
    setMainPdfData(null);
    setMainPdfPageCount(0);
    setInsertPdfs({});
    setTotalInsertPdfs(0);
    setMainStatus({ message: '', type: '', show: false });
    setPdfStatuses({});
    setResult({ show: false, downloadUrl: '', fileName: '' });
    setProgress({ message: '', show: false });
  };

  // Process and merge PDFs
  const processPdfs = async () => {
    if (!mainPdfData || totalInsertPdfs === 0) return;

    try {
      setProgress({ message: 'Processing PDFs...', show: true });

      // Create final PDF
      const finalPdf = await window.PDFLib.PDFDocument.create();
      
      // Load main PDF
      const mainPdf = await window.PDFLib.PDFDocument.load(mainPdfData.bytes);
      
      // Sort insert PDFs by their insertion points
      const sortedInserts = Object.values(insertPdfs).sort((a, b) => a.insertAfterPage - b.insertAfterPage);
      
      let currentPage = 0;
      let insertIndex = 0;
      
      setProgress({ message: 'Inserting PDFs at specified pages...', show: true });
      
      // Process each page and insert PDFs at correct positions
      while (currentPage < mainPdfPageCount || insertIndex < sortedInserts.length) {
        // Check if we need to insert a PDF at this position
        while (insertIndex < sortedInserts.length && sortedInserts[insertIndex].insertAfterPage === currentPage) {
          const insertPdfData = sortedInserts[insertIndex];
          setProgress({ 
            message: `Inserting ${insertPdfData.fileName} after page ${currentPage}...`, 
            show: true 
          });
          
          const insertPdf = await window.PDFLib.PDFDocument.load(insertPdfData.bytes);
          const insertPages = await finalPdf.copyPages(insertPdf, Array.from({length: insertPdf.getPageCount()}, (_, i) => i));
          insertPages.forEach(page => finalPdf.addPage(page));
          
          insertIndex++;
        }
        
        // Add the next page from main PDF if available
        if (currentPage < mainPdfPageCount) {
          const mainPage = await finalPdf.copyPages(mainPdf, [currentPage]);
          finalPdf.addPage(mainPage[0]);
          currentPage++;
        }
      }

      setProgress({ message: 'Generating final document...', show: true });

      // Generate final PDF
      const finalPdfBytes = await finalPdf.save();
      
      // Create download
      const blob = new Blob([finalPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const fileName = `${mainPdfData.fileName.replace('.pdf', '')}-with-inserts.pdf`;
      
      // Auto-download
      const tempLink = document.createElement('a');
      tempLink.href = url;
      tempLink.download = fileName;
      tempLink.style.display = 'none';
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      
      setProgress({ message: '', show: false });
      setResult({ 
        show: true, 
        downloadUrl: url, 
        fileName: fileName 
      });
      
    } catch (error) {
      setProgress({ 
        message: '❌ Error processing PDFs: ' + error.message, 
        show: true 
      });
      console.error('Process error:', error);
    }
  };

  // Load PDF-lib if not already loaded
  useEffect(() => {
    if (!window.PDFLib) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  // Render PDF item
  const renderPdfItem = (slotNumber) => {
    const isActive = insertPdfs[slotNumber];
    const status = pdfStatuses[slotNumber];
    
    return (
      <div key={slotNumber} className={`pdf-item ${isActive ? 'filled' : ''}`}>
        <div className="pdf-number">{slotNumber}</div>
        <div className="pdf-item-header">
          <h4>Insert PDF {slotNumber}</h4>
          {isActive && (
            <button 
              className="remove-btn" 
              onClick={() => removeInsertPdf(slotNumber)}
            >
              ×
            </button>
          )}
        </div>
        <div className="page-input-group">
          <label htmlFor={`pageInput-${slotNumber}`}>Insert after page:</label>
          <input 
            type="number" 
            id={`pageInput-${slotNumber}`}
            className="page-input" 
            min="0" 
            max={mainPdfPageCount || undefined}
            value={insertPdfs[slotNumber]?.insertAfterPage || 1}
            placeholder="Page number"
            onChange={(e) => handlePageInputChange(slotNumber, e.target.value)}
          />
        </div>
        <input 
          type="file" 
          id={`pdfInput-${slotNumber}`}
          className="file-input" 
          accept=".pdf" 
          onChange={(e) => handleInsertPdfUpload(slotNumber, e)}
        />
        {status?.show && (
          <div className={`status-message ${status.type}`}>
            {status.message}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="inserter-container">
      <div className="inserter-header">
        <h1>PDF Page Inserter</h1>
        <p>Insert multiple PDFs at specific page numbers in your main document</p>
      </div>

      <div className="upload-section">
        <h3>Main PDF Document</h3>
        <input 
          type="file" 
          className="file-input"
          accept=".pdf"
          onChange={handleMainPdfUpload}
        />
        {mainStatus.show && (
          <div className={`status-message ${mainStatus.type}`}>
            {mainStatus.message}
          </div>
        )}
      </div>

      <div className="upload-section">
        <h3>PDFs to Insert</h3>
        <p>Choose any slots below to upload PDFs (minimum 1 required, maximum 10 allowed)</p><br/>
        
        <div className="inserter-grid">
          {Array.from({ length: 10 }, (_, i) => renderPdfItem(i + 1))}
        </div>
      </div>

      <div className="summary-section">
        <p>{getSummaryText()}</p>
      </div>

      <div className="actions">
        <button 
          className="action-btn process-btn"
          disabled={!canProcess}
          onClick={processPdfs}
        >
          Process & Insert PDFs
        </button>
        <button 
          className="action-btn clear-btn"
          onClick={clearAll}
        >
          Clear All
        </button>
      </div>

      {progress.show && (
        <div className="summary-section">
          <p>{progress.message}</p>
        </div>
      )}
      
      {result.show && (
        <div className="result-section">
          <h3>✅ PDFs Inserted Successfully!</h3>
          <p>Your document with inserted PDFs is ready for download.</p>
          <a 
            href={result.downloadUrl}
            download={result.fileName}
            className="action-btn process-btn"
            style={{display: 'inline-block', textDecoration: 'none'}}
          >
            Download Final Document
          </a>
        </div>
      )}

      <div className="how-to-section">
        <h4>📋 How to Use:</h4>
        <p><strong>1. Upload Main PDF:</strong> Select your primary document (Required)</p>
        <p><strong>2. Add Insert PDF(s):</strong> Upload at least 1 PDF (up to 10 maximum) you want to insert</p>
        <p><strong>3. Set Page Numbers:</strong> For each PDF, specify after which page to insert it</p>
        <p><strong>4. Process:</strong> Click "Process & Insert PDFs" to merge everything</p>
        <p><strong>📌 Note:</strong> Page numbers refer to the original main document. Use 0 to insert at the beginning.</p>
        <p><strong>✨ Tip:</strong> You can use any combination of the 10 slots - just upload to the ones you need!</p>
      </div>
    </div>
  );
};

export default PdfInserter;