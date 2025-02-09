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

  // Add watermark
  try {
    // Import logo using Vite's dynamic import
    const logoModule = await import('../assets/logo1.png');
    const logoUrl = logoModule.default;
    
    // Create a new image and wait for it to load
    const loadImage = (): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = logoUrl;
      });
    };

    const logo = await loadImage();
    
    // Calculate center position and size for watermark
    const logoWidth = 100;
    const logoHeight = 100;
    const logoX = (pageWidth - logoWidth) / 2;
    const logoY = (pageHeight - logoHeight) / 2;

    // Add watermark with reduced opacity
    const originalGState = (doc as any).getGState();
    (doc as any).setGState((doc as any).addGState({
      opacity: 0.1
    }));
    doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);
    (doc as any).setGState(originalGState);
  } catch (error) {
    console.error('Error adding watermark:', error);
  }

  // Helper function to add header
  const addHeader = (pageNum: number) => {
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
    doc.text(`Freedom2Operate Search Report | Page ${pageNum} of ${totalPages}`, pageWidth / 2, pageHeight - margin, { align: 'center' });
    doc.setTextColor(0, 0, 0);
  };

  // Add header and footer to all pages
  const addHeadersAndFooters = () => {
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      addHeader(i);
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
  yPos += lineHeight;

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
  yPos += lineHeight;

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

  // Add headers and footers before returning
  addHeadersAndFooters();
  
  return doc;
};
