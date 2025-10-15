import React, { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "./RemovePages.css";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const ReorderPages = () => {
  const [file, setFile] = useState(null);
  const [pageImages, setPageImages] = useState([]);
  const [pageOrder, setPageOrder] = useState([]);
  const [reorderedPdfUrl, setReorderedPdfUrl] = useState(null);
  const [pdfName, setPdfName] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  // Handle PDF upload and generate thumbnails
  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setReorderedPdfUrl(null);
    setLoading(true);

    const baseName = selectedFile.name.replace(".pdf", "");
    setPdfName(`${baseName}-reordered`);

    const fileReader = new FileReader();
    fileReader.onload = async function () {
      try {
        const typedarray = new Uint8Array(this.result);
        const loadingTask = pdfjsLib.getDocument({ data: typedarray });
        const pdf = await loadingTask.promise;
        const images = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: context, viewport }).promise;
          images.push({ pageNumber: i, image: canvas.toDataURL() });
        }

        setPageImages(images);
        setPageOrder(images.map((_, idx) => idx)); // store original order
      } catch (err) {
        console.error("PDF render error:", err);
        alert("Error reading PDF. Please try another file.");
      } finally {
        setLoading(false);
      }
    };
    fileReader.readAsArrayBuffer(selectedFile);
  };

  // Handle drag and drop reorder
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const newOrder = Array.from(pageOrder);
    const [moved] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, moved);
    setPageOrder(newOrder);
  };

  // Generate new reordered PDF
  const handleReorder = async () => {
    if (!file || pageOrder.length === 0) {
      alert("Please select a PDF file first.");
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const existingPdfBytes = new Uint8Array(event.target.result);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const newPdfDoc = await PDFDocument.create();

        for (let idx of pageOrder) {
          const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [idx]);
          newPdfDoc.addPage(copiedPage);
        }

        const newPdfBytes = await newPdfDoc.save();
        const newPdfBlob = new Blob([newPdfBytes], { type: "application/pdf" });
        const newPdfUrl = URL.createObjectURL(newPdfBlob);
        setReorderedPdfUrl(newPdfUrl);
      } catch (err) {
        console.error("Error reordering pages:", err);
        alert("Something went wrong while reordering pages.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="reorder">
      <div className="reorder-container">
        <h2>Reorder Pages in PDF</h2>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          ref={fileInputRef}
        />

        {loading && <p>Loading pages...</p>}

        {pageImages.length > 0 && (
          <>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="pages" direction="horizontal">
                {(provided) => (
                  <div
                    className="reorder-thumbnails"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {pageOrder.map((idx, index) => (
                      <Draggable
                        key={pageImages[idx].pageNumber}
                        draggableId={`page-${pageImages[idx].pageNumber}`}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`reorder-thumb ${
                              snapshot.isDragging ? "dragging" : ""
                            }`}
                          >
                            <img
                              src={pageImages[idx].image}
                              alt={`Page ${pageImages[idx].pageNumber}`}
                            />
                            <span className="page-number">
                              {pageImages[idx].pageNumber}
                            </span>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            <input
              type="text"
              placeholder="Enter PDF name (without .pdf)"
              value={pdfName}
              onChange={(e) => setPdfName(e.target.value)}
              style={{ marginTop: 16 }}
            />

            <button
              onClick={handleReorder}
              disabled={loading}
              className="reorder-btn"
            >
              {loading ? "Reordering..." : "Reorder Pages"}
            </button>
          </>
        )}

        {reorderedPdfUrl && (
          <a
            href={reorderedPdfUrl}
            download={`${pdfName || "reordered"}.pdf`}
            className="download-btn"
          >
            Download Reordered PDF
          </a>
        )}
      </div>
    </div>
  );
};

export default ReorderPages;
