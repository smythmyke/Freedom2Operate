import jsPDF from 'jspdf';

interface FormData {
  projectName: string;
  referenceNumber: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  inventionTitle: string;
  background: string;
  description: string;
  features: string[];
  technicalField: string;
  targetMarkets?: string[];
  conceptionDate?: string;
  targetJurisdictions?: string[];
  relatedPatents?: string[];
}

export const generateSubmissionPDF = async (formData: FormData): Promise<jsPDF> => {
  const doc = new jsPDF();
  
  // Define margins
  const margin = 20;
  const headerMargin = 15; // Space for header
  const footerMargin = 20; // Space for footer
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const maxWidth = pageWidth - 2 * margin;
  const contentStartY = margin + headerMargin;
  const contentEndY = pageHeight - (margin + footerMargin);

  // Helper function to add header
  const addHeader = () => {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const header = `${formData.inventionTitle} | Ref: ${formData.referenceNumber}`;
    doc.text(header, margin, margin);
    doc.text(new Date().toLocaleDateString(), pageWidth - margin, margin, { align: 'right' });
    doc.setTextColor(0, 0, 0);
  };

  // Helper function to add footer
  const addFooter = (pageNum: number, totalPages: number) => {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Freedom2operate Search Report | Page ${pageNum} of ${totalPages}`, pageWidth / 2, pageHeight - margin, { align: 'center' });
    doc.setTextColor(0, 0, 0);
  };

  // Add header and footer to all pages
  const addHeadersAndFooters = () => {
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      addHeader();
      addFooter(i, pageCount);
    }
  };

  let yPos = contentStartY; // Start after header margin
  const lineHeight = 7;

  // Helper function to add text with word wrap
  const addWrappedText = (text: string, y: number, maxLines = 0) => {
    const lines = doc.splitTextToSize(text, maxWidth);
    if (maxLines > 0 && lines.length > maxLines) {
      lines.length = maxLines;
      lines[maxLines - 1] += '...';
    }
    doc.text(lines, margin, y);
    return y + (lines.length * lineHeight);
  };

  // Helper function to check if we need a new page
  const checkNewPage = (currentY: number, requiredSpace: number = lineHeight) => {
    if (currentY + requiredSpace > contentEndY) {
      doc.addPage();
      return contentStartY;
    }
    return currentY;
  };

  // Title
  doc.setFontSize(20);
  // Title with styled "2"
  const title = 'Freedom';
  const titleWidth = doc.getStringUnitWidth(title) * doc.getFontSize() / doc.internal.scaleFactor;
  doc.text(title, margin, yPos);
  
  doc.setTextColor(255, 68, 68); // #ff4444
  doc.setFontSize(24); // Larger font for "2"
  doc.text('2', margin + titleWidth + 1, yPos);
  
  doc.setTextColor(0, 0, 0); // Reset to black
  doc.setFontSize(20); // Reset font size
  const operate = 'Operate Search Request';
  doc.text(operate, margin + titleWidth + 8, yPos);
  yPos += lineHeight * 2;

  // Basic Information
  yPos = checkNewPage(yPos, lineHeight * 2);
  doc.setFontSize(16);
  doc.text('Project Information', margin, yPos);
  yPos += lineHeight * 2;

  doc.setFontSize(12);
  yPos = checkNewPage(yPos);
  yPos = addWrappedText(`Project Name: ${formData.projectName}`, yPos);
  yPos = checkNewPage(yPos);
  yPos = addWrappedText(`Reference Number: ${formData.referenceNumber || 'N/A'}`, yPos);
  yPos = checkNewPage(yPos);
  yPos = addWrappedText(`Company: ${formData.companyName || 'N/A'}`, yPos);
  yPos = checkNewPage(yPos);
  yPos = addWrappedText(`Contact: ${formData.contactName}`, yPos);
  yPos = checkNewPage(yPos);
  yPos = addWrappedText(`Email: ${formData.email}`, yPos);
  yPos = checkNewPage(yPos);
  yPos = addWrappedText(`Phone: ${formData.phone}`, yPos);
  yPos += lineHeight * 2;

  // Invention Details
  yPos = checkNewPage(yPos, lineHeight * 2);
  doc.setFontSize(16);
  doc.text('Invention Details', margin, yPos);
  yPos += lineHeight;

  doc.setFontSize(12);
  yPos = checkNewPage(yPos);
  yPos = addWrappedText(`Title: ${formData.inventionTitle}`, yPos);
  if (formData.technicalField) {
    yPos = checkNewPage(yPos);
    yPos = addWrappedText(`Technical Field: ${formData.technicalField}`, yPos);
  }

  // Background
  if (formData.background) {
    yPos = checkNewPage(yPos, lineHeight * 2);
    doc.setFontSize(14);
    doc.text('Background', margin, yPos);
    yPos += lineHeight;
    doc.setFontSize(12);
    yPos = checkNewPage(yPos);
    yPos = addWrappedText(formData.background, yPos);
  }

  // Description
  yPos = checkNewPage(yPos, lineHeight * 2);
  doc.setFontSize(14);
  doc.text('Detailed Description', margin, yPos);
  yPos += lineHeight;
  doc.setFontSize(12);
  yPos = checkNewPage(yPos);
  yPos = addWrappedText(formData.description, yPos);

  // Features
  if (formData.features.some(f => f)) {
    yPos = checkNewPage(yPos, lineHeight * 2);
    doc.setFontSize(14);
    doc.text('Key Features', margin, yPos);
    yPos += lineHeight;
    doc.setFontSize(12);
    formData.features.forEach((feature, index) => {
      if (feature) {
        yPos = checkNewPage(yPos);
        yPos = addWrappedText(`${index + 1}. ${feature}`, yPos);
      }
    });
  }

  // Target Markets or Jurisdictions
  if (formData.targetMarkets?.length) {
    yPos = checkNewPage(yPos, lineHeight * 2);
    doc.setFontSize(14);
    doc.text('Target Markets', margin, yPos);
    yPos += lineHeight;
    doc.setFontSize(12);
    yPos = checkNewPage(yPos);
    yPos = addWrappedText(formData.targetMarkets.join(', '), yPos);
  }

  if (formData.targetJurisdictions?.length) {
    yPos = checkNewPage(yPos, lineHeight * 2);
    doc.setFontSize(14);
    doc.text('Target Jurisdictions', margin, yPos);
    yPos += lineHeight;
    doc.setFontSize(12);
    yPos = checkNewPage(yPos);
    yPos = addWrappedText(formData.targetJurisdictions.join(', '), yPos);
  }

  // Related Patents
  if (formData.relatedPatents?.some(p => p)) {
    yPos = checkNewPage(yPos, lineHeight * 2);
    doc.setFontSize(14);
    doc.text('Related Patents', margin, yPos);
    yPos += lineHeight;
    doc.setFontSize(12);
    formData.relatedPatents.forEach((patent) => {
      if (patent) {
        yPos = checkNewPage(yPos);
        yPos = addWrappedText(patent, yPos);
      }
    });
  }

  // What to Expect Section
  yPos = checkNewPage(yPos, lineHeight * 2);
  doc.setFontSize(14);
  doc.text('What to Expect', margin, yPos);
  yPos += lineHeight;
  doc.setFontSize(12);

  const expectationText = [
    'Our comprehensive search process involves a thorough analysis of patent databases including USPTO, EPO, WIPO, and other relevant technical literature. The search is conducted by experienced patent professionals using advanced search strategies and tools.',
    'You can expect to receive your detailed report within 5 business days. The report will include:',
    '• A comprehensive analysis of relevant patents and prior art',
    '• Detailed examination of potential freedom to operate issues',
    '• Market and competitive landscape insights',
    '• Strategic recommendations and next steps',
    'Our search utilizes industry-standard databases and resources to ensure thorough coverage of both patent and non-patent literature, providing you with actionable insights for your innovation strategy.',
    '',
    'Contact Information:',
    'Michael Smith',
    'Email: smythmyke@gmail.com',
    'Phone: (214-400-3781)'
  ];

  expectationText.forEach((text) => {
    yPos = checkNewPage(yPos);
    yPos = addWrappedText(text, yPos);
    if (!text.startsWith('•')) {
      yPos += lineHeight / 2; // Add extra space between paragraphs
    }
  });

  // Add headers and footers before returning
  addHeadersAndFooters();
  
  return doc;
};
