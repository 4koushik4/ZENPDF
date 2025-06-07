import React, { useState, useRef } from 'react';
import './UnlockPDF.css';

const UnlockPDF = () => {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const resetForm = () => {
    setFile(null);
    setPassword('');
    setFileName('');
    setError('');
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      // Set default filename based on the uploaded file
      const baseName = selectedFile.name.replace('.pdf', '');
      setFileName(`${baseName}-unlocked`);
      setError('');
    } else {
      setFile(null);
      setError('Please select a valid PDF file');
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError('');
  };

  const handleFileNameChange = (e) => {
    setFileName(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    if (!fileName) {
      setError('Please enter a filename');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('password', password);
      formData.append('fileName', fileName);

      const response = await fetch('http://localhost:5000/unlock-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Failed to unlock PDF';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If response is not JSON, try to get text
          try {
            const text = await response.text();
            errorMessage = text || errorMessage;
          } catch (e) {
            // If all else fails, use status text
            errorMessage = response.statusText || errorMessage;
          }
        }
        throw new Error(errorMessage);
      }

      // Get the unlocked PDF as a blob
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(true);
      // Reset form after successful download
      resetForm();
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'An error occurred while unlocking the PDF. Please make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="unlock-pdf">
    <div className="unlock-pdf-container">
      <h2>Unlock PDF</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="pdfFile">Select PDF File:</label>
          <input
            ref={fileInputRef}
            type="file"
            id="pdfFile"
            accept=".pdf"
            onChange={handleFileChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">PDF Password :</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Enter PDF password"
          />
          
        </div>
        <div className="form-group">
          <label htmlFor="fileName">Output Filename:</label>
          <input
            type="text"
            id="fileName"
            value={fileName}
            onChange={handleFileNameChange}
            placeholder="Enter filename (without .pdf extension)"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Unlocking PDF...' : 'Unlock PDF'}
        </button>
      </form>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">PDF unlocked successfully!</div>}
    </div>
    </div>
  );
};

export default UnlockPDF; 