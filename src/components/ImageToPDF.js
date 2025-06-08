import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { jsPDF } from "jspdf";
import "./ImageToPDF.css";

const ImageToPDF = () => {
  const [images, setImages] = useState([]);
  const [pdfName, setPdfName] = useState(null);
  //const fileInputRef = useRef(null);

  // Handle Image Upload from File
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setImages([...images, ...imageUrls]);
  };

  // Handle Image Capture from Camera
  

  // Handle Drag and Drop
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setImages(items);
  };

  // Handle Delete Image
  const handleDeleteImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
  };

  // Convert Images to PDF
  const handleConvertToPDF = () => {
    if (images.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    const pdf = new jsPDF("p", "mm", "a4");
    images.forEach((img, index) => {
      const imgWidth = 210;
      const imgHeight = 297;
      if (index > 0) pdf.addPage();
      pdf.addImage(img, "JPEG", 0, 0, imgWidth, imgHeight);
    });

    pdf.save(pdfName);
  };

  return (
    <div className="image-to-pdf">
    <div className="image-to-pdf-container">
      <h2>Image to PDF Converter</h2>

      {/* Upload Images */}
      <input type="file" accept="image/*" multiple onChange={handleImageUpload} />

      

      {/* PDF Name Input */}
      <input
        type="text"
        placeholder="Enter PDF name (e.g., myfile.pdf)"
        value={pdfName}
        onChange={(e) => setPdfName(e.target.value)}
      />

      {/* Drag and Drop Image List */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="imageList">
          {(provided) => (
            <div className="image-preview" {...provided.droppableProps} ref={provided.innerRef}>
              {images.map((img, index) => (
                <Draggable key={img} draggableId={img} index={index}>
                  {(provided) => (
                    <div
                      className="image-item"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <img src={img} alt={`Preview ${index + 1}`} />
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteImage(index)}
                      >
                        ❌
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Convert to PDF Button */}
      <button onClick={handleConvertToPDF}>Convert & Download</button>
    </div>
    </div>
  );
};

export default ImageToPDF;
