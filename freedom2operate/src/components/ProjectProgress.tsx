import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Chip,
} from '@mui/material';

interface ProjectProgressProps {
  currentStep: number;
  status: string;
  notes?: string;
  loading?: boolean;
}

const steps = [
  'Submission Received',
  'Initial Review',
  'Technical Analysis',
  'Report Generation',
  'Final Review',
  'Completed'
];

const ProjectProgress: React.FC<ProjectProgressProps> = ({
  currentStep,
  status,
  notes,
  loading = false
}) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Project Progress</Typography>
        <Chip
          label={status}
          color={
            status === 'Completed' ? 'success' :
            status === 'In Progress' ? 'primary' :
            status === 'On Hold' ? 'warning' : 'default'
          }
        />
      </Box>
      
      <Stepper activeStep={currentStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {notes && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Latest Update:
          </Typography>
          <Typography variant="body2">
            {notes}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ProjectProgress;
