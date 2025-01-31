export type ProjectStatus = 'Draft' | 'Submitted' | 'Pending' | 'In Progress' | 'On Hold' | 'Completed';
export type PaymentStatus = 'Unpaid' | 'Processing' | 'Paid';
export type FormStep = 'Basic Information' | 'Invention Details' | 'Supporting Documents' | 'Review' | 'Payment';
export type NDAStatus = 'pending' | 'signed' | 'expired';

export interface NDAInfo {
  id: string;
  signedAt: Date;
  status: NDAStatus;
  pdfUrl?: string;
  signerName: string;
  signerCompany?: string;
  signerTitle: string;
  version: string;
}

export interface DraftProgress {
  lastModified: Date;
  currentStep: FormStep;
  completedSteps: FormStep[];
  formData: Record<string, any>;
}

export interface Submission {
  ndaInfo?: NDAInfo;
  id: string;
  referenceNumber: string;
  projectName: string;
  inventionTitle: string;
  searchType: 'fto' | 'patentability';
  status: ProjectStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  contactName: string;
  email: string;
  phone: string;
  notes?: string;
  userId: string;
}

export interface ProgressEntry {
  submissionId: string;
  userId: string;
  currentStep: number;
  status: ProjectStatus;
  notes?: string;
  createdAt: Date;
}

export interface Citation {
  id: string;
  patentNumber: string;
  relevantText: string;
  analysis: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Feature {
  id: string;
  description: string;
  citations: Citation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchReport {
  id: string;
  submissionId: string;
  type: 'fto' | 'patentability';
  features: Feature[];
  executiveSummary?: string;
  recommendations?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  status: 'draft' | 'review' | 'final';
}
