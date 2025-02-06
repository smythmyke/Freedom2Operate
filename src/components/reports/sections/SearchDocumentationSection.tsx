import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { SearchDocumentation } from '../../../types';

interface SearchDocumentationSectionProps {
  documentation: SearchDocumentation;
  onUpdate: (updates: Partial<SearchDocumentation>) => void;
  disabled?: boolean;
}

interface SearchQueryDialogState {
  open: boolean;
  editingQuery: {
    query: string;
    database: string;
    resultCount: number;
    date: Date;
  } | null;
  index: number;
}

export const SearchDocumentationSection: React.FC<SearchDocumentationSectionProps> = ({
  documentation,
  onUpdate,
  disabled = false,
}) => {
  const [newDatabase, setNewDatabase] = useState('');
  const [queryDialog, setQueryDialog] = useState<SearchQueryDialogState>({
    open: false,
    editingQuery: null,
    index: -1,
  });

  const handleAddDatabase = (database: string) => {
    if (!database.trim()) return;
    onUpdate({
      databases: [...documentation.databases, database.trim()],
    });
    setNewDatabase('');
  };

  const handleRemoveDatabase = (index: number) => {
    onUpdate({
      databases: documentation.databases.filter((_, i) => i !== index),
    });
  };

  const handleSaveQuery = (query: typeof queryDialog.editingQuery) => {
    if (!query) return;

    const newQueries = [...documentation.searchQueries];
    if (queryDialog.index === -1) {
      newQueries.push(query);
    } else {
      newQueries[queryDialog.index] = query;
    }

    onUpdate({ searchQueries: newQueries });
    setQueryDialog({ open: false, editingQuery: null, index: -1 });
  };

  const handleDeleteQuery = (index: number) => {
    onUpdate({
      searchQueries: documentation.searchQueries.filter((_, i) => i !== index),
    });
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Search Documentation</Typography>

      <Grid container spacing={3}>
        {/* Databases Section */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>Databases Used</Typography>
          <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
            {documentation.databases.map((database, index) => (
              <Chip
                key={index}
                label={database}
                onDelete={disabled ? undefined : () => handleRemoveDatabase(index)}
              />
            ))}
          </Box>
          {!disabled && (
            <Box display="flex" gap={1}>
              <TextField
                size="small"
                value={newDatabase}
                onChange={(e) => setNewDatabase(e.target.value)}
                placeholder="Add database (e.g., USPTO, EPO, WIPO)"
              />
              <Button
                variant="contained"
                size="small"
                onClick={() => handleAddDatabase(newDatabase)}
                disabled={!newDatabase.trim()}
              >
                Add
              </Button>
            </Box>
          )}
        </Grid>

        {/* Search Queries Section */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1">Search Queries</Typography>
            {!disabled && (
              <Button
                startIcon={<AddIcon />}
                onClick={() => setQueryDialog({
                  open: true,
                  editingQuery: null,
                  index: -1,
                })}
              >
                Add Query
              </Button>
            )}
          </Box>
          <Grid container spacing={2}>
            {documentation.searchQueries.map((query, index) => (
              <Grid item xs={12} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Database: {query.database}
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                      {query.query}
                    </Typography>
                    <Box mt={1} display="flex" gap={2}>
                      <Typography variant="body2" color="textSecondary">
                        Results: {query.resultCount}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Date: {query.date.toLocaleDateString()}
                      </Typography>
                    </Box>
                  </CardContent>
                  {!disabled && (
                    <CardActions>
                      <IconButton
                        size="small"
                        onClick={() => setQueryDialog({
                          open: true,
                          editingQuery: query,
                          index,
                        })}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteQuery(index)}
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

        {/* Total Results Section */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>Total Results Reviewed</Typography>
          <TextField
            type="number"
            size="small"
            disabled={disabled}
            value={documentation.totalResultsReviewed}
            onChange={(e) => onUpdate({
              totalResultsReviewed: parseInt(e.target.value, 10) || 0,
            })}
          />
        </Grid>
      </Grid>

      {/* Query Dialog */}
      <Dialog
        open={queryDialog.open}
        onClose={() => setQueryDialog({ open: false, editingQuery: null, index: -1 })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {queryDialog.editingQuery ? 'Edit Query' : 'Add Query'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'grid', gap: 2 }}>
            <TextField
              fullWidth
              label="Database"
              defaultValue={queryDialog.editingQuery?.database || ''}
              placeholder="Enter database name..."
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Search Query"
              defaultValue={queryDialog.editingQuery?.query || ''}
              placeholder="Enter search query..."
            />
            <TextField
              fullWidth
              type="number"
              label="Result Count"
              defaultValue={queryDialog.editingQuery?.resultCount || ''}
              placeholder="Enter number of results..."
            />
            <TextField
              fullWidth
              type="date"
              label="Date"
              defaultValue={queryDialog.editingQuery?.date.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQueryDialog({ open: false, editingQuery: null, index: -1 })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              const dialogContent = document.querySelector('.MuiDialogContent-root');
              if (!dialogContent) return;

              const inputs = dialogContent.querySelectorAll('input');
              const [database, query, resultCount, date] = Array.from(inputs).map(
                (input: Element) => (input as HTMLInputElement).value
              );

              handleSaveQuery({
                database,
                query,
                resultCount: parseInt(resultCount, 10) || 0,
                date: new Date(date),
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

export default SearchDocumentationSection;
