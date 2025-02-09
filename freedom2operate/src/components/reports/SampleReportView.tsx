import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  Container,
  Alert,
} from '@mui/material';
import { sampleReport } from '../../data/sampleReport';
import SearchReportTemplate from './SearchReportTemplate';

interface SampleReportViewProps {
  onClose?: () => void;
}

const SampleReportView: React.FC<SampleReportViewProps> = ({ onClose }) => {
  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Sample FTO Search Report
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            This is a sample Freedom to Operate (FTO) search report demonstrating the recommended structure and level of detail. Use this as a reference when creating your own reports.
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            This sample report is based on a fictional smart irrigation control system and is provided for illustration purposes only.
          </Alert>
          <Divider sx={{ my: 2 }} />
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              Key Features:
            </Typography>
            <ul>
              <li>Comprehensive feature analysis with risk assessment</li>
              <li>Detailed patent citations and analysis</li>
              <li>Clear recommendations and alternative approaches</li>
              <li>Market analysis and competitive landscape</li>
              <li>Thorough search documentation</li>
            </ul>
          </Box>
          {onClose && (
            <Box display="flex" justifyContent="flex-end">
              <Button onClick={onClose} variant="outlined">
                Close Sample
              </Button>
            </Box>
          )}
        </Paper>

        <Box sx={{ mt: 3 }}>
          <SearchReportTemplate
            submissionId={sampleReport.submissionId}
            initialData={sampleReport}
            readOnly
          />
        </Box>
    </Box>
  );
};

export default SampleReportView;
