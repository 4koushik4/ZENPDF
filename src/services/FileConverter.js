import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import mammoth from 'mammoth';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

class FileConverter {
  constructor() {
    this.supportedFormats = {
      input: ['pdf', 'xlsx', 'xls', 'docx', 'doc', 'txt', 'csv', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'json', 'html', 'xml'],
      output: ['pdf', 'xlsx', 'xls', 'docx', 'doc', 'txt', 'csv', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'json', 'html', 'xml']
    };
  }

  async convertFile(file, targetFormat, onProgress) {
    try {
      const fileExtension = this.getFileExtension(file.name);
      
      if (fileExtension === targetFormat) {
        throw new Error('Source and target formats are the same');
      }

      onProgress && onProgress(10, 'Reading file...');

      switch (fileExtension) {
        case 'pdf':
          return await this.convertFromPDF(file, targetFormat, onProgress);
        case 'xlsx':
        case 'xls':
          return await this.convertFromExcel(file, targetFormat, onProgress);
        case 'docx':
        case 'doc':
          return await this.convertFromWord(file, targetFormat, onProgress);
        case 'txt':
          return await this.convertFromText(file, targetFormat, onProgress);
        case 'csv':
          return await this.convertFromCSV(file, targetFormat, onProgress);
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'webp':
          return await this.convertFromImage(file, targetFormat, onProgress);
        case 'json':
          return await this.convertFromJSON(file, targetFormat, onProgress);
        case 'html':
          return await this.convertFromHTML(file, targetFormat, onProgress);
        case 'xml':
          return await this.convertFromXML(file, targetFormat, onProgress);
        default:
          throw new Error(`Unsupported input format: ${fileExtension}`);
      }
    } catch (error) {
      throw new Error(`Conversion failed: ${error.message}`);
    }
  }

  getFileExtension(fileName) {
    return fileName.split('.').pop().toLowerCase();
  }

  async convertFromPDF(file, targetFormat, onProgress) {
    onProgress && onProgress(20, 'Processing PDF...');
    
    // For PDF conversions, we'll use a simplified approach
    // In a real application, you'd need a PDF parsing library like pdf-parse
    const arrayBuffer = await file.arrayBuffer();
    
    switch (targetFormat) {
      case 'txt':
        // This is a simplified conversion - real PDF to text requires specialized libraries
        const text = "PDF content extraction requires specialized libraries like pdf-parse or pdf2pic. This is a placeholder for the extracted text content.";
        return new Blob([text], { type: 'text/plain' });
      
      case 'html':
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Converted from PDF</title>
</head>
<body>
    <h1>PDF Content</h1>
    <p>This is converted content from PDF. For full PDF text extraction, specialized libraries are needed.</p>
</body>
</html>`;
        return new Blob([htmlContent], { type: 'text/html' });
      
      default:
        throw new Error(`PDF to ${targetFormat} conversion not supported yet`);
    }
  }

  async convertFromExcel(file, targetFormat, onProgress) {
    onProgress && onProgress(30, 'Reading Excel file...');
    
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    switch (targetFormat) {
      case 'csv':
        onProgress && onProgress(60, 'Converting to CSV...');
        const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]]);
        return new Blob([csv], { type: 'text/csv' });
      
      case 'json':
        onProgress && onProgress(60, 'Converting to JSON...');
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        return new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      
      case 'txt':
        onProgress && onProgress(60, 'Converting to Text...');
        const textData = XLSX.utils.sheet_to_txt(workbook.Sheets[workbook.SheetNames[0]]);
        return new Blob([textData], { type: 'text/plain' });
      
      case 'html':
        onProgress && onProgress(60, 'Converting to HTML...');
        const htmlTable = XLSX.utils.sheet_to_html(workbook.Sheets[workbook.SheetNames[0]]);
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Converted Excel Data</title>
    <style>
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    ${htmlTable}
</body>
</html>`;
        return new Blob([htmlContent], { type: 'text/html' });
      
      case 'pdf':
        onProgress && onProgress(60, 'Converting to PDF...');
        const pdfData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        const pdf = new jsPDF();
        pdf.text('Excel Data', 20, 20);
        
        let yPosition = 40;
        pdfData.forEach((row, index) => {
          if (yPosition > 280) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(JSON.stringify(row), 20, yPosition);
          yPosition += 10;
        });
        
        return pdf.output('blob');
      
      default:
        throw new Error(`Excel to ${targetFormat} conversion not supported`);
    }
  }

