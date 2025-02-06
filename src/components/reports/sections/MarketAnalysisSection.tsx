import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  Card,
  CardContent,
  CardActions,
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
import { MarketAnalysis } from '../../../types';

interface MarketAnalysisSectionProps {
  analysis: MarketAnalysis;
  onUpdate: (updates: Partial<MarketAnalysis>) => void;
  disabled?: boolean;
}

interface PatentHolderDialogState {
  open: boolean;
  editingHolder: {
    name: string;
    patentCount: number;
    relevantPortfolio?: string[];
  } | null;
  index: number;
}

interface LitigationDialogState {
  open: boolean;
  editingCase: {
    case: string;
    date: Date;
    parties: string[];
    outcome?: string;
  } | null;
  index: number;
}

export const MarketAnalysisSection: React.FC<MarketAnalysisSectionProps> = ({
  analysis,
  onUpdate,
  disabled = false,
}) => {
  const [patentHolderDialog, setPatentHolderDialog] = useState<PatentHolderDialogState>({
    open: false,
    editingHolder: null,
    index: -1,
  });

  const [litigationDialog, setLitigationDialog] = useState<LitigationDialogState>({
    open: false,
    editingCase: null,
    index: -1,
  });

  const handleSavePatentHolder = (holder: typeof patentHolderDialog.editingHolder) => {
    if (!holder) return;

    const newHolders = [...analysis.keyPatentHolders];
    if (patentHolderDialog.index === -1) {
      newHolders.push(holder);
    } else {
      newHolders[patentHolderDialog.index] = holder;
    }

    onUpdate({ keyPatentHolders: newHolders });
    setPatentHolderDialog({ open: false, editingHolder: null, index: -1 });
  };

  const handleSaveLitigation = (litigation: typeof litigationDialog.editingCase) => {
    if (!litigation) return;

    const newHistory = [...(analysis.litigationHistory || [])];
    if (litigationDialog.index === -1) {
      newHistory.push(litigation);
    } else {
      newHistory[litigationDialog.index] = litigation;
    }

    onUpdate({ litigationHistory: newHistory });
    setLitigationDialog({ open: false, editingCase: null, index: -1 });
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Market Analysis</Typography>

      <Grid container spacing={3}>
        {/* Key Patent Holders Section */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1">Key Patent Holders</Typography>
            {!disabled && (
              <Button
                startIcon={<AddIcon />}
                onClick={() => setPatentHolderDialog({
                  open: true,
                  editingHolder: null,
                  index: -1,
                })}
              >
                Add Patent Holder
              </Button>
            )}
          </Box>
          <Grid container spacing={2}>
            {analysis.keyPatentHolders.map((holder, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6">{holder.name}</Typography>
                    <Typography color="textSecondary">
                      Patents: {holder.patentCount}
                    </Typography>
                    {holder.relevantPortfolio && holder.relevantPortfolio.length > 0 && (
                      <Box mt={1}>
                        <Typography variant="subtitle2">Relevant Portfolio:</Typography>
                        <Typography variant="body2">
                          {holder.relevantPortfolio.join(', ')}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                  {!disabled && (
                    <CardActions>
                      <IconButton
                        size="small"
                        onClick={() => setPatentHolderDialog({
                          open: true,
                          editingHolder: holder,
                          index,
                        })}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          const newHolders = analysis.keyPatentHolders.filter((_, i) => i !== index);
                          onUpdate({ keyPatentHolders: newHolders });
                        }}
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

        {/* Competitive Landscape Section */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>Competitive Landscape</Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            disabled={disabled}
            value={analysis.competitiveLandscape}
            onChange={(e) => onUpdate({ competitiveLandscape: e.target.value })}
            placeholder="Describe the competitive landscape..."
          />
        </Grid>

        {/* Licensing Programs Section */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>Licensing Programs</Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            disabled={disabled}
            value={analysis.licensingPrograms?.join('\n') || ''}
            onChange={(e) => onUpdate({
              licensingPrograms: e.target.value.split('\n').filter(Boolean)
            })}
            placeholder="Enter known licensing programs (one per line)..."
          />
        </Grid>

        {/* Litigation History Section */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1">Litigation History</Typography>
            {!disabled && (
              <Button
                startIcon={<AddIcon />}
                onClick={() => setLitigationDialog({
                  open: true,
                  editingCase: null,
                  index: -1,
                })}
              >
                Add Litigation Case
              </Button>
            )}
          </Box>
          <Grid container spacing={2}>
            {analysis.litigationHistory?.map((litigation, index) => (
              <Grid item xs={12} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6">{litigation.case}</Typography>
                    <Typography color="textSecondary">
                      Date: {litigation.date.toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2">
                      Parties: {litigation.parties.join(' vs ')}
                    </Typography>
                    {litigation.outcome && (
                      <Typography variant="body2">
                        Outcome: {litigation.outcome}
                      </Typography>
                    )}
                  </CardContent>
                  {!disabled && (
                    <CardActions>
                      <IconButton
                        size="small"
                        onClick={() => setLitigationDialog({
                          open: true,
                          editingCase: litigation,
                          index,
                        })}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          const newHistory = analysis.litigationHistory?.filter((_, i) => i !== index);
                          onUpdate({ litigationHistory: newHistory });
                        }}
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
      </Grid>

      {/* Patent Holder Dialog */}
      <Dialog
        open={patentHolderDialog.open}
        onClose={() => setPatentHolderDialog({ open: false, editingHolder: null, index: -1 })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {patentHolderDialog.editingHolder ? 'Edit Patent Holder' : 'Add Patent Holder'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'grid', gap: 2 }}>
            <TextField
              fullWidth
              label="Company Name"
              defaultValue={patentHolderDialog.editingHolder?.name || ''}
              placeholder="Enter company name..."
            />
            <TextField
              fullWidth
              type="number"
              label="Patent Count"
              defaultValue={patentHolderDialog.editingHolder?.patentCount || ''}
              placeholder="Enter number of patents..."
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Relevant Portfolio"
              defaultValue={patentHolderDialog.editingHolder?.relevantPortfolio?.join('\n') || ''}
              placeholder="Enter relevant patent numbers (one per line)..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPatentHolderDialog({ open: false, editingHolder: null, index: -1 })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              const dialogContent = document.querySelector('.MuiDialogContent-root');
              if (!dialogContent) return;

              const inputs = dialogContent.querySelectorAll('input, textarea');
              const [name, patentCount, portfolio] = Array.from(inputs).map(
                (input: Element) => (input as HTMLInputElement | HTMLTextAreaElement).value
              );

              handleSavePatentHolder({
                name,
                patentCount: parseInt(patentCount, 10) || 0,
                relevantPortfolio: portfolio.split('\n').filter(Boolean),
              });
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Litigation Dialog */}
      <Dialog
        open={litigationDialog.open}
        onClose={() => setLitigationDialog({ open: false, editingCase: null, index: -1 })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {litigationDialog.editingCase ? 'Edit Litigation Case' : 'Add Litigation Case'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'grid', gap: 2 }}>
            <TextField
              fullWidth
              label="Case Reference"
              defaultValue={litigationDialog.editingCase?.case || ''}
              placeholder="Enter case reference..."
            />
            <TextField
              fullWidth
              type="date"
              label="Date"
              defaultValue={litigationDialog.editingCase?.date.toISOString().split('T')[0] || ''}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Parties"
              defaultValue={litigationDialog.editingCase?.parties.join('\n') || ''}
              placeholder="Enter parties (one per line)..."
            />
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Outcome"
              defaultValue={litigationDialog.editingCase?.outcome || ''}
              placeholder="Enter case outcome..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLitigationDialog({ open: false, editingCase: null, index: -1 })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              const dialogContent = document.querySelector('.MuiDialogContent-root');
              if (!dialogContent) return;

              const inputs = dialogContent.querySelectorAll('input, textarea');
              const [caseRef, date, parties, outcome] = Array.from(inputs).map(
                (input: Element) => (input as HTMLInputElement | HTMLTextAreaElement).value
              );

              handleSaveLitigation({
                case: caseRef,
                date: new Date(date),
                parties: parties.split('\n').filter(Boolean),
                outcome: outcome || undefined,
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

export default MarketAnalysisSection;
