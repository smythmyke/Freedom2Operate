import { jsPDF } from 'jspdf';

interface NDAPDFData {
  signerName: string;
  signerCompany?: string;
  signerTitle: string;
  signedAt: Date;
  version: string;
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
      title: '1. Purpose',
      content: 'The purpose of this Agreement is to protect the confidential information related to the invention, patent search, and any associated intellectual property that the Disclosing Party shares with Freedom2Operate for the purpose of conducting a Freedom to Operate (FTO) search.'
    },
    {
      title: '2. Definitions',
      content: '"Invention" shall mean all information relating to business programs, products, applications, systems, components, technologies and business topics.\n\n"Confidential Information" shall mean all information provided by Disclosing Party with respect to the Invention regardless of whether it is written, oral, audio tapes, video tapes, computer discs, machines, prototypes, designs, specifications, articles of manufacture, drawings, human or machine-readable documents.'
    },
    {
      title: '3. Use of Confidential Information',
      content: 'Freedom2Operate agrees to:\n• Receive and maintain the Confidential Information in confidence\n• Examine the Confidential Information at its own expense\n• Not reproduce the Confidential Information without express written consent\n• Not disclose the Confidential Information to any person, firm, or corporation\n• Limit internal dissemination to employees with a need to know\n• Not use the Confidential Information without express written consent'
    },
    {
      title: '4. Return of Information',
      content: 'All Confidential Information shall remain the property of the Disclosing Party. Freedom2Operate agrees to return all Confidential Information within 5 days of written demand, without retaining any copies.'
    },
    {
      title: '5. Term',
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

  // Version and metadata
  pdf.setFontSize(8);
  pdf.text(`Version: ${data.version}`, 20, 280);
  pdf.text('This document is electronically generated and signed.', 20, 285);

  return pdf;
};
