import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "./ReorderPages.css";

const ReorderPages = () => {
  const [pages, setPages] = useState([]);
  const [reorderedPdfUrl, setReorderedPdfUrl] = useState(null);
  const [error, setError] = useState(null);

  // Handle file upload (PDF)
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please upload a valid PDF file");
      return;
    }

    setError(null);
    setReorderedPdfUrl(null);

    // Convert each page to an image preview
    const pdfjsLib = await import("pdfjs-dist/webpack");
    const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;

    const previews = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 0.15 }); // smaller previews
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

  // Reorder pages by drag and drop
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(pages);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setPages(reordered);
  };

  // Mock reorder save (just preview order)
  const handleDownload = () => {
    alert("This will generate a reordered PDF in production version.");
  };

  return (
    <div className="reorder">
      <div className="remove-pages-container">
        <h2>Reorder PDF Pages</h2>

        <input type="file" accept="application/pdf" onChange={handleFileChange} />

        {error && <div className="error-message">{error}</div>}

        {pages.length > 0 && (
          <>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="pages" direction="horizontal">
                {(provided) => (
                  <div
                    className="page-grid"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {pages.map((page, index) => (
                      <Draggable key={page.id} draggableId={page.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            className={`page-preview ${
                              snapshot.isDragging ? "dragging" : ""
                            }`}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <img src={page.src} alt={`Page ${page.pageNumber}`} />
                            <div className="page-number">Page {page.pageNumber}</div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            <button className="download-btn" onClick={handleDownload}>
              Download Reordered PDF
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ReorderPages;