  async convertFromWord(file, targetFormat, onProgress) {
    onProgress && onProgress(30, 'Reading Word document...');
    
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value;
    
    switch (targetFormat) {
      case 'txt':
        onProgress && onProgress(80, 'Converting to Text...');
        return new Blob([text], { type: 'text/plain' });
      
      case 'html':
        onProgress && onProgress(80, 'Converting to HTML...');
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Converted Word Document</title>
</head>
<body>
    <h1>Document Content</h1>
    <div>${text.replace(/\n/g, '<br>')}</div>
</body>
</html>`;
        return new Blob([htmlContent], { type: 'text/html' });
      
      case 'pdf':
        onProgress && onProgress(80, 'Converting to PDF...');
        const pdf = new jsPDF();
        const lines = pdf.splitTextToSize(text, 170);
        pdf.text(lines, 20, 20);
        return pdf.output('blob');
      
      case 'json':
        onProgress && onProgress(80, 'Converting to JSON...');
        const jsonData = { content: text, metadata: { source: 'word', converted: new Date().toISOString() } };
        return new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      
      default:
        throw new Error(`Word to ${targetFormat} conversion not supported`);
    }
  }

  async convertFromText(file, targetFormat, onProgress) {
    onProgress && onProgress(30, 'Reading text file...');
    
    const text = await file.text();
    
    switch (targetFormat) {
      case 'html':
        onProgress && onProgress(80, 'Converting to HTML...');
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Converted Text Document</title>
</head>
<body>
    <h1>Text Content</h1>
    <pre>${text}</pre>
</body>
</html>`;
        return new Blob([htmlContent], { type: 'text/html' });
      
      case 'pdf':
        onProgress && onProgress(80, 'Converting to PDF...');
        const pdf = new jsPDF();
        const lines = pdf.splitTextToSize(text, 170);
        pdf.text(lines, 20, 20);
        return pdf.output('blob');
      
      case 'json':
        onProgress && onProgress(80, 'Converting to JSON...');
        const jsonData = { content: text, metadata: { source: 'text', converted: new Date().toISOString() } };
        return new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      
      case 'csv':
        onProgress && onProgress(80, 'Converting to CSV...');
        // Simple text to CSV conversion - assumes tab or comma separated data
        const csvData = text.includes('\t') ? text.replace(/\t/g, ',') : text;
        return new Blob([csvData], { type: 'text/csv' });
      
      default:
        throw new Error(`Text to ${targetFormat} conversion not supported`);
    }
  }

