import { jsPDF } from "jspdf";
import emailjs from "@emailjs/browser";

// Initialize EmailJS
emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

interface VideoCallFile {
  name: string;
  url: string;
}

export const sendVideoCallRequest = async (data: {
  callType: string[];
  projectReference?: string;
  additionalInfo?: string;
  userEmail: string;
  userName: string;
  files?: VideoCallFile[];
  preferredTime?: string;
  inventionTitle?: string;
  inventionReference?: string;
}): Promise<void> => {
  try {
    const templateParams = {
      user_name: data.userName,
      user_email: data.userEmail,
      call_type: data.callType.join(", "),
      project_reference: data.projectReference || "",
      preferred_time: data.preferredTime || "",
      additional_info: data.additionalInfo || "",
      files: data.files || [],
      invention_title: data.inventionTitle || "",
      invention_reference: data.inventionReference || "",
    };

    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_VIDEOCALL_TEMPLATE_ID,
      templateParams
    );
  } catch (error) {
    console.error("Error sending video call request:", error);
    throw new Error("Failed to send video call request");
  }
};

export const sendSubmissionEmail = async (data: {
  to: string;
  projectName: string;
  referenceNumber: string;
  pdf: jsPDF;
}): Promise<void> => {
  try {
    // Convert PDF to base64
    const pdfBytes = data.pdf.output('blob');
    const reader = new FileReader();
    const base64Promise = new Promise((resolve) => {
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]); // Remove data URI prefix
      };
      reader.readAsDataURL(pdfBytes);
    });
    
    const pdfBase64 = await base64Promise;
    
    const templateParams = {
      to_email: data.to,
      project_name: data.projectName,
      reference_number: data.referenceNumber,
      pdf_attachment: pdfBase64,
      pdf_name: `FTO_Request_${data.referenceNumber}.pdf`
    };

    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_SUBMISSION_TEMPLATE_ID,
      templateParams
    );
  } catch (error) {
    console.error("Error sending submission email:", error);
    throw new Error("Failed to send submission email");
  }
};

export const sendAdminNotification = async (data: {
  projectName: string;
  referenceNumber: string;
  contactName: string;
  email: string;
}): Promise<void> => {
  try {
    const templateParams = {
      project_name: data.projectName,
      reference_number: data.referenceNumber,
      contact_name: data.contactName,
      contact_email: data.email,
      submission_date: new Date().toLocaleDateString()
    };

    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_ADMIN_TEMPLATE_ID,
      templateParams
    );
  } catch (error) {
    console.error("Error sending admin notification:", error);
    throw new Error("Failed to send admin notification");
  }
};
