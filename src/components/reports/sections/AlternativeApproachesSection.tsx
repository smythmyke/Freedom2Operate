import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { AlternativeApproach } from '../../../types';

interface AlternativeApproachesSectionProps {
  approaches: AlternativeApproach[];
  onUpdate: (approaches: AlternativeApproach[]) => void;
  disabled?: boolean;
}

interface ApproachDialogState {
  open: boolean;
  editingApproach: AlternativeApproach | null;
  index: number;
}

export const AlternativeApproachesSection: React.FC<AlternativeApproachesSectionProps> = ({
  approaches,
  onUpdate,
  disabled = false,
}) => {
  const [approachDialog, setApproachDialog] = useState<ApproachDialogState>({
    open: false,
    editingApproach: null,
    index: -1,
  });

  const handleSaveApproach = (approach: AlternativeApproach) => {
    const newApproaches = [...approaches];
    if (approachDialog.index === -1) {
      newApproaches.push(approach);
    } else {
      newApproaches[approachDialog.index] = approach;
    }
    onUpdate(newApproaches);
    setApproachDialog({ open: false, editingApproach: null, index: -1 });
  };

  const handleDeleteApproach = (index: number) => {
    const newApproaches = approaches.filter((_, i) => i !== index);
    onUpdate(newApproaches);
  };

  const getTypeLabel = (type: AlternativeApproach['type']) => {
    switch (type) {
      case 'design-around':
        return 'Design Around';
      case 'technical-alternative':
        return 'Technical Alternative';
      case 'risk-reduction':
        return 'Risk Reduction';
      default:
        return type;
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Alternative Approaches</Typography>
        {!disabled && (
          <Button
            startIcon={<AddIcon />}
            onClick={() => setApproachDialog({
              open: true,
              editingApproach: null,
              index: -1,
            })}
          >
            Add Approach
          </Button>
        )}
      </Box>

      <Grid container spacing={2}>
        {approaches.map((approach, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" gutterBottom>
                    {getTypeLabel(approach.type)}
                  </Typography>
                </Box>
                <Typography variant="body1" paragraph>
                  {approach.description}
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  Feasibility: {approach.feasibility}
                </Typography>
                {approach.estimatedCost && (
                  <Typography variant="body2" color="textSecondary">
                    Estimated Cost: {approach.estimatedCost}
                  </Typography>
                )}
                {approach.timeToImplement && (
                  <Typography variant="body2" color="textSecondary">
                    Implementation Time: {approach.timeToImplement}
                  </Typography>
                )}
              </CardContent>
              {!disabled && (
                <CardActions>
                  <IconButton
                    size="small"
                    onClick={() => setApproachDialog({
                      open: true,
                      editingApproach: approach,
                      index,
                    })}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteApproach(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog
        open={approachDialog.open}
        onClose={() => setApproachDialog({ open: false, editingApproach: null, index: -1 })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {approachDialog.editingApproach ? 'Edit Approach' : 'Add Approach'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'grid', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                defaultValue={approachDialog.editingApproach?.type || 'design-around'}
                label="Type"
              >
                <MenuItem value="design-around">Design Around</MenuItem>
                <MenuItem value="technical-alternative">Technical Alternative</MenuItem>
                <MenuItem value="risk-reduction">Risk Reduction</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              defaultValue={approachDialog.editingApproach?.description || ''}
              placeholder="Describe the alternative approach..."
            />
            <TextField
              fullWidth
              label="Feasibility"
              defaultValue={approachDialog.editingApproach?.feasibility || ''}
              placeholder="Assess the feasibility..."
            />
            <TextField
              fullWidth
              label="Estimated Cost"
              defaultValue={approachDialog.editingApproach?.estimatedCost || ''}
              placeholder="Enter estimated cost (optional)..."
            />
            <TextField
              fullWidth
              label="Implementation Time"
              defaultValue={approachDialog.editingApproach?.timeToImplement || ''}
              placeholder="Enter implementation timeline (optional)..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproachDialog({ open: false, editingApproach: null, index: -1 })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              const dialogContent = document.querySelector('.MuiDialogContent-root');
              if (!dialogContent) return;

              const type = (dialogContent.querySelector('select') as HTMLSelectElement).value as AlternativeApproach['type'];
              const inputs = dialogContent.querySelectorAll('textarea, input[type="text"]');
              const [description, feasibility, estimatedCost, timeToImplement] = Array.from(inputs).map(
                (input: Element) => (input as HTMLInputElement | HTMLTextAreaElement).value
              );

              handleSaveApproach({
                type,
                description,
                feasibility,
                estimatedCost: estimatedCost || undefined,
                timeToImplement: timeToImplement || undefined,
              });
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AlternativeApproachesSection;
