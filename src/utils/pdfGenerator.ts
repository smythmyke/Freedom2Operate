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

export const generateSubmissionPDF = (formData: FormData): jsPDF => {
  const doc = new jsPDF();
  let yPos = 20;
  const lineHeight = 7;
  const margin = 20;
  const pageWidth = doc.internal.pageSize.width;
  const maxWidth = pageWidth - 2 * margin;

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
  doc.setFontSize(16);
  doc.text('Project Information', margin, yPos);
  yPos += lineHeight;

  doc.setFontSize(12);
  yPos = addWrappedText(`Project Name: ${formData.projectName}`, yPos);
  yPos = addWrappedText(`Reference Number: ${formData.referenceNumber || 'N/A'}`, yPos);
  yPos = addWrappedText(`Company: ${formData.companyName || 'N/A'}`, yPos);
  yPos = addWrappedText(`Contact: ${formData.contactName}`, yPos);
  yPos = addWrappedText(`Email: ${formData.email}`, yPos);
  yPos = addWrappedText(`Phone: ${formData.phone}`, yPos);
  yPos += lineHeight;

  // Invention Details
  doc.setFontSize(16);
  doc.text('Invention Details', margin, yPos);
  yPos += lineHeight;

  doc.setFontSize(12);
  yPos = addWrappedText(`Title: ${formData.inventionTitle}`, yPos);
  if (formData.technicalField) {
    yPos = addWrappedText(`Technical Field: ${formData.technicalField}`, yPos);
  }

  // Background
  if (formData.background) {
    yPos += lineHeight;
    doc.setFontSize(14);
    doc.text('Background', margin, yPos);
    yPos += lineHeight;
    doc.setFontSize(12);
    yPos = addWrappedText(formData.background, yPos);
  }

  // Check if we need a new page
  if (yPos > doc.internal.pageSize.height - 50) {
    doc.addPage();
    yPos = 20;
  }

  // Description
  yPos += lineHeight;
  doc.setFontSize(14);
  doc.text('Detailed Description', margin, yPos);
  yPos += lineHeight;
  doc.setFontSize(12);
  yPos = addWrappedText(formData.description, yPos);

  // Features
  if (formData.features.some(f => f)) {
    yPos += lineHeight;
    doc.setFontSize(14);
    doc.text('Key Features', margin, yPos);
    yPos += lineHeight;
    doc.setFontSize(12);
    formData.features.forEach((feature, index) => {
      if (feature) {
        yPos = addWrappedText(`${index + 1}. ${feature}`, yPos);
      }
    });
  }

  // Target Markets or Jurisdictions
  if (formData.targetMarkets?.length) {
    yPos += lineHeight;
    doc.setFontSize(14);
    doc.text('Target Markets', margin, yPos);
    yPos += lineHeight;
    doc.setFontSize(12);
    yPos = addWrappedText(formData.targetMarkets.join(', '), yPos);
  }

  if (formData.targetJurisdictions?.length) {
    yPos += lineHeight;
    doc.setFontSize(14);
    doc.text('Target Jurisdictions', margin, yPos);
    yPos += lineHeight;
    doc.setFontSize(12);
    yPos = addWrappedText(formData.targetJurisdictions.join(', '), yPos);
  }

  // Related Patents
  if (formData.relatedPatents?.some(p => p)) {
    yPos += lineHeight;
    doc.setFontSize(14);
    doc.text('Related Patents', margin, yPos);
    yPos += lineHeight;
    doc.setFontSize(12);
    formData.relatedPatents.forEach((patent) => {
      if (patent) {
        yPos = addWrappedText(patent, yPos);
      }
    });
  }

  // Footer
  const timestamp = new Date().toLocaleString();
  doc.setFontSize(10);
  doc.text(`Generated on: ${timestamp}`, margin, doc.internal.pageSize.height - 10);

  return doc;
};
