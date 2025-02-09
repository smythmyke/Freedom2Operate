import { jsPDF } from 'jspdf';

interface NDAPDFData {
  signerName: string;
  signerCompany?: string;
  signerTitle: string;
  signedAt: Date;
  version: string;
  signatureData?: string; // Base64 signature image data
}

export const generateNDAPDF = (data: NDAPDFData) => {
  const pdf = new jsPDF();
  const currentDate = data.signedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Title
  pdf.setFontSize(20);
  pdf.text('NON-DISCLOSURE AGREEMENT', 105, 20, { align: 'center' });

  // Parties
  pdf.setFontSize(12);
  pdf.text(`This Non-Disclosure Agreement (the "Agreement") is entered into on ${currentDate} between:`, 20, 40);
  
  pdf.text('Freedom2Operate, represented by Michael Smith, CEO/Owner ("Recipient")', 20, 55);
  
  pdf.text('and', 20, 70);
  
  const signerInfo = [
    data.signerName,
    data.signerTitle,
    data.signerCompany || ''
  ].filter(Boolean).join(', ') + ' ("Disclosing Party")';
  
  pdf.text(signerInfo, 20, 85);

  // Agreement sections
  const sections = [
    {
      title: 'I. CONFIDENTIAL INFORMATION',
      content: 'A. Freedom2Operate agrees to receive INFORMATION from the Disclosing Party to facilitate possible future business dealings between the parties.\n\nB. Freedom2Operate agrees to receive such INFORMATION and to refrain from copying, disclosing, using, selling, or offering for sale any and all of said INFORMATION, other than at the request of the Disclosing Party. Freedom2Operate agrees to keep confidential and refrain from disclosing any and all of the INFORMATION, and to take all necessary and reasonable steps to prevent unauthorized disclosure or use of any and all of the INFORMATION.\n\nC. Freedom2Operate shall not be liable for disclosure or use of INFORMATION only if, and only to the extent that, said INFORMATION was in the public domain at the time it was disclosed by the Disclosing Party, or was known to and recorded in writing by Freedom2Operate prior to the time of disclosure by the Disclosing Party.\n\nD. This is not an offer for sale or license. No right or license is granted by the Disclosing Party to Freedom2Operate in connection with the technical information or inventions disclosed under this agreement.\n\nE. This Agreement shall remain in force in spite of disclosure of the INFORMATION by the Disclosing Party in the form of patent applications, copyright applications, or other disclosures.'
    },
    {
      title: 'II. RESTRICTIONS',
      content: 'A. Except for the express written consent of the Disclosing Party, Freedom2Operate agrees:\n1. Not to use or disclose to another person or entity any confidential information;\n2. Not to make, or cause to be made, any copies, facsimiles or other reproductions including data files of any documents containing confidential information; and\n3. To use all other reasonable means to maintain the secrecy and confidentiality of the confidential information.\n\nB. Freedom2Operate further agrees, at the request of the Disclosing Party:\n1. To immediately return all items containing confidential information; and\n2. To refrain from using or disclosing to any other person or entity any confidential information.'
    },
    {
      title: 'III. INTELLECTUAL PROPERTY',
      content: 'All intellectual property rights related to the INFORMATION shall remain the sole property of the Disclosing Party. This includes but is not limited to patents, copyrights, trademarks, trade secrets, and any other proprietary rights.'
    },
    {
      title: 'IV. DAMAGES AND SPECIFIC PERFORMANCE',
      content: 'Freedom2Operate agrees that should Freedom2Operate breach any of the promises contained in this Agreement, the Disclosing Party would suffer irreparable harm and would be without adequate remedy at law. The Disclosing Party may obtain injunctive relief, including specific performance of the Agreement, as well as monetary award for damages suffered.'
    },
    {
      title: 'V. GOVERNING LAW',
      content: 'This Agreement shall be governed by, construed, and enforced in accordance with the laws of the State of Texas. Any dispute involving the terms or conditions of this Agreement shall be brought in a Texas State court of competent jurisdiction.'
    },
    {
      title: 'VI. TERM',
      content: 'This Agreement shall remain in effect for a period of five (5) years from the date of signing. The confidentiality obligations shall survive the termination of this Agreement.'
    }
  ];

  let yPos = 100;
  sections.forEach(section => {
    // Check if we need a new page
    if (yPos > 250) {
      pdf.addPage();
      yPos = 20;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.text(section.title, 20, yPos);
    pdf.setFont('helvetica', 'normal');
    
    const lines = pdf.splitTextToSize(section.content, 170);
    pdf.text(lines, 20, yPos + 7);
    
    yPos += 7 + (lines.length * 7) + 10;
  });

  // Signatures
  pdf.addPage();
  pdf.setFont('helvetica', 'bold');
  pdf.text('Signatures', 20, 20);
  pdf.setFont('helvetica', 'normal');

  // Freedom2Operate signature
  pdf.text('For Freedom2Operate:', 20, 40);
  pdf.text('Michael Smith', 20, 50);
  pdf.text('CEO/Owner', 20, 57);
  pdf.text(`Date: ${currentDate}`, 20, 64);

  // Disclosing Party signature
  pdf.text('For Disclosing Party:', 20, 90);
  pdf.text(data.signerName, 20, 100);
  pdf.text(data.signerTitle, 20, 107);
  if (data.signerCompany) {
    pdf.text(data.signerCompany, 20, 114);
  }
  pdf.text(`Date: ${currentDate}`, 20, data.signerCompany ? 121 : 114);

  // Add signature if provided
  if (data.signatureData) {
    const signatureHeight = 20;
    const signatureY = data.signerCompany ? 90 : 83;
    pdf.addImage(data.signatureData, 'PNG', 20, signatureY, 50, signatureHeight);
  }

  // Version and metadata
  pdf.setFontSize(8);
  pdf.text(`Version: ${data.version}`, 20, 280);
  pdf.text('This document is electronically generated and signed.', 20, 285);

  return pdf;
};
