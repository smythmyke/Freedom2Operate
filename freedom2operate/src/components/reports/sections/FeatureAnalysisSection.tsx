import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { Feature, Citation, RiskLevel } from '../../../types';

interface FeatureAnalysisSectionProps {
  features: Feature[];
  onUpdate: (features: Feature[]) => void;
  disabled?: boolean;
}

interface CitationDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (citation: Omit<Citation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Partial<Citation>;
}

const CitationDialog: React.FC<CitationDialogProps> = ({
  open,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    patentNumber: initialData?.patentNumber || '',
    relevantText: initialData?.relevantText || '',
    analysis: initialData?.analysis || '',
    publicationDate: initialData?.publicationDate || new Date(),
    priorityDate: initialData?.priorityDate || new Date(),
    patentFamily: initialData?.patentFamily || [],
    legalStatus: initialData?.legalStatus || '',
    assignee: initialData?.assignee || '',
    claimsReferenced: initialData?.claimsReferenced || [],
    figuresReferenced: initialData?.figuresReferenced || [],
    riskLevel: initialData?.riskLevel || 'Medium' as RiskLevel,
  });

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {initialData ? 'Edit Citation' : 'Add Citation'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Patent Number"
              value={formData.patentNumber}
              onChange={(e) => setFormData({ ...formData, patentNumber: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Assignee"
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Relevant Text"
              value={formData.relevantText}
              onChange={(e) => setFormData({ ...formData, relevantText: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Analysis"
              value={formData.analysis}
              onChange={(e) => setFormData({ ...formData, analysis: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Legal Status"
              value={formData.legalStatus}
              onChange={(e) => setFormData({ ...formData, legalStatus: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Risk Level</InputLabel>
              <Select
                value={formData.riskLevel}
                label="Risk Level"
                onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as RiskLevel })}
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Claims Referenced"
              placeholder="Enter claims (comma separated)"
              value={formData.claimsReferenced.join(', ')}
              onChange={(e) => setFormData({
                ...formData,
                claimsReferenced: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              })}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Figures Referenced"
              placeholder="Enter figures (comma separated)"
              value={formData.figuresReferenced.join(', ')}
              onChange={(e) => setFormData({
                ...formData,
                figuresReferenced: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              })}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const FeatureAnalysisSection: React.FC<FeatureAnalysisSectionProps> = ({
  features,
  onUpdate,
  disabled = false,
}) => {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [citationDialogOpen, setCitationDialogOpen] = useState(false);
  const [editingCitation, setEditingCitation] = useState<Citation | null>(null);

  const handleAddFeature = (description: string) => {
    if (!description.trim()) return;
    const newFeature: Feature = {
      id: crypto.randomUUID(),
      description: description.trim(),
      citations: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    onUpdate([...features, newFeature]);
  };

  const handleDeleteFeature = (featureId: string) => {
    onUpdate(features.filter((f) => f.id !== featureId));
    if (selectedFeature?.id === featureId) {
      setSelectedFeature(null);
    }
  };

  const handleAddCitation = (
    featureId: string,
    citationData: Omit<Citation, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const newCitation: Citation = {
      ...citationData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    onUpdate(
      features.map((f) =>
        f.id === featureId
          ? { ...f, citations: [...f.citations, newCitation] }
          : f
      )
    );
  };

  const handleUpdateCitation = (
    featureId: string,
    citationId: string,
    citationData: Omit<Citation, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    onUpdate(
      features.map((f) =>
        f.id === featureId
          ? {
              ...f,
              citations: f.citations.map((c) =>
                c.id === citationId
                  ? { ...c, ...citationData, updatedAt: new Date() }
                  : c
              ),
            }
          : f
      )
    );
  };

  const handleDeleteCitation = (featureId: string, citationId: string) => {
    onUpdate(
      features.map((f) =>
        f.id === featureId
          ? { ...f, citations: f.citations.filter((c) => c.id !== citationId) }
          : f
      )
    );
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Feature Analysis</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" gutterBottom>Features</Typography>
          <Box display="flex" flexDirection="column" gap={1}>
            {features.map((feature) => (
              <Box
                key={feature.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1,
                  bgcolor: selectedFeature?.id === feature.id ? 'action.selected' : 'transparent',
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <Box flexGrow={1} onClick={() => setSelectedFeature(feature)} sx={{ cursor: 'pointer' }}>
                  <Typography variant="body2">{feature.description}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {feature.citations.length} citations
                  </Typography>
                </Box>
                {!disabled && (
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteFeature(feature.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            ))}
          </Box>
          {!disabled && (
            <TextField
              fullWidth
              size="small"
              placeholder="Add new feature"
              sx={{ mt: 2 }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const input = e.target as HTMLInputElement;
                  handleAddFeature(input.value);
                  input.value = '';
                }
              }}
            />
          )}
        </Grid>

        <Grid item xs={12} md={8}>
          {selectedFeature ? (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle2">
                  Citations for: {selectedFeature.description}
                </Typography>
                {!disabled && (
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setEditingCitation(null);
                      setCitationDialogOpen(true);
                    }}
                  >
                    Add Citation
                  </Button>
                )}
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Patent</TableCell>
                      <TableCell>Assignee</TableCell>
                      <TableCell>Risk Level</TableCell>
                      <TableCell>Legal Status</TableCell>
                      {!disabled && <TableCell align="right">Actions</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedFeature.citations.map((citation) => (
                      <TableRow key={citation.id}>
                        <TableCell>{citation.patentNumber}</TableCell>
                        <TableCell>{citation.assignee}</TableCell>
                        <TableCell>
                          <Chip
                            label={citation.riskLevel}
                            color={
                              citation.riskLevel === 'High'
                                ? 'error'
                                : citation.riskLevel === 'Medium'
                                ? 'warning'
                                : 'success'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{citation.legalStatus}</TableCell>
                        {!disabled && (
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditingCitation(citation);
                                setCitationDialogOpen(true);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleDeleteCitation(selectedFeature.id, citation.id)
                              }
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
              color="text.secondary"
            >
              <Typography>Select a feature to view citations</Typography>
            </Box>
          )}
        </Grid>
      </Grid>

      <CitationDialog
        open={citationDialogOpen}
        onClose={() => {
          setCitationDialogOpen(false);
          setEditingCitation(null);
        }}
        onSave={(citationData) => {
          if (selectedFeature) {
            if (editingCitation) {
              handleUpdateCitation(
                selectedFeature.id,
                editingCitation.id,
                citationData
              );
            } else {
              handleAddCitation(selectedFeature.id, citationData);
            }
          }
        }}
        initialData={editingCitation || undefined}
      />
    </Paper>
  );
};

export default FeatureAnalysisSection;