  async convertFromCSV(file, targetFormat, onProgress) {
    onProgress && onProgress(30, 'Reading CSV file...');
    
    const csvText = await file.text();
    
    switch (targetFormat) {
      case 'xlsx':
        onProgress && onProgress(60, 'Converting to Excel...');
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(csvText.split('\n').map(row => row.split(',')));
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      case 'json':
        onProgress && onProgress(60, 'Converting to JSON...');
        const lines = csvText.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',');
        const jsonData = lines.slice(1).map(line => {
          const values = line.split(',');
          const obj = {};
          headers.forEach((header, index) => {
            obj[header.trim()] = values[index] ? values[index].trim() : '';
          });
          return obj;
        });
        return new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      
      case 'txt':
        onProgress && onProgress(80, 'Converting to Text...');
        return new Blob([csvText], { type: 'text/plain' });
      
      case 'html':
        onProgress && onProgress(60, 'Converting to HTML...');
        const lines_html = csvText.split('\n').filter(line => line.trim());
        const headers_html = lines_html[0].split(',');
        const tableRows = lines_html.slice(1).map(line => {
          const values = line.split(',');
          const cells = values.map(value => `<td>${value.trim()}</td>`).join('');
          return `<tr>${cells}</tr>`;
        }).join('');
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>CSV Data</title>
    <style>
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <table>
        <thead>
            <tr>${headers_html.map(header => `<th>${header.trim()}</th>`).join('')}</tr>
        </thead>
        <tbody>
            ${tableRows}
        </tbody>
    </table>
</body>
</html>`;
        return new Blob([htmlContent], { type: 'text/html' });
      
      default:
        throw new Error(`CSV to ${targetFormat} conversion not supported`);
    }
  }

  async convertFromImage(file, targetFormat, onProgress) {
    onProgress && onProgress(30, 'Processing image...');
    
    // For image conversions, we'll use canvas
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        onProgress && onProgress(80, 'Converting image...');
        
        switch (targetFormat) {
          case 'png':
            canvas.toBlob(resolve, 'image/png');
            break;
          case 'jpg':
          case 'jpeg':
            canvas.toBlob(resolve, 'image/jpeg', 0.9);
            break;
          case 'gif':
            canvas.toBlob(resolve, 'image/gif');
            break;
          case 'webp':
            canvas.toBlob(resolve, 'image/webp');
            break;
          case 'pdf':
            const pdf = new jsPDF();
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
            resolve(pdf.output('blob'));
            break;
          default:
            reject(new Error(`Image to ${targetFormat} conversion not supported`));
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  async convertFromJSON(file, targetFormat, onProgress) {
    onProgress && onProgress(30, 'Reading JSON file...');
    
    const jsonText = await file.text();
    const jsonData = JSON.parse(jsonText);
    
    switch (targetFormat) {
      case 'csv':
        onProgress && onProgress(60, 'Converting to CSV...');
        if (Array.isArray(jsonData) && jsonData.length > 0) {
          const headers = Object.keys(jsonData[0]);
          const csvContent = [
            headers.join(','),
            ...jsonData.map(row => headers.map(header => row[header] || '').join(','))
          ].join('\n');
          return new Blob([csvContent], { type: 'text/csv' });
        } else {
          throw new Error('JSON data must be an array of objects for CSV conversion');
        }
      
      case 'xlsx':
        onProgress && onProgress(60, 'Converting to Excel...');
        if (Array.isArray(jsonData)) {
          const workbook = XLSX.utils.book_new();
          const worksheet = XLSX.utils.json_to_sheet(jsonData);
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
          const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
          return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        } else {
          throw new Error('JSON data must be an array for Excel conversion');
        }
      
      case 'txt':
        onProgress && onProgress(80, 'Converting to Text...');
        return new Blob([JSON.stringify(jsonData, null, 2)], { type: 'text/plain' });
      
      case 'html':
        onProgress && onProgress(60, 'Converting to HTML...');
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>JSON Data</title>
    <style>
        body { font-family: monospace; margin: 20px; }
        pre { background: #f5f5f5; padding: 20px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>JSON Data</h1>
    <pre>${JSON.stringify(jsonData, null, 2)}</pre>
</body>
</html>`;
        return new Blob([htmlContent], { type: 'text/html' });
      
      default:
        throw new Error(`JSON to ${targetFormat} conversion not supported`);
    }
  }

  async convertFromHTML(file, targetFormat, onProgress) {
    onProgress && onProgress(30, 'Reading HTML file...');
    
    const htmlText = await file.text();
    
    switch (targetFormat) {
      case 'txt':
        onProgress && onProgress(60, 'Converting to Text...');
        // Simple HTML to text conversion - remove HTML tags
        const textContent = htmlText.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        return new Blob([textContent], { type: 'text/plain' });
      
      case 'pdf':
        onProgress && onProgress(60, 'Converting to PDF...');
        // Create a temporary div with the HTML content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlText;
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        document.body.appendChild(tempDiv);
        
        try {
          const canvas = await html2canvas(tempDiv);
          const pdf = new jsPDF();
          const imgData = canvas.toDataURL('image/png');
          pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
          return pdf.output('blob');
        } finally {
          document.body.removeChild(tempDiv);
        }
      
      case 'json':
        onProgress && onProgress(80, 'Converting to JSON...');
        const jsonData = { content: htmlText, metadata: { source: 'html', converted: new Date().toISOString() } };
        return new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      
      default:
        throw new Error(`HTML to ${targetFormat} conversion not supported`);
    }
  }

  async convertFromXML(file, targetFormat, onProgress) {
    onProgress && onProgress(30, 'Reading XML file...');
    
    const xmlText = await file.text();
    
    switch (targetFormat) {
      case 'json':
        onProgress && onProgress(60, 'Converting to JSON...');
        // Simple XML to JSON conversion (basic implementation)
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        const jsonData = this.xmlToJson(xmlDoc);
        return new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      
      case 'txt':
        onProgress && onProgress(80, 'Converting to Text...');
        const textContent = xmlText.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        return new Blob([textContent], { type: 'text/plain' });
      
      case 'html':
        onProgress && onProgress(60, 'Converting to HTML...');
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>XML Data</title>
    <style>
        body { font-family: monospace; margin: 20px; }
        pre { background: #f5f5f5; padding: 20px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>XML Data</h1>
    <pre>${xmlText}</pre>
</body>
</html>`;
        return new Blob([htmlContent], { type: 'text/html' });
      
      default:
        throw new Error(`XML to ${targetFormat} conversion not supported`);
    }
  }

  xmlToJson(xml) {
    let obj = {};
    
    if (xml.nodeType === 1) { // element node
      if (xml.attributes.length > 0) {
        obj['@attributes'] = {};
        for (let j = 0; j < xml.attributes.length; j++) {
          const attribute = xml.attributes.item(j);
          obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
        }
      }
    } else if (xml.nodeType === 3) { // text node
      obj = xml.nodeValue;
    }
    
    if (xml.hasChildNodes()) {
      for (let i = 0; i < xml.childNodes.length; i++) {
        const item = xml.childNodes.item(i);
        const nodeName = item.nodeName;
        if (typeof obj[nodeName] === 'undefined') {
          obj[nodeName] = this.xmlToJson(item);
        } else {
          if (typeof obj[nodeName].push === 'undefined') {
            const old = obj[nodeName];
            obj[nodeName] = [];
            obj[nodeName].push(old);
          }
          obj[nodeName].push(this.xmlToJson(item));
        }
      }
    }
    
    return obj;
  }

  getSupportedConversions(inputFormat) {
    const conversions = {
      'pdf': ['txt', 'html'],
      'xlsx': ['csv', 'json', 'txt', 'html', 'pdf'],
      'xls': ['csv', 'json', 'txt', 'html', 'pdf'],
      'docx': ['txt', 'html', 'pdf', 'json'],
      'doc': ['txt', 'html', 'pdf', 'json'],
      'txt': ['html', 'pdf', 'json', 'csv'],
      'csv': ['xlsx', 'json', 'txt', 'html'],
      'png': ['jpg', 'jpeg', 'gif', 'webp', 'pdf'],
      'jpg': ['png', 'gif', 'webp', 'pdf'],
      'jpeg': ['png', 'gif', 'webp', 'pdf'],
      'gif': ['png', 'jpg', 'jpeg', 'webp', 'pdf'],
      'webp': ['png', 'jpg', 'jpeg', 'gif', 'pdf'],
      'json': ['csv', 'xlsx', 'txt', 'html'],
      'html': ['txt', 'pdf', 'json'],
      'xml': ['json', 'txt', 'html']
    };
    
    return conversions[inputFormat] || [];
  }
}

export default new FileConverter();


