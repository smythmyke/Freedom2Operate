import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  Chip,
} from '@mui/material';
import { Feature } from '../../../types';

interface ConsiderationsSectionProps {
  features: Feature[];
  considerations: string;
  onUpdate: (considerations: string) => void;
  disabled?: boolean;
}

const ConsiderationsSection: React.FC<ConsiderationsSectionProps> = ({
  features,
  considerations,
  onUpdate,
  disabled = false,
}) => {
  // Calculate overall risk level based on feature citations
  const calculateOverallRisk = () => {
    let highRiskCount = 0;
    let mediumRiskCount = 0;
    let totalCitations = 0;

    features.forEach(feature => {
      feature.citations.forEach(citation => {
        totalCitations++;
        if (citation.riskLevel === 'High') highRiskCount++;
        if (citation.riskLevel === 'Medium') mediumRiskCount++;
      });
    });

    if (totalCitations === 0) return 'Not Assessed';
    if (highRiskCount > 0) return 'High';
    if (mediumRiskCount > 0) return 'Medium';
    return 'Low';
  };

  // Get risk summary for each feature
  const getFeatureRisks = () => {
    return features.map(feature => {
      const highRisk = feature.citations.filter(c => c.riskLevel === 'High').length;
      const mediumRisk = feature.citations.filter(c => c.riskLevel === 'Medium').length;
      const lowRisk = feature.citations.filter(c => c.riskLevel === 'Low').length;

      let riskLevel = 'Low';
      if (highRisk > 0) riskLevel = 'High';
      else if (mediumRisk > 0) riskLevel = 'Medium';

      return {
        description: feature.description,
        riskLevel,
        citations: feature.citations.length,
        breakdown: { high: highRisk, medium: mediumRisk, low: lowRisk }
      };
    });
  };

  const overallRisk = calculateOverallRisk();
  const featureRisks = getFeatureRisks();

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Points for Consideration</Typography>

      <Grid container spacing={3}>
        {/* Overall Risk Assessment */}
        <Grid item xs={12}>
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>Overall Risk Assessment</Typography>
            <Chip
              label={overallRisk}
              color={
                overallRisk === 'High' ? 'error' :
                overallRisk === 'Medium' ? 'warning' :
                overallRisk === 'Low' ? 'success' :
                'default'
              }
            />
          </Box>
        </Grid>

        {/* Feature Risk Summary */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>Feature Risk Summary</Typography>
          <Box display="flex" flexDirection="column" gap={1}>
            {featureRisks.map((feature, index) => (
              <Box
                key={index}
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">{feature.description}</Typography>
                  <Chip
                    size="small"
                    label={feature.riskLevel}
                    color={
                      feature.riskLevel === 'High' ? 'error' :
                      feature.riskLevel === 'Medium' ? 'warning' :
                      'success'
                    }
                  />
                </Box>
                <Box display="flex" gap={1}>
                  {feature.breakdown.high > 0 && (
                    <Chip
                      size="small"
                      label={`${feature.breakdown.high} High Risk`}
                      color="error"
                      variant="outlined"
                    />
                  )}
                  {feature.breakdown.medium > 0 && (
                    <Chip
                      size="small"
                      label={`${feature.breakdown.medium} Medium Risk`}
                      color="warning"
                      variant="outlined"
                    />
                  )}
                  {feature.breakdown.low > 0 && (
                    <Chip
                      size="small"
                      label={`${feature.breakdown.low} Low Risk`}
                      color="success"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Grid>

        {/* Considerations Text */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>Points to Consider</Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            disabled={disabled}
            value={considerations}
            onChange={(e) => onUpdate(e.target.value)}
            placeholder="List points to consider based on the search findings..."
            variant="outlined"
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ConsiderationsSection;
