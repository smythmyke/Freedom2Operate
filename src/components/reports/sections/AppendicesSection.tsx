import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
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
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

interface AppendicesSectionProps {
  appendices: {
    fullPatentList: string[];
    fileHistories?: string[];
    claimCharts?: Array<{
      patentNumber: string;
      claims: Record<string, string>; // claim number -> analysis
    }>;
    technicalDocumentation?: string[];
  };
  onUpdate: (updates: Partial<{
    fullPatentList: string[];
    fileHistories?: string[];
    claimCharts?: Array<{
      patentNumber: string;
      claims: Record<string, string>;
    }>;
    technicalDocumentation?: string[];
  }>) => void;
  disabled?: boolean;
}

interface ClaimChartDialogState {
  open: boolean;
  editingChart: {
    patentNumber: string;
    claims: Record<string, string>;
  } | null;
  index: number;
}

export const AppendicesSection: React.FC<AppendicesSectionProps> = ({
  appendices,
  onUpdate,
  disabled = false,
}) => {
  const [claimChartDialog, setClaimChartDialog] = useState<ClaimChartDialogState>({
    open: false,
    editingChart: null,
    index: -1,
  });

  const handleSaveClaimChart = (chart: typeof claimChartDialog.editingChart) => {
    if (!chart) return;

    const newCharts = [...(appendices.claimCharts || [])];
    if (claimChartDialog.index === -1) {
      newCharts.push(chart);
    } else {
      newCharts[claimChartDialog.index] = chart;
    }

    onUpdate({ claimCharts: newCharts });
    setClaimChartDialog({ open: false, editingChart: null, index: -1 });
  };

  const handleDeleteClaimChart = (index: number) => {
    const newCharts = appendices.claimCharts?.filter((_, i) => i !== index);
    onUpdate({ claimCharts: newCharts });
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Appendices</Typography>

      <Grid container spacing={3}>
        {/* Full Patent List */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>Full Patent List</Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            disabled={disabled}
            value={appendices.fullPatentList.join('\n')}
            onChange={(e) => onUpdate({
              fullPatentList: e.target.value.split('\n').filter(Boolean),
            })}
            placeholder="Enter patent numbers (one per line)..."
            helperText="List all patents reviewed during the search"
          />
        </Grid>

        {/* File Histories */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>File Histories</Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            disabled={disabled}
            value={appendices.fileHistories?.join('\n') || ''}
            onChange={(e) => onUpdate({
              fileHistories: e.target.value.split('\n').filter(Boolean),
            })}
            placeholder="Enter file history references (one per line)..."
            helperText="List relevant file histories reviewed"
          />
        </Grid>

        {/* Claim Charts */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1">Claim Charts</Typography>
            {!disabled && (
              <Button
                startIcon={<AddIcon />}
                onClick={() => setClaimChartDialog({
                  open: true,
                  editingChart: null,
                  index: -1,
                })}
              >
                Add Claim Chart
              </Button>
            )}
          </Box>
          <Grid container spacing={2}>
            {appendices.claimCharts?.map((chart, index) => (
              <Grid item xs={12} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Patent: {chart.patentNumber}
                    </Typography>
                    {Object.entries(chart.claims).map(([claimNumber, analysis]) => (
                      <Box key={claimNumber} mb={2}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Claim {claimNumber}
                        </Typography>
                        <Typography variant="body2">{analysis}</Typography>
                      </Box>
                    ))}
                  </CardContent>
                  {!disabled && (
                    <CardActions>
                      <IconButton
                        size="small"
                        onClick={() => setClaimChartDialog({
                          open: true,
                          editingChart: chart,
                          index,
                        })}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClaimChart(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Technical Documentation */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>Technical Documentation</Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            disabled={disabled}
            value={appendices.technicalDocumentation?.join('\n') || ''}
            onChange={(e) => onUpdate({
              technicalDocumentation: e.target.value.split('\n').filter(Boolean),
            })}
            placeholder="Enter technical documentation references (one per line)..."
            helperText="List supporting technical documentation"
          />
        </Grid>
      </Grid>

      {/* Claim Chart Dialog */}
      <Dialog
        open={claimChartDialog.open}
        onClose={() => setClaimChartDialog({ open: false, editingChart: null, index: -1 })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {claimChartDialog.editingChart ? 'Edit Claim Chart' : 'Add Claim Chart'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'grid', gap: 2 }}>
            <TextField
              fullWidth
              label="Patent Number"
              defaultValue={claimChartDialog.editingChart?.patentNumber || ''}
              placeholder="Enter patent number..."
            />
            <Box sx={{ display: 'grid', gap: 2 }} id="claims-container">
              {claimChartDialog.editingChart ? (
                Object.entries(claimChartDialog.editingChart.claims).map(([number, analysis]) => (
                  <Box key={number} sx={{ display: 'grid', gap: 1 }}>
                    <TextField
                      label="Claim Number"
                      size="small"
                      defaultValue={number}
                    />
                    <TextField
                      multiline
                      rows={3}
                      label="Analysis"
                      defaultValue={analysis}
                    />
                  </Box>
                ))
              ) : (
                <Box sx={{ display: 'grid', gap: 1 }}>
                  <TextField
                    label="Claim Number"
                    size="small"
                  />
                  <TextField
                    multiline
                    rows={3}
                    label="Analysis"
                  />
                </Box>
              )}
            </Box>
            <Button
              startIcon={<AddIcon />}
              onClick={() => {
                const container = document.getElementById('claims-container');
                if (!container) return;

                const newClaimBox = document.createElement('div');
                newClaimBox.style.display = 'grid';
                newClaimBox.style.gap = '8px';
                newClaimBox.innerHTML = `
                  <div style="margin-top: 16px">
                    <div class="MuiFormControl-root MuiTextField-root" style="width: 100%">
                      <label class="MuiFormLabel-root MuiInputLabel-root MuiInputLabel-formControl MuiInputLabel-animated MuiInputLabel-sizeSmall">
                        Claim Number
                      </label>
                      <div class="MuiInputBase-root MuiOutlinedInput-root MuiInputBase-formControl MuiInputBase-sizeSmall">
                        <input type="text" class="MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputSizeSmall" />
                      </div>
                    </div>
                    <div class="MuiFormControl-root MuiTextField-root" style="width: 100%; margin-top: 8px">
                      <label class="MuiFormLabel-root MuiInputLabel-root MuiInputLabel-formControl MuiInputLabel-animated">
                        Analysis
                      </label>
                      <div class="MuiInputBase-root MuiOutlinedInput-root MuiInputBase-formControl MuiInputBase-multiline">
                        <textarea rows="3" class="MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputMultiline"></textarea>
                      </div>
                    </div>
                  </div>
                `;
                container.appendChild(newClaimBox);
              }}
            >
              Add Claim
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClaimChartDialog({ open: false, editingChart: null, index: -1 })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              const dialogContent = document.querySelector('.MuiDialogContent-root');
              if (!dialogContent) return;

              const patentNumber = (dialogContent.querySelector('input') as HTMLInputElement).value;
              const claimBoxes = dialogContent.querySelectorAll('#claims-container > div');
              
              const claims: Record<string, string> = {};
              claimBoxes.forEach((box) => {
                const inputs = box.querySelectorAll('input, textarea');
                const [number, analysis] = Array.from(inputs).map(
                  (input: Element) => (input as HTMLInputElement | HTMLTextAreaElement).value
                );
                if (number && analysis) {
                  claims[number] = analysis;
                }
              });

              handleSaveClaimChart({
                patentNumber,
                claims,
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

export default AppendicesSection;
