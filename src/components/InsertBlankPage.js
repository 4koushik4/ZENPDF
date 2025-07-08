import React, { useRef, useState } from 'react';
import './InsertBlankPage.css'; // Uncomment if you have custom styles

function InsertBlankPage() {
  const [pdfFile, setPdfFile] = useState(null);
  const [pageImages, setPageImages] = useState([]);
  const [pagesToRender, setPagesToRender] = useState([]); // array of { type: 'pdf' | 'blank', index: number }
  const fileInputRef = useRef();

  // Load PDF and render page previews
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPdfFile(file);
    const fileReader = new FileReader();
    fileReader.onload = async function() {
      const typedarray = new Uint8Array(this.result);
      // eslint-disable-next-line no-undef
      const loadingTask = window.pdfjsLib.getDocument({ data: typedarray });
      const pdf = await loadingTask.promise;
      const images = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;
        images.push(canvas.toDataURL());
      }
      setPageImages(images);
      // Initialize pagesToRender: [{type: 'pdf', index: 0}, ...]
      setPagesToRender(Array.from({ length: pdf.numPages }, (_, i) => ({ type: 'pdf', index: i })));
    };
    fileReader.readAsArrayBuffer(file);
  };

  // Insert blank page at position idx
  const handleInsertBlank = (idx) => {
    setPagesToRender((prev) => {
      const newPages = [...prev];
      newPages.splice(idx, 0, { type: 'blank' });
      return newPages;
    });
  };

  // Generate and download the new PDF
  const handleDownload = async () => {
    if (!pdfFile) return;
    const arrayBuffer = await pdfFile.arrayBuffer();
    // eslint-disable-next-line no-undef
    const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
    // Get size from first page or default
    let width = 595.28, height = 841.89; // A4 default
    if (pdfDoc.getPageCount() > 0) {
      const { width: w, height: h } = pdfDoc.getPage(0).getSize();
      width = w; height = h;
    }
    // Build new PDF
    const newPdfDoc = await window.PDFLib.PDFDocument.create();
    for (const page of pagesToRender) {
      if (page.type === 'blank') {
        newPdfDoc.addPage([width, height]);
      } else {
        const [copied] = await newPdfDoc.copyPages(pdfDoc, [page.index]);
        newPdfDoc.addPage(copied);
      }
    }
    const pdfBytes = await newPdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zen-pdf-blankpage.pdf';
    a.click();
    URL.revokeObjectURL(url);
    // Reset state for new input
    setPdfFile(null);
    setPageImages([]);
    setPagesToRender([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="insert-blank-page-container">
      <div className="insert-blank-page-card">
      <h2>Insert Blank Pages into PDF</h2>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        ref={fileInputRef}
      />
      {pagesToRender.length > 0 && (
        <div className="pdf-overview" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Plus at start */}
          <button
            onClick={() => handleInsertBlank(0)}
            className="plus-btn"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: '#1976d2',
              color: 'white',
              border: 'none',
              fontSize: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              margin: '0 8px',
            }}
            aria-label="Insert blank page"
          >
            +
          </button>
          {pagesToRender.map((page, idx) => (
            <React.Fragment key={idx}>
              {page.type === 'pdf' ? (
                <img
                  src={pageImages[page.index]}
                  alt={`Page ${page.index + 1}`}
                  className="pdf-thumb"
                  style={{ width: 100, height: 140, objectFit: 'contain', border: '1px solid #ccc', borderRadius: 4 }}
                />
              ) : (
                <div
                  className="blank-thumb"
                  style={{
                    width: 100,
                    height: 140,
                    background: '#f5f5f5',
                    border: '2px dashed #aaa',
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#888',
                    fontWeight: 'bold',
                    fontSize: 16,
                  }}
                >
                  Blank Page
                </div>
              )}
              <button
                onClick={() => handleInsertBlank(idx + 1)}
                className="plus-btn"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: '#1976d2',
                  color: 'white',
                  border: 'none',
                  fontSize: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  margin: '0 8px',
                }}
                aria-label="Insert blank page"
              >
                +
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
      {pagesToRender.length > 0 && (
        <button onClick={handleDownload} className="download-btn" style={{ marginTop: 24, padding: '12px 24px', fontSize: 18, background: '#1976d2', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            Download Modified PDF
          </button>
        )}
      </div>
    </div>
  );
}

export default InsertBlankPage;