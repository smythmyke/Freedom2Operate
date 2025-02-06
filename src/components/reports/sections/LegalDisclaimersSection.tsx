import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
} from '@mui/material';

interface LegalDisclaimersSectionProps {
  disclaimers: {
    scopeLimitations: string[];
    assumptions: string[];
    legalCounselRecommendations: string;
  };
  onUpdate: (updates: Partial<{
    scopeLimitations: string[];
    assumptions: string[];
    legalCounselRecommendations: string;
  }>) => void;
  disabled?: boolean;
}

export const LegalDisclaimersSection: React.FC<LegalDisclaimersSectionProps> = ({
  disclaimers,
  onUpdate,
  disabled = false,
}) => {
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Legal Disclaimers</Typography>

      <Grid container spacing={3}>
        {/* Scope Limitations */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>Scope Limitations</Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            disabled={disabled}
            value={disclaimers.scopeLimitations.join('\n')}
            onChange={(e) => onUpdate({
              scopeLimitations: e.target.value.split('\n').filter(Boolean),
            })}
            placeholder="Enter scope limitations (one per line)..."
            helperText="List any limitations or constraints of the search scope"
          />
        </Grid>

        {/* Assumptions */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>Assumptions</Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            disabled={disabled}
            value={disclaimers.assumptions.join('\n')}
            onChange={(e) => onUpdate({
              assumptions: e.target.value.split('\n').filter(Boolean),
            })}
            placeholder="Enter assumptions made (one per line)..."
            helperText="List any assumptions made during the analysis"
          />
        </Grid>

        {/* Legal Counsel Recommendations */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>Legal Counsel Recommendations</Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            disabled={disabled}
            value={disclaimers.legalCounselRecommendations}
            onChange={(e) => onUpdate({
              legalCounselRecommendations: e.target.value,
            })}
            placeholder="Enter recommendations for legal counsel review..."
            helperText="Provide specific recommendations for legal counsel review"
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default LegalDisclaimersSection;
