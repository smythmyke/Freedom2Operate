import sgMail from '@sendgrid/mail';
import { jsPDF } from 'jspdf';

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.REACT_APP_SENDGRID_API_KEY || '');

interface EmailData {
  to: string;
  projectName: string;
  referenceNumber: string;
  pdf: jsPDF;
}

export const sendSubmissionEmail = async (data: EmailData): Promise<void> => {
  const { to, projectName, referenceNumber, pdf } = data;
  const pdfBase64 = pdf.output('datauristring').split(',')[1];

  const msg = {
    to,
    from: process.env.REACT_APP_SENDER_EMAIL || 'noreply@freedom2operate.com',
    subject: `Freedom2Operate Search Request - ${projectName}`,
    text: `Thank you for submitting your Freedom2Operate search request.\n\nProject: ${projectName}\nReference Number: ${referenceNumber}\n\nWe have attached a PDF copy of your submission for your records.\n\nOur team will review your submission and contact you soon.`,
    html: `
      <h2>Freedom2Operate Search Request</h2>
      <p>Thank you for submitting your Freedom2Operate search request.</p>
      <p><strong>Project:</strong> ${projectName}<br>
      <strong>Reference Number:</strong> ${referenceNumber}</p>
      <p>We have attached a PDF copy of your submission for your records.</p>
      <p>Our team will review your submission and contact you soon.</p>
    `,
    attachments: [
      {
        content: pdfBase64,
        filename: `FTO_Request_${referenceNumber}.pdf`,
        type: 'application/pdf',
        disposition: 'attachment'
      }
    ]
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send confirmation email');
  }
};

// Send admin notification
export const sendAdminNotification = async (projectData: {
  projectName: string;
  referenceNumber: string;
  contactName: string;
  email: string;
}): Promise<void> => {
  const msg = {
    to: process.env.REACT_APP_ADMIN_EMAIL || 'admin@freedom2operate.com',
    from: process.env.REACT_APP_SENDER_EMAIL || 'noreply@freedom2operate.com',
    subject: `New FTO Search Request - ${projectData.projectName}`,
    text: `
      New Freedom2Operate search request received.
      
      Project Name: ${projectData.projectName}
      Reference Number: ${projectData.referenceNumber}
      Contact: ${projectData.contactName}
      Email: ${projectData.email}
      
      Please log in to the admin dashboard to review the full submission.
    `,
    html: `
      <h2>New Freedom2Operate Search Request</h2>
      <p>A new search request has been received.</p>
      <p>
        <strong>Project Name:</strong> ${projectData.projectName}<br>
        <strong>Reference Number:</strong> ${projectData.referenceNumber}<br>
        <strong>Contact:</strong> ${projectData.contactName}<br>
        <strong>Email:</strong> ${projectData.email}
      </p>
      <p>Please log in to the admin dashboard to review the full submission.</p>
    `
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error('Error sending admin notification:', error);
    // Don't throw error for admin notification failure
  }
};
