import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FileText, RotateCcw, Zap } from 'lucide-react';

// Components
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Home0 from "./components/home0";
import MergePDF from "./components/MergePDF";
import SplitPDF from "./components/SplitPDF";
import ExtractPages from "./components/ExtractPages";
import WatermarkPDF from "./components/WatermarkPDF";
import Fundraiser from "./components/Fundraiser";
import PasswordProtect from './components/PasswordProtect';
import RemovePages from './components/RemovePages';
import RotatePDF from './components/RotatePDF';
import ReorderPages from './components/ReorderPages';
import SignPDF from './components/SignPDF';
import UnlockPDF from './components/UnlockPDF';
import AddPageNumbers from './components/AddPageNumbers';
import FAQ from './components/FAQ';
import Support from './components/Support';
import Updates from './components/Updates';
import Feedback from './components/Feedback';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import AdminFeedback from './components/AdminFeedback';
import Contact from './components/Contact';
import PDFPageInsert from './components/pdfpageinsert';
import InsertBlankPage from './components/InsertBlankPage';
import InsertPdfIntoPdf from './components/InsertPdfIntoPdf';
import AdvancedCompressPDF from './components/AdvancedCompressPDF';

// File Converter Components
import FileUpload from './components/FileUpload';
import FormatSelector from './components/FormatSelector';
import ConversionProgress from './components/ConversionProgress';
import DownloadButton from './components/DownloadButton';
import FileConverter from './services/FileConverter';

// Styles
import "./styles.css";

// Layout wrapper for Navbar visibility control
const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbar = location.pathname === "/";
  
  return (
    <>
      {!hideNavbar && <Navbar />}
      <div className="container">
        {children}
      </div>
    </>
  );
};

// File Converter Component (integrated as a page)
const FileConverterPro = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionStatus, setConversionStatus] = useState('');
  const [conversionError, setConversionError] = useState(null);
  const [convertedFile, setConvertedFile] = useState(null);
  const [supportedFormats, setSupportedFormats] = useState([]);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setSelectedFormat('');
    setConvertedFile(null);
    setConversionError(null);
    setConversionProgress(0);
    setConversionStatus('');
    
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const supported = FileConverter.getSupportedConversions(fileExtension);
    setSupportedFormats(supported);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setSelectedFormat('');
    setConvertedFile(null);
    setConversionError(null);
    setConversionProgress(0);
    setConversionStatus('');
    setSupportedFormats([]);
  };

  const handleFormatSelect = (format) => {
    setSelectedFormat(format);
    setConvertedFile(null);
    setConversionError(null);
    setConversionProgress(0);
    setConversionStatus('');
  };

  const handleConvert = async () => {
    if (!selectedFile || !selectedFormat) {
      setConversionError('Please select a file and output format');
      return;
    }

    setIsConverting(true);
    setConversionError(null);
    setConversionProgress(0);
    setConversionStatus('Initializing conversion...');

    try {
      const convertedBlob = await FileConverter.convertFile(
        selectedFile,
        selectedFormat,
        (progress, status) => {
          setConversionProgress(progress);
          setConversionStatus(status);
        }
      );

      setConvertedFile(convertedBlob);
      setConversionProgress(100);
      setConversionStatus('Conversion completed successfully!');
    } catch (error) {
      setConversionError(error.message);
      setConversionProgress(0);
      setConversionStatus('');
    } finally {
      setIsConverting(false);
    }
  };

  const handleReset = () => {
    handleRemoveFile();
  };

  const handleDownload = () => {
    setTimeout(() => handleReset(), 1000);
  };

  return (
    <div className="App">
      <div className="container">
        <header className="app-header">
          <div className="header-content">
            <div className="logo">
              <FileText size={48} />
              <h1>File Converter Pro</h1>
            </div>
            <p className="subtitle">
              Convert files between different formats instantly. 
              Supports PDF, Excel, Word, Images, Text, CSV, JSON, HTML, and XML.
            </p>
          </div>
        </header>

        <main className="main-content">
          <div className="card">
            <FileUpload
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              onRemoveFile={handleRemoveFile}
            />

            {selectedFile && (
              <FormatSelector
                selectedFile={selectedFile}
                selectedFormat={selectedFormat}
                onFormatSelect={handleFormatSelect}
                supportedFormats={supportedFormats}
              />
            )}

            {selectedFile && selectedFormat && !isConverting && !convertedFile && (
              <div className="convert-section">
                <button
                  className="btn convert-btn"
                  onClick={handleConvert}
                >
                  <Zap size={20} />
                  Convert to {selectedFormat.toUpperCase()}
                </button>
              </div>
            )}

            {isConverting && (
              <ConversionProgress
                progress={conversionProgress}
                status={conversionStatus}
                error={conversionError}
                onReset={handleReset}
              />
            )}

            {conversionError && !isConverting && (
              <div className="error">
                <h4>Conversion Failed</h4>
                <p>{conversionError}</p>
                <button className="btn btn-secondary" onClick={handleReset}>
                  <RotateCcw size={16} />
                  Try Again
                </button>
              </div>
            )}

            {convertedFile && (
              <div>
                <ConversionProgress
                  progress={100}
                  status="Conversion completed successfully!"
                  error={null}
                  onReset={handleReset}
                />
                <DownloadButton
                  convertedFile={convertedFile}
                  originalFileName={selectedFile.name}
                  targetFormat={selectedFormat}
                  onDownload={handleDownload}
                />
              </div>
            )}
          </div>

          <div className="features-section">
            <h2>Supported Conversions</h2>
            <div className="features-grid">
              <div className="feature-card"><h3>📄 Documents</h3><p>PDF ↔ Word ↔ Text ↔ HTML</p></div>
              <div className="feature-card"><h3>📊 Spreadsheets</h3><p>Excel ↔ CSV ↔ JSON ↔ HTML</p></div>
              <div className="feature-card"><h3>🖼️ Images</h3><p>PNG ↔ JPG ↔ GIF ↔ WebP ↔ PDF</p></div>
              <div className="feature-card"><h3>📋 Data Files</h3><p>JSON ↔ CSV ↔ XML ↔ HTML</p></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Main App with Routing
const App = () => {
  return (
    <Router>
      <div className="App">
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/" element={<Layout><Home0 /></Layout>} />
          <Route path="/home" element={<Layout><Home /></Layout>} />
          <Route path="/merge" element={<Layout><MergePDF /></Layout>} />
          <Route path="/split" element={<Layout><SplitPDF /></Layout>} />
          <Route path="/extract-pages" element={<Layout><ExtractPages /></Layout>} />
          <Route path="/remove-pages" element={<Layout><RemovePages /></Layout>} />
          <Route path="/rotate-pdf" element={<Layout><RotatePDF /></Layout>} />
          <Route path="/reorder-pages" element={<Layout><ReorderPages /></Layout>} />
          <Route path="/watermark" element={<Layout><WatermarkPDF /></Layout>} />
          <Route path="/password-protect" element={<Layout><PasswordProtect /></Layout>} />
          <Route path="/sign-pdf" element={<Layout><SignPDF /></Layout>} />
          <Route path="/unlock-pdf" element={<Layout><UnlockPDF /></Layout>} />
          <Route path="/page-numbers" element={<Layout><AddPageNumbers /></Layout>} />
          <Route path="/pdf-page-insert" element={<Layout><PDFPageInsert /></Layout>} />
          <Route path="/insert-blank-page" element={<Layout><InsertBlankPage /></Layout>} />
          <Route path="/insert-pdf-into-pdf" element={<Layout><InsertPdfIntoPdf /></Layout>} />
          <Route path="/compress" element={<Layout><AdvancedCompressPDF /></Layout>} />
          <Route path="/fundraiser" element={<Layout><Fundraiser /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          <Route path="/adminfeedback" element={<Layout><AdminFeedback /></Layout>} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/support" element={<Support />} />
          <Route path="/updates" element={<Updates />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />

          {/* ✅ Added route for File Converter Page */}
          <Route path="/file-converter" element={<Layout><FileConverterPro /></Layout>} />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
