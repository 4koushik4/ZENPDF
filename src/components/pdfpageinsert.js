import React from 'react';
import { useNavigate } from 'react-router-dom';
import './pdfpageinsert.css'; // We will create this file for styling

const PDFPageInsert = () => {
  const navigate = useNavigate();

  const goToInsertBlankPage = () => {
    navigate('/insert-blank-page');
  };

  const goToInsertPdfIntoPdf = () => {
    navigate('/insert-pdf-into-pdf');
  };

  return (
    <div className="pdf-page-insert">
    <div className="pdf-page-insert-container">
      <h2>PDF Page Insertion</h2>
      <p>Choose an option below to modify your PDF.</p>
      <div className="button-container">
        <button className="action-button" onClick={goToInsertBlankPage}>
          Insert Blank Page
        </button>
        <button className="action-button" onClick={goToInsertPdfIntoPdf}>
          Insert PDF into PDF
        </button>
      </div>
    </div>
    </div>
  );
};

export default PDFPageInsert;
