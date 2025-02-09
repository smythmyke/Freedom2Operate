import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Chip,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { SearchScope, PatentClassification } from '../../../types';

interface SearchScopeSectionProps {
  scope: SearchScope;
  onUpdate: (updates: Partial<SearchScope>) => void;
  disabled?: boolean;
}

export const SearchScopeSection: React.FC<SearchScopeSectionProps> = ({
  scope,
  onUpdate,
  disabled = false,
}) => {
  const handleAddCountry = (country: string) => {
    if (!country.trim()) return;
    onUpdate({
      geographic: [...scope.geographic, country.trim().toUpperCase()],
    });
  };

  const handleAddClassification = (input: string) => {
    if (!input.trim()) return;
    const [code, ...defParts] = input.trim().split('-');
    const definition = defParts.join('-').trim();
    if (!code || !definition) return;
    
    const newClassification: PatentClassification = {
      code: code.trim().toUpperCase(),
      definition: definition
    };
    
    onUpdate({
      classifications: [...scope.classifications, newClassification],
    });
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Search Scope</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>Geographic Scope</Typography>
          <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
            {scope.geographic.map((country) => (
              <Chip
                key={country}
                label={country}
                onDelete={disabled ? undefined : () => {
                  onUpdate({
                    geographic: scope.geographic.filter((c) => c !== country),
                  });
                }}
              />
            ))}
          </Box>
          {!disabled && (
            <TextField
              size="small"
              placeholder="Add country (e.g., US, EP, CN)"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const input = e.target as HTMLInputElement;
                  handleAddCountry(input.value);
                  input.value = '';
                }
              }}
            />
          )}
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>Temporal Range</Typography>
          <Box display="flex" gap={2}>
            <DatePicker
              label="Start Date"
              value={scope.temporalRange.startDate}
              disabled={disabled}
              onChange={(date) => {
                if (date) {
                  onUpdate({
                    temporalRange: {
                      ...scope.temporalRange,
                      startDate: date,
                    },
                  });
                }
              }}
            />
            <DatePicker
              label="End Date"
              value={scope.temporalRange.endDate}
              disabled={disabled}
              onChange={(date) => {
                if (date) {
                  onUpdate({
                    temporalRange: {
                      ...scope.temporalRange,
                      endDate: date,
                    },
                  });
                }
              }}
            />
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>Classifications</Typography>
          <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
            {scope.classifications.map((classification) => (
              <Chip
                key={classification.code}
                label={`${classification.code} - ${classification.definition}`}
                onDelete={disabled ? undefined : () => {
                  onUpdate({
                    classifications: scope.classifications.filter(
                      (c) => c.code !== classification.code
                    ),
                  });
                }}
              />
            ))}
          </Box>
          {!disabled && (
            <TextField
              size="small"
              placeholder="Add IPC/CPC code - definition (e.g., A01G25/16 - Control of watering)"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const input = e.target as HTMLInputElement;
                  handleAddClassification(input.value);
                  input.value = '';
                }
              }}
            />
          )}
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>Exclusions</Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            disabled={disabled}
            value={scope.exclusions?.join('\n') || ''}
            onChange={(e) => {
              onUpdate({
                exclusions: e.target.value.split('\n').filter(Boolean),
              });
            }}
            placeholder="Enter exclusions (one per line)"
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SearchScopeSection;
