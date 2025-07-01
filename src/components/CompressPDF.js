// src/pages/CompressPdfPage.js

import React from 'react';

const CompressPdfPage = () => {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <iframe
        src="/compresspdf/index.html"
        title="PDF Compressor"
        width="100%"
        height="100%"
        style={{ border: 'none' }}
      />
    </div>
  );
};

export default CompressPdfPage;
