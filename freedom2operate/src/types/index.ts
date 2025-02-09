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

export interface PatentClassification {
  code: string;
  definition: string;
  subgroups?: Array<{
    code: string;
    definition: string;
  }>;
}

export interface SearchScope {
  geographic: GeographicScope;
  temporalRange: {
    startDate: Date;
    endDate: Date;
  };
  classifications: PatentClassification[];
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
  assignmentHistory?: Array<{
    date: Date;
    fromParty: string;
    toParty: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Feature {
  id: string;
  description: string;
  citations: Citation[];
  riskSummary?: {
    overallRisk: RiskLevel;
    keyRisks: string[];
    mitigationStrategies: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface KeyPlayer {
  name: string;
  patentCount: number;
  relevantPortfolio?: string[];
  businessOverview?: string;
  patentingStrategy?: string;
  litigationHistory?: Array<{
    case: string;
    date: Date;
    parties: string[];
    outcome?: string;
  }>;
  geographicCoverage?: string[];
}

export interface MarketAnalysis {
  keyPatentHolders: KeyPlayer[];
  competitiveLandscape: string;
  technologyTrends?: Array<{
    trend: string;
    description: string;
    keyPlayers: string[];
    patentActivity: string;
  }>;
  licensingPrograms?: string[];
  litigationHistory?: Array<{
    case: string;
    date: Date;
    parties: string[];
    outcome?: string;
  }>;
}

export interface SearchIteration {
  iteration: number;
  database: string;
  query: string;
  resultCount: number;
  date: Date;
  refinementReason?: string;
  relevantResults?: number;
}

export interface SearchDocumentation {
  databases: Array<{
    name: string;
    coverageDates: {
      start: Date;
      end: Date;
    };
    limitations?: string[];
  }>;
  searchQueries: SearchIteration[];
  searchStrategy: {
    keywords: string[];
    classifications: PatentClassification[];
    iterations: SearchIteration[];
  };
  totalResultsReviewed: number;
}

export interface ClaimChart {
  patentNumber: string;
  claims: Record<string, {
    text: string;
    analysis: string;
    riskLevel: RiskLevel;
  }>;
}

export interface RiskMitigationStrategy {
  feature: string;
  riskLevel: RiskLevel;
  description: string;
  proposedSolutions: string[];
  estimatedCost?: string;
  timelineEstimate?: string;
  technicalFeasibility: string;
}

export interface SearchReport {
  id: string;
  submissionId: string;
  type: 'fto' | 'patentability';
  examiner?: {
    name: string;
    title: string;
    qualifications?: string[];
  };
  clientReference?: string;
  searchDate: Date;
  features: Feature[];
  executiveSummary?: {
    text: string;
    keyFindings: string[];
    riskSummary: {
      overall: RiskLevel;
      byFeature: Record<string, RiskLevel>;
    };
  };
  considerations?: string;
  methodology?: string;
  searchStrategy?: string;
  searchScope: SearchScope;
  marketAnalysis: MarketAnalysis;
  technologyLandscape?: {
    overview: string;
    trends: string[];
    emergingTechnologies: string[];
  };
  searchDocumentation: SearchDocumentation;
  riskMitigationStrategies?: RiskMitigationStrategy[];
  legalDisclaimers: {
    scopeLimitations: string[];
    assumptions: string[];
    legalCounselRecommendations: string;
    jurisdictionSpecifics?: Record<string, string>;
  };
  appendices: {
    fullPatentList: string[];
    fileHistories?: string[];
    claimCharts?: ClaimChart[];
    technicalDocumentation?: string[];
    searchIterationDetails?: SearchIteration[];
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  status: 'draft' | 'review' | 'final';
}
