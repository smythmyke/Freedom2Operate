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
} from '@mui/material';
import {
  SearchReport,
  Feature,
  Submission
} from '../../types';
import styles from './SearchReportTemplate.module.css';

// Import section components
import SearchScopeSection from './sections/SearchScopeSection';
import MarketAnalysisSection from './sections/MarketAnalysisSection';
import AlternativeApproachesSection from './sections/AlternativeApproachesSection';
import SearchDocumentationSection from './sections/SearchDocumentationSection';
import LegalDisclaimersSection from './sections/LegalDisclaimersSection';
import AppendicesSection from './sections/AppendicesSection';

interface SearchReportTemplateProps {
  submissionId: string;
}

const SearchReportTemplate: React.FC<SearchReportTemplateProps> = ({ submissionId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [report, setReport] = useState<SearchReport | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
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
            methodology: '',
            searchStrategy: '',
            // Initialize new required fields
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
            },
            alternativeApproaches: [],
            searchDocumentation: {
              databases: [],
              searchQueries: [],
              totalResultsReviewed: 0,
            },
            legalDisclaimers: {
              scopeLimitations: [],
              assumptions: [],
              legalCounselRecommendations: '',
            },
            appendices: {
              fullPatentList: [],
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

    await updateDoc(doc(db, 'reports', submissionId), {
      ...updates,
      updatedAt: serverTimestamp()
    });

    setReport({
      ...report,
      ...updates
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

  const isDisabled = report.status === 'final';

  return (
    <Box className={styles.container}>
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
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">Reference Number</Typography>
            <Typography variant="body1">{submission.referenceNumber}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">Search Type</Typography>
            <Typography variant="body1">{submission.searchType.toUpperCase()}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">Invention Title</Typography>
            <Typography variant="body1">{submission.inventionTitle}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Executive Summary Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Executive Summary</Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          disabled={isDisabled}
          value={report.executiveSummary || ''}
          onChange={(e) => updateReport({ executiveSummary: e.target.value })}
          placeholder="Provide a high-level overview of the search findings..."
          variant="outlined"
        />
      </Paper>

      {/* Search Scope Section */}
      <SearchScopeSection
        scope={report.searchScope}
        onUpdate={(updates) => updateReport({ searchScope: { ...report.searchScope, ...updates } })}
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

      {/* Alternative Approaches Section */}
      <AlternativeApproachesSection
        approaches={report.alternativeApproaches}
        onUpdate={(approaches) => updateReport({ alternativeApproaches: approaches })}
        disabled={isDisabled}
      />

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
