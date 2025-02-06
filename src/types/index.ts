export type ProjectStatus = 'Draft' | 'Submitted' | 'Pending Review' | 'Pending' | 'In Progress' | 'On Hold' | 'Completed';
export type PaymentStatus = 'Unpaid' | 'Pending Review' | 'Processing' | 'Paid';
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
  features?: string[];
}

export interface ProgressEntry {
  submissionId: string;
  userId: string;
  currentStep: number;
  status: ProjectStatus;
  notes?: string;
  createdAt: Date;
}

export type RiskLevel = 'High' | 'Medium' | 'Low';
export type GeographicScope = string[]; // Array of country codes

export interface SearchScope {
  geographic: GeographicScope;
  temporalRange: {
    startDate: Date;
    endDate: Date;
  };
  classifications: string[]; // IPC/CPC codes
  exclusions?: string[];
}

export interface Citation {
  id: string;
  patentNumber: string;
  relevantText: string;
  analysis: string;
  publicationDate: Date;
  priorityDate: Date;
  patentFamily: string[];
  legalStatus: string;
  assignee: string;
  claimsReferenced: string[];
  figuresReferenced: string[];
  riskLevel: RiskLevel;
  expirationDate?: Date;
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

export interface MarketAnalysis {
  keyPatentHolders: Array<{
    name: string;
    patentCount: number;
    relevantPortfolio?: string[];
  }>;
  competitiveLandscape: string;
  licensingPrograms?: string[];
  litigationHistory?: Array<{
    case: string;
    date: Date;
    parties: string[];
    outcome?: string;
  }>;
}

export interface AlternativeApproach {
  description: string;
  type: 'design-around' | 'technical-alternative' | 'risk-reduction';
  feasibility: string;
  estimatedCost?: string;
  timeToImplement?: string;
}

export interface SearchDocumentation {
  databases: string[];
  searchQueries: Array<{
    query: string;
    database: string;
    resultCount: number;
    date: Date;
  }>;
  totalResultsReviewed: number;
}

export interface SearchReport {
  id: string;
  submissionId: string;
  type: 'fto' | 'patentability';
  features: Feature[];
  executiveSummary?: string;
  recommendations?: string;
  methodology?: string;
  searchStrategy?: string;
  searchScope: SearchScope;
  marketAnalysis: MarketAnalysis;
  alternativeApproaches: AlternativeApproach[];
  searchDocumentation: SearchDocumentation;
  legalDisclaimers: {
    scopeLimitations: string[];
    assumptions: string[];
    legalCounselRecommendations: string;
  };
  appendices: {
    fullPatentList: string[];
    fileHistories?: string[];
    claimCharts?: Array<{
      patentNumber: string;
      claims: Record<string, string>; // claim number -> analysis
    }>;
    technicalDocumentation?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  status: 'draft' | 'review' | 'final';
}
