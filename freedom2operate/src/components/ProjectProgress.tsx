import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Divider,
  Stack,
} from '@mui/material';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { sendStatusChangeEmail } from '../utils/emailService';

interface ProjectProgressProps {
  status: string;
  notes?: string;
  loading?: boolean;
  referenceNumber?: string;
}

export type ProjectStatus = 'Draft' | 'Submitted' | 'Pending Review' | 'In Progress' | 'On Hold' | 'Completed';

interface StatusUpdate {
  status: ProjectStatus;
  timestamp: Date;
  notes?: string;
  estimatedCompletion?: string;
}

const steps = {
  'Draft': -1,
  'Submitted': 0,
  'Pending Review': 0,
  'In Progress': 1,
  'On Hold': 1,
  'Completed': 5
};

const progressSteps = [
  'Submission Received',
  'Initial Review',
  'Technical Analysis',
  'Report Generation',
  'Final Review',
  'Completed'
];

const getStatusColor = (status: ProjectStatus) => {
  switch (status) {
    case 'Completed':
      return 'success';
    case 'In Progress':
      return 'primary';
    case 'On Hold':
      return 'warning';
    case 'Pending Review':
      return 'info';
    default:
      return 'default';
  }
};

const ProjectProgress: React.FC<ProjectProgressProps> = ({
  status = 'Draft',
  notes,
  loading = false,
  referenceNumber
}) => {
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([]);
  const { currentUser, userProfile } = useAuth();
  useEffect(() => {
    if (!currentUser || !userProfile || !referenceNumber) return;

    // Subscribe to status updates
    const updatesQuery = query(
      collection(db, 'statusUpdates'),
      where('referenceNumber', '==', referenceNumber),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(updatesQuery, (snapshot) => {
      const updates: StatusUpdate[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        updates.push({
          status: data.status,
          timestamp: data.timestamp.toDate(),
          notes: data.notes,
          estimatedCompletion: data.estimatedCompletion
        });
      });
      setStatusUpdates(updates);

      // Send email notification for new status changes
      if (updates.length > 0 && updates[0].status !== status) {
        sendStatusChangeEmail({
          to: currentUser.email!,
          projectName: 'Your Project', // You might want to pass this as a prop
          referenceNumber: referenceNumber,
          oldStatus: status,
          newStatus: updates[0].status,
          notes: updates[0].notes,
          estimatedCompletion: updates[0].estimatedCompletion
        }).catch(console.error);
      }
    });

    return () => unsubscribe();
  }, [currentUser, referenceNumber, status]);

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
          color={getStatusColor(status as ProjectStatus)}
        />
      </Box>
      
      <Stepper activeStep={steps[status as ProjectStatus]} alternativeLabel>
        {progressSteps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {statusUpdates.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Status History
          </Typography>
          <Stack spacing={2}>
            {statusUpdates.map((update, index) => (
              <Card key={index} variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: `${getStatusColor(update.status)}.main`,
                        mr: 1,
                      }}
                    />
                    <Typography variant="subtitle2">
                      {update.status}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                      {update.timestamp.toLocaleString()}
                    </Typography>
                  </Box>
                  {update.notes && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2">
                        {update.notes}
                      </Typography>
                    </>
                  )}
                  {update.estimatedCompletion && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Estimated completion: {update.estimatedCompletion}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
      )}
      
      {notes && !statusUpdates.length && (
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
