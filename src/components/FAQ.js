import React, { useState } from 'react';
import './FAQ.css';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "Is ZEN PDF free to use?",
      answer: "Yes, ZEN PDF is completely free to use. All features are available without any cost or subscription."
    },
    {
      question: "Are my files secure?",
      answer: "Absolutely! All processing is done locally in your browser. Your files never leave your device, ensuring complete privacy and security."
    },
    {
      question: "What file formats are supported?",
      answer: "ZEN PDF primarily works with PDF files. For the Image to PDF tool, we support common image formats like JPG, PNG, and GIF."
    },
    {
      question: "Is there a file size limit?",
      answer: "The file size limit depends on your browser's capabilities. Generally, you can process files up to 100MB, but we recommend keeping files under 50MB for optimal performance."
    },
    {
      question: "Do I need to create an account?",
      answer: "No, ZEN PDF doesn't require any registration or account creation. You can start using all features immediately."
    },
    {
      question: "Can I use ZEN PDF offline?",
      answer: "Yes, once the website is loaded, you can use most features offline. However, some features might require an internet connection."
    },
    {
      question: "What browsers are supported?",
      answer: "ZEN PDF works best on modern browsers like Chrome, Firefox, Safari, and Edge. We recommend using the latest version of your browser."
    },
    {
      question: "How do I report a bug or suggest a feature?",
      answer: "You can report bugs or suggest features by contacting us through the 'Contact Me' button in the footer or by emailing us directly."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-container">
      <h1>Frequently Asked Questions</h1>
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className={`faq-item ${openIndex === index ? 'open' : ''}`}
            onClick={() => toggleFAQ(index)}
          >
            <div className="faq-question">
              <h3>{faq.question}</h3>
              <span className="faq-icon">{openIndex === index ? '−' : '+'}</span>
            </div>
            <div className="faq-answer">
              <p>{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ; 