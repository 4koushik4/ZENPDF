import React, { useState } from "react";
import "./ReorderPages.css";

const ReorderPages = () => {
  const [pages, setPages] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please upload a valid PDF file");
      return;
    }

    setError(null);

    const pdfjsLib = await import("pdfjs-dist/webpack");
    const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;

    const previews = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 0.15 });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: ctx, viewport }).promise;
      previews.push({
        id: i.toString(),
        src: canvas.toDataURL(),
        pageNumber: i,
      });
    }

    setPages(previews);
  };

  const handlePageClick = (index) => {
    // If no page selected yet
    if (selectedIndex === null) {
      setSelectedIndex(index);
      return;
    }

    // If the same page clicked again → deselect
    if (selectedIndex === index) {
      setSelectedIndex(null);
      return;
    }

    // Swap pages
    const updatedPages = [...pages];
    [updatedPages[selectedIndex], updatedPages[index]] = [
      updatedPages[index],
      updatedPages[selectedIndex],
    ];

    setPages(updatedPages);
    setSelectedIndex(null);
  };

  return (
    <div className="reorder">
      <div className="remove-pages-container">
        <h2>Reorder PDF Pages (Swap Mode)</h2>

        <input type="file" accept="application/pdf" onChange={handleFileChange} />

        {error && <div className="error-message">{error}</div>}

        {pages.length > 0 && (
          <div className="page-grid">
            {pages.map((page, index) => (
              <div
                key={page.id}
                className={`page-preview ${
                  selectedIndex === index ? "selected" : ""
                }`}
                onClick={() => handlePageClick(index)}
                title={
                  selectedIndex === index
                    ? "Selected for swapping"
                    : "Click to select"
                }
              >
                <img
                  src={page.src}
                  alt={`Page ${page.pageNumber}`}
                  className="thumbnail-img"
                />
                <div className="page-number">Page {page.pageNumber}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReorderPages;
