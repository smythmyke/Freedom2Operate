import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  SearchReport,
  Feature,
  Submission,
  RiskLevel
} from '../../types';
import styles from './SearchReportTemplate.module.css';

// Import section components
import SearchScopeSection from './sections/SearchScopeSection';
import MarketAnalysisSection from './sections/MarketAnalysisSection';
import SearchDocumentationSection from './sections/SearchDocumentationSection';
import LegalDisclaimersSection from './sections/LegalDisclaimersSection';
import AppendicesSection from './sections/AppendicesSection';
import FeatureAnalysisSection from './sections/FeatureAnalysisSection';
import ConsiderationsSection from './sections/ConsiderationsSection';

interface SearchReportTemplateProps {
  submissionId: string;
  initialData?: SearchReport;
  readOnly?: boolean;
}

const SearchReportTemplate: React.FC<SearchReportTemplateProps> = ({ 
  submissionId,
  initialData,
  readOnly = false
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [report, setReport] = useState<SearchReport | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (initialData) {
          setReport(initialData);
          // For sample reports, we don't need actual submission data
          setSubmission({
            id: initialData.submissionId,
            referenceNumber: 'SAMPLE-001',
            projectName: 'Sample Project',
            inventionTitle: 'Smart Irrigation Control System',
            searchType: initialData.type,
            status: 'Completed',
            paymentStatus: 'Paid',
            createdAt: initialData.createdAt.toISOString(),
            contactName: 'John Doe',
            email: 'john@example.com',
            phone: '555-0123',
            userId: 'sample-user'
          });
          setLoading(false);
          return;
        }

        // Load submission data
        const submissionDoc = await getDoc(doc(db, 'submissions', submissionId));
        if (!submissionDoc.exists()) {
          throw new Error('Submission not found');
        }
        const submissionData = submissionDoc.data() as Submission;
        setSubmission(submissionData);

        // Load or create report
        const reportDoc = await getDoc(doc(db, 'reports', submissionId));
        if (reportDoc.exists()) {
          setReport(reportDoc.data() as SearchReport);
        } else {
          // Create new report with features from submission if available
          const features: Feature[] = submissionData.features?.map((feature: string) => ({
            id: uuidv4(),
            description: feature,
            citations: [],
            riskSummary: {
              overallRisk: 'Low' as RiskLevel,
              keyRisks: [],
              mitigationStrategies: []
            },
            createdAt: new Date(),
            updatedAt: new Date()
          })) || [];

          const newReport: SearchReport = {
            id: submissionId,
            submissionId,
            type: submissionData.searchType,
            features,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'admin', // TODO: Get from auth context
            status: 'draft',
            searchDate: new Date(),
            examiner: {
              name: 'Pending Assignment',
              title: 'F2O Search Analyst',
              qualifications: []
            },
            clientReference: '',
            executiveSummary: {
              text: '',
              keyFindings: [],
              riskSummary: {
                overall: 'Low' as RiskLevel,
                byFeature: {}
              }
            },
            methodology: '',
            searchStrategy: '',
            searchScope: {
              geographic: [],
              temporalRange: {
                startDate: new Date(),
                endDate: new Date(),
              },
              classifications: [],
            },
            marketAnalysis: {
              keyPatentHolders: [],
              competitiveLandscape: '',
              technologyTrends: []
            },
            technologyLandscape: {
              overview: '',
              trends: [],
              emergingTechnologies: []
            },
            searchDocumentation: {
              databases: [],
              searchQueries: [],
              searchStrategy: {
                keywords: [],
                classifications: [],
                iterations: []
              },
              totalResultsReviewed: 0,
            },
            riskMitigationStrategies: [],
            legalDisclaimers: {
              scopeLimitations: [],
              assumptions: [],
              legalCounselRecommendations: '',
              jurisdictionSpecifics: {}
            },
            appendices: {
              fullPatentList: [],
              claimCharts: [],
              searchIterationDetails: []
            },
          };
          await setDoc(doc(db, 'reports', submissionId), newReport);
          setReport(newReport);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [submissionId]);

  const updateReport = async (updates: Partial<SearchReport>) => {
    if (!report) return;

    // Skip Firestore updates for sample reports
    if (!initialData) {
      await updateDoc(doc(db, 'reports', submissionId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    }

    setReport({
      ...report,
      ...updates,
      updatedAt: new Date()
    });
  };

  const updateExaminer = (updates: Partial<{ name: string; title: string; qualifications: string[] }>) => {
    if (!report?.examiner) return;
    updateReport({
      examiner: {
        ...report.examiner,
        ...updates,
        name: updates.name || report.examiner.name,
        title: updates.title || report.examiner.title,
        qualifications: updates.qualifications || report.examiner.qualifications
      }
    });
  };

  const updateExecutiveSummary = (updates: Partial<{
    text: string;
    keyFindings: string[];
    riskSummary: { overall: RiskLevel; byFeature: Record<string, RiskLevel> };
  }>) => {
    if (!report?.executiveSummary) return;
    updateReport({
      executiveSummary: {
        ...report.executiveSummary,
        ...updates,
        keyFindings: updates.keyFindings || report.executiveSummary.keyFindings,
        riskSummary: updates.riskSummary || report.executiveSummary.riskSummary
      }
    });
  };

  const updateTechnologyLandscape = (updates: Partial<{
    overview: string;
    trends: string[];
    emergingTechnologies: string[];
  }>) => {
    if (!report?.technologyLandscape) return;
    updateReport({
      technologyLandscape: {
        ...report.technologyLandscape,
        ...updates,
        trends: updates.trends || report.technologyLandscape.trends,
        emergingTechnologies: updates.emergingTechnologies || report.technologyLandscape.emergingTechnologies
      }
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!submission || !report) {
    return <Alert severity="warning">No data available</Alert>;
  }

  const isDisabled = readOnly || report.status === 'final';

  return (
    <Box className={styles.container} sx={{ height: '100%', overflow: 'auto' }}>
      {/* Header Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">{submission.projectName}</Typography>
          <Chip
            label={report.status.toUpperCase()}
            color={
              report.status === 'final' ? 'success' :
              report.status === 'review' ? 'warning' :
              'default'
            }
          />
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="text.secondary">Reference Number</Typography>
            <Typography variant="body1">{submission.referenceNumber}</Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="text.secondary">Client Reference</Typography>
            <TextField
              fullWidth
              size="small"
              disabled={isDisabled}
              value={report.clientReference || ''}
              onChange={(e) => updateReport({ clientReference: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="text.secondary">Search Type</Typography>
            <Typography variant="body1">{submission.searchType.toUpperCase()}</Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="text.secondary">Search Date</Typography>
            <Typography variant="body1">{report.searchDate?.toLocaleDateString()}</Typography>
          </Grid>
        </Grid>
        
        {/* Examiner Information */}
        <Box mt={2}>
          <Typography variant="subtitle2" color="text.secondary">F2O Search Analyst</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Name"
                disabled={isDisabled}
                value={report.examiner?.name || ''}
                onChange={(e) => updateExaminer({ name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Title"
                disabled={isDisabled}
                value={report.examiner?.title || ''}
                onChange={(e) => updateExaminer({ title: e.target.value })}
              />
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Executive Summary Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Executive Summary</Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          disabled={isDisabled}
          value={report.executiveSummary?.text || ''}
          onChange={(e) => updateExecutiveSummary({ text: e.target.value })}
          placeholder="Provide a high-level overview of the search findings..."
          variant="outlined"
          sx={{ mb: 2 }}
        />

        {/* Key Findings */}
        <Typography variant="subtitle2" gutterBottom>Key Findings</Typography>
        <List dense>
          {report.executiveSummary?.keyFindings?.map((finding, index) => (
            <ListItem key={index}>
              <ListItemText primary={finding} />
            </ListItem>
          ))}
        </List>

        {/* Risk Summary */}
        <Typography variant="subtitle2" gutterBottom>Risk Summary</Typography>
        <Box display="flex" gap={1} mb={1}>
          <Chip
            label={`Overall Risk: ${report.executiveSummary?.riskSummary?.overall || 'Not Assessed'}`}
            color={
              report.executiveSummary?.riskSummary?.overall === 'High' ? 'error' :
              report.executiveSummary?.riskSummary?.overall === 'Medium' ? 'warning' :
              'success'
            }
          />
        </Box>
      </Paper>

      {/* Search Scope Section */}
      <SearchScopeSection
        scope={report.searchScope}
        onUpdate={(updates) => updateReport({ searchScope: { ...report.searchScope, ...updates } })}
        disabled={isDisabled}
      />

      {/* Feature Analysis Section */}
      <FeatureAnalysisSection
        features={report.features}
        onUpdate={(features) => updateReport({ features })}
        disabled={isDisabled}
      />

      {/* Considerations Section */}
      <ConsiderationsSection
        features={report.features}
        considerations={report.considerations || ''}
        onUpdate={(considerations) => updateReport({ considerations })}
        disabled={isDisabled}
      />

      {/* Search Documentation Section */}
      <SearchDocumentationSection
        documentation={report.searchDocumentation}
        onUpdate={(updates) => updateReport({ searchDocumentation: { ...report.searchDocumentation, ...updates } })}
        disabled={isDisabled}
      />

      {/* Market Analysis Section */}
      <MarketAnalysisSection
        analysis={report.marketAnalysis}
        onUpdate={(updates) => updateReport({ marketAnalysis: { ...report.marketAnalysis, ...updates } })}
        disabled={isDisabled}
      />

      {/* Technology Landscape Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Technology Landscape</Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Overview"
          disabled={isDisabled}
          value={report.technologyLandscape?.overview || ''}
          onChange={(e) => updateTechnologyLandscape({ overview: e.target.value })}
          sx={{ mb: 2 }}
        />

        {/* Trends */}
        <Typography variant="subtitle2" gutterBottom>Technology Trends</Typography>
        <List dense>
          {report.technologyLandscape?.trends?.map((trend, index) => (
            <ListItem key={index}>
              <ListItemText primary={trend} />
            </ListItem>
          ))}
        </List>

        {/* Emerging Technologies */}
        <Typography variant="subtitle2" gutterBottom>Emerging Technologies</Typography>
        <List dense>
          {report.technologyLandscape?.emergingTechnologies?.map((tech, index) => (
            <ListItem key={index}>
              <ListItemText primary={tech} />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Risk Mitigation Strategies Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Risk Mitigation Strategies</Typography>
        {report.riskMitigationStrategies?.map((strategy, index) => (
          <Box key={index} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="subtitle1">{strategy.feature}</Typography>
            <Chip
              size="small"
              label={strategy.riskLevel}
              color={
                strategy.riskLevel === 'High' ? 'error' :
                strategy.riskLevel === 'Medium' ? 'warning' :
                'success'
              }
              sx={{ mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary">{strategy.description}</Typography>
            <List dense>
              {strategy.proposedSolutions.map((solution, sIndex) => (
                <ListItem key={sIndex}>
                  <ListItemText primary={solution} />
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
      </Paper>

      {/* Legal Disclaimers Section */}
      <LegalDisclaimersSection
        disclaimers={report.legalDisclaimers}
        onUpdate={(updates) => updateReport({ legalDisclaimers: { ...report.legalDisclaimers, ...updates } })}
        disabled={isDisabled}
      />

      {/* Appendices Section */}
      <AppendicesSection
        appendices={report.appendices}
        onUpdate={(updates) => updateReport({ appendices: { ...report.appendices, ...updates } })}
        disabled={isDisabled}
      />

      {/* Actions */}
      <Box display="flex" justifyContent="flex-end" gap={2}>
        <Button
          variant="outlined"
          onClick={() => updateReport({ status: 'review' })}
          disabled={isDisabled}
        >
          Submit for Review
        </Button>
        <Button
          variant="contained"
          onClick={() => updateReport({ status: 'final' })}
          disabled={isDisabled}
        >
          Finalize Report
        </Button>
      </Box>
    </Box>
  );
};

export default SearchReportTemplate;
