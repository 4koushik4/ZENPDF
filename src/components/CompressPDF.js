import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFileUpload, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import "./CompressPDF.css";
import config from '../config';

const CompressPDF = () => {
  const [file, setFile] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState('medium');
  const [pdfName, setPdfName] = useState("");
  const [originalSize, setOriginalSize] = useState(null);
  const [compressedSize, setCompressedSize] = useState(null);
  const [compressionRatio, setCompressionRatio] = useState(null);
  const [compressedPdf, setCompressedPdf] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const onDrop = (acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
    
    if (fileExtension === 'pdf' || ['jpg', 'jpeg', 'png'].includes(fileExtension)) {
      setFile(selectedFile);
      setPdfName(selectedFile.name.replace('.pdf', ''));
      setError(null);
      setSuccess(false);
      setCompressedPdf(null);
      setOriginalSize(null);
      setCompressedSize(null);
      setCompressionRatio(null);
    } else {
      toast.error('Please upload a PDF or image file (JPG, JPEG, PNG)');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png']
    },
    multiple: false
  });

  const handleCompress = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setCompressing(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('level', compressionLevel);

    try {
      const response = await fetch(`${config.apiUrl}/compress`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Compression failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compressed_${file.name}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('File compressed successfully!');

      // Get compression info from headers
      const originalSize = response.headers.get('X-Original-Size');
      const compressedSize = response.headers.get('X-Compressed-Size');
      const compressionRatio = response.headers.get('X-Compression-Ratio');

      setOriginalSize(originalSize);
      setCompressedSize(compressedSize);
      setCompressionRatio(compressionRatio);

      // Get the compressed file as a blob
      setCompressedPdf(URL.createObjectURL(blob));
      setSuccess(true);
    } catch (error) {
      toast.error(error.message || 'Error compressing file');
    } finally {
      setCompressing(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setCompressedPdf(null);
    setOriginalSize(null);
    setCompressedSize(null);
    setCompressionRatio(null);
    setPdfName("");
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Compress PDF or Image</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Compression Level
        </label>
        <select
          value={compressionLevel}
          onChange={(e) => setCompressionLevel(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="low">Low (Better Quality)</option>
          <option value="medium">Medium (Balanced)</option>
          <option value="high">High (Smaller Size)</option>
        </select>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}`}
      >
        <input {...getInputProps()} />
        <FaFileUpload className="mx-auto text-4xl text-gray-400 mb-4" />
        {isDragActive ? (
          <p className="text-blue-500">Drop the file here...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">
              Drag and drop a PDF or image file here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Supported formats: PDF, JPG, JPEG, PNG
            </p>
          </div>
        )}
      </div>

      {file && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Selected file: <span className="font-medium">{file.name}</span>
          </p>
        </div>
      )}

      <button
        onClick={handleCompress}
        disabled={!file || compressing}
        className={`mt-6 w-full py-3 px-4 rounded-md text-white font-medium
          ${!file || compressing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
          }`}
      >
        {compressing ? (
          <span className="flex items-center justify-center">
            <FaSpinner className="animate-spin mr-2" />
            Compressing...
          </span>
        ) : (
          'Compress File'
        )}
      </button>

      {success && originalSize && compressedSize && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Original Size: {originalSize} MB
          </p>
          <p className="text-sm text-gray-600">
            Compressed Size: {compressedSize} MB
          </p>
          <p className="text-sm text-gray-600">
            Compression Ratio: {compressionRatio}%
          </p>
        </div>
      )}

      {compressedPdf && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <a 
            href={compressedPdf} 
            download={`${pdfName}-compressed.pdf`} 
            className="text-blue-500 hover:text-blue-700"
          >
            Download Compressed PDF
          </a>
          <button onClick={resetForm} className="text-gray-500 hover:text-gray-700 ml-2">
            Compress Another File
          </button>
        </div>
      )}
    </div>
  );
};

export default CompressPDF;