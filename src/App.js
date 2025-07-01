import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import MergePDF from "./components/MergePDF";
import SplitPDF from "./components/SplitPDF";
import CompressPDF from "./components/CompressPDF";
import ExtractPages from "./components/ExtractPages";
import ImageToPDF from "./components/ImageToPDF";
import WatermarkPDF from "./components/WatermarkPDF";
import "./styles.css";
import Fundraiser from "./components/Fundraiser";
import Home0 from "./components/home0";
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

// Create a layout component that conditionally renders the Navbar
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

const App = () => {
  return (
    <Router>
      <div className="App">
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/" element={
            <Layout>
              <Home0 />
            </Layout>
          } />
          <Route path="/home" element={
            <Layout>
              <Home />
            </Layout>
          } />
          <Route path="/merge" element={
            <Layout>
              <MergePDF />
            </Layout>
          } />
          <Route path="/contact" element={
            <Layout>
              <Contact />
            </Layout>
          } />
          <Route path="/adminfeedback" element={
            <Layout>
              <AdminFeedback />
            </Layout>
          } />
          <Route path="/split" element={
            <Layout>
              <SplitPDF />
            </Layout>
          } />
          <Route path="/compress" element={
            <Layout>
              <CompressPDF />
            </Layout>
          } />
          <Route path="/extract-pages" element={
            <Layout>
              <ExtractPages />
            </Layout>
          } />
          <Route path="/remove-pages" element={
            <Layout>
              <RemovePages />
            </Layout>
          } />
          <Route path="/rotate-pdf" element={
            <Layout>
              <RotatePDF />
            </Layout>
          } />
          <Route path="/reorder-pages" element={
            <Layout>
              <ReorderPages />
            </Layout>
          } />
          <Route path="/image-to-pdf" element={
            <Layout>
              <ImageToPDF />
            </Layout>
          } />
          <Route path="/watermark" element={
            <Layout>
              <WatermarkPDF />
            </Layout>
          } />
          <Route path="/Fundraiser" element={
            <Layout>
              <Fundraiser />
            </Layout>
          } />
          <Route path="/password-protect" element={
            <Layout>
              <PasswordProtect />
            </Layout>
          } />
          <Route path="/sign-pdf" element={
            <Layout>
              <SignPDF />
            </Layout>
          } />
          <Route path="/unlock-pdf" element={
            <Layout>
              <UnlockPDF />
            </Layout>
          } />
          <Route path="/page-numbers" element={
            <Layout>
              <AddPageNumbers />
            </Layout>
          } />
          <Route path="/pdf-page-insert" element={
            <Layout>
              <PDFPageInsert />
            </Layout>
          } />
          <Route path="/insert-blank-page" element={
            <Layout>
              <InsertBlankPage />
            </Layout>
          } />
          <Route path="/insert-pdf-into-pdf" element={
            <Layout>
              <InsertPdfIntoPdf />
            </Layout>
          } />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/support" element={<Support />} />
          <Route path="/updates" element={<Updates />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          {/* Redirect all unknown routes to Home Page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
