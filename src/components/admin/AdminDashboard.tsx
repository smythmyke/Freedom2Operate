import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Container,
  Typography,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Button,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Link,
  Tab,
  Tabs,
  Tooltip,
  IconButton,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import { collection, query, getDocs, orderBy, updateDoc, doc, addDoc, where, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { toTitleCase } from '../../utils/formatting';
import type { ProjectStatus, PaymentStatus, Submission, DraftProgress, NDAInfo } from '../../types';
import SearchReportTemplate from '../reports/SearchReportTemplate';

interface EnhancedSubmission extends Submission {
  draftProgress?: DraftProgress;
  ndaInfo?: NDAInfo;
}

interface NDAWithProjects extends NDAInfo {
  userId: string;
  userEmail?: string;
  associatedProjects: EnhancedSubmission[];
}

type DialogType = 'status' | 'report' | null;

const AdminDashboard = () => {
  const { currentUser, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [submissions, setSubmissions] = useState<EnhancedSubmission[]>([]);
  const [ndaAgreements, setNdaAgreements] = useState<NDAWithProjects[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [ndaFilter, setNdaFilter] = useState<'all' | 'with_nda' | 'without_nda'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<EnhancedSubmission | null>(null);
  const [dialogType, setDialogType] = useState<DialogType>(null);
  const [newStatus, setNewStatus] = useState<ProjectStatus>('Draft');
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus>('Unpaid');
  const [statusNote, setStatusNote] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      console.log('Starting to fetch admin dashboard data...');
      try {
        console.log('Fetching NDAs...');
        // Fetch all NDAs first
        const ndasQuery = query(
          collection(db, 'ndaAgreements'),
          orderBy('signedAt', 'desc')
        );
        const ndaSnapshot = await getDocs(ndasQuery);
        console.log('NDA snapshot:', ndaSnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() })));
        const ndaData: NDAWithProjects[] = [];
        
        // Get all unique user IDs from NDAs and fetch their emails
        const userIds = new Set(ndaSnapshot.docs.map(doc => doc.data().userId));
        const userEmails = new Map();
        
        for (const userId of userIds) {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            userEmails.set(userId, userData.email);
          }
        }

        // Fetch all submissions - no status filter for admins
        const submissionsQuery = isAdmin || !currentUser ? 
          query(
            collection(db, 'submissions'),
            orderBy('createdAt', 'desc')
          ) :
          query(
            collection(db, 'submissions'),
            where('userId', '==', currentUser.uid),
            orderBy('createdAt', 'desc')
          );
        const submissionsSnapshot = await getDocs(submissionsQuery);
        console.log('Submissions snapshot:', submissionsSnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() })));
        const submissionsData: EnhancedSubmission[] = [];
        
        // Process submissions first
        for (const doc of submissionsSnapshot.docs) {
          const data = doc.data();
          let ndaInfo;

          // Find associated NDA if it exists
          const ndaDoc = ndaSnapshot.docs.find(ndaDoc => 
            ndaDoc.id === data.ndaId
          );

          if (ndaDoc) {
            const ndaData = ndaDoc.data();
            ndaInfo = {
              id: ndaDoc.id,
              signedAt: new Date(ndaData.signedAt.toDate()),
              status: ndaData.status,
              pdfUrl: ndaData.pdfUrl,
              signerName: ndaData.metadata.parties.disclosing.name,
              signerCompany: ndaData.metadata.parties.disclosing.company,
              signerTitle: ndaData.metadata.parties.disclosing.title,
              version: ndaData.version
            };
          }

          const submission = {
            id: doc.id,
            referenceNumber: data.referenceNumber,
            projectName: data.projectName,
            inventionTitle: data.inventionTitle,
            searchType: data.searchType,
            status: data.status,
            paymentStatus: data.paymentStatus || 'Unpaid',
            createdAt: new Date(data.createdAt.toDate()).toLocaleDateString(),
            contactName: data.contactName,
            email: data.email,
            phone: data.phone,
            notes: data.notes,
            userId: data.userId,
            draftProgress: data.status === 'Draft' ? {
              currentStep: data.currentStep || 'Basic Information',
              completedSteps: data.completedSteps || [],
              lastModified: new Date(data.lastModified?.toDate() || data.createdAt.toDate()),
              formData: data.formData || {}
            } : undefined,
            ndaInfo
          };
          
          submissionsData.push(submission);
        }

        // Process NDAs and associate them with submissions
        for (const doc of ndaSnapshot.docs) {
          const data = doc.data();
          const associatedProjects = submissionsData.filter(
            sub => sub.ndaInfo?.id === doc.id
          );

          ndaData.push({
            id: doc.id,
            userId: data.userId,
            userEmail: userEmails.get(data.userId),
            signedAt: new Date(data.signedAt.toDate()),
            status: data.status,
            pdfUrl: data.pdfUrl,
            signerName: data.metadata.parties.disclosing.name,
            signerCompany: data.metadata.parties.disclosing.company,
            signerTitle: data.metadata.parties.disclosing.title,
            version: data.version,
            associatedProjects
          });
        }

        setSubmissions(submissionsData);
        setNdaAgreements(ndaData);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error instanceof Error) {
          console.error('Error details:', {
            message: error.message,
            stack: error.stack
          });
        }
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchData();
    }
  }, [currentUser, isAdmin]);

  const handleCloseDialog = () => {
    setDialogType(null);
    setSelectedSubmission(null);
  };

  const handleStatusUpdate = async () => {
    if (!selectedSubmission) return;

    try {
      // Update submission status and payment status
      await updateDoc(doc(db, 'submissions', selectedSubmission.id), {
        status: newStatus,
        paymentStatus: newPaymentStatus,
        notes: statusNote,
      });

      // Create progress entry
      await addDoc(collection(db, 'progress'), {
        submissionId: selectedSubmission.referenceNumber,
        userId: selectedSubmission.userId,
        currentStep: newStatus === 'Completed' ? 5 : 
                    newStatus === 'In Progress' ? 2 :
                    newStatus === 'Submitted' ? 1 : 0,
        status: newStatus,
        notes: statusNote,
        createdAt: new Date(),
      });

      // Update local state
      setSubmissions(prev => prev.map(sub => 
        sub.id === selectedSubmission.id 
          ? { ...sub, status: newStatus, paymentStatus: newPaymentStatus, notes: statusNote }
          : sub
      ));

      handleCloseDialog();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredSubmissions = submissions
    .filter(sub => statusFilter === 'all' || sub.status === statusFilter)
    .filter(sub => {
      if (ndaFilter === 'with_nda') return sub.ndaInfo !== undefined;
      if (ndaFilter === 'without_nda') return sub.ndaInfo === undefined;
      return true;
    });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Submissions" />
          <Tab label="NDAs" />
        </Tabs>
      </Box>

      {activeTab === 0 ? (
        <>
          <Typography variant="h4" gutterBottom>
            Submissions
          </Typography>

          {/* Filters */}
          <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={statusFilter}
                label="Filter by Status"
                onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
              >
                <MenuItem value="all">All Submissions</MenuItem>
                <MenuItem value="Draft">Draft</MenuItem>
                <MenuItem value="Submitted">Submitted</MenuItem>
                <MenuItem value="Pending Review">Pending Review</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="On Hold">On Hold</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>NDA Status</InputLabel>
              <Select
                value={ndaFilter}
                label="NDA Status"
                onChange={(e) => setNdaFilter(e.target.value as 'all' | 'with_nda' | 'without_nda')}
              >
                <MenuItem value="all">All Submissions</MenuItem>
                <MenuItem value="with_nda">With NDA</MenuItem>
                <MenuItem value="without_nda">Without NDA</MenuItem>
              </Select>
            </FormControl>
          </Paper>

          {/* Submissions Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Reference</TableCell>
                  <TableCell>Project Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Created/Modified</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>NDA Status</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Actions</TableCell>
                  <TableCell>Report</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>{submission.referenceNumber}</TableCell>
                    <TableCell>{toTitleCase(submission.projectName)}</TableCell>
                    <TableCell>{submission.searchType === 'fto' ? 'F2O' : 'Patentability'}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{submission.contactName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {submission.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {submission.status === 'Draft' && submission.draftProgress ? (
                        <>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Created: {submission.createdAt}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Modified: {submission.draftProgress.lastModified.toLocaleDateString()}
                          </Typography>
                        </>
                      ) : (
                        submission.createdAt
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={submission.status}
                        color={
                          submission.status === 'Completed' ? 'success' :
                          submission.status === 'In Progress' ? 'primary' :
                          submission.status === 'On Hold' ? 'warning' :
                          submission.status === 'Draft' ? 'default' :
                          'info'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {submission.status === 'Draft' && submission.draftProgress ? (
                        <Box>
                          <Typography variant="caption" display="block">
                            Step: {submission.draftProgress.currentStep}
                          </Typography>
                          <Typography variant="caption" display="block">
                            {submission.draftProgress.completedSteps.length} of 5 steps
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          N/A
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {submission.ndaInfo ? (
                        <Box>
                          <Tooltip title={`Signed by ${submission.ndaInfo.signerName} on ${submission.ndaInfo.signedAt.toLocaleDateString()}`}>
                            <Chip
                              label={submission.ndaInfo.status}
                              color={
                                submission.ndaInfo.status === 'signed' ? 'success' :
                                submission.ndaInfo.status === 'expired' ? 'error' :
                                'warning'
                              }
                              size="small"
                              sx={{ mb: 1 }}
                            />
                          </Tooltip>
                          {submission.ndaInfo.pdfUrl && (
                            <Link
                              href={submission.ndaInfo.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ textDecoration: 'none', display: 'block' }}
                            >
                              <Button size="small" variant="outlined">
                                View NDA
                              </Button>
                            </Link>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          No NDA
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={submission.paymentStatus}
                        color={
                          submission.paymentStatus === 'Paid' ? 'success' :
                          submission.paymentStatus === 'Processing' ? 'warning' :
                          'error'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setNewStatus(submission.status);
                          setNewPaymentStatus(submission.paymentStatus);
                          setStatusNote(submission.notes || '');
                          setDialogType('status');
                        }}
                      >
                        Update Status
                      </Button>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setDialogType('report');
                        }}
                        title="Create/Edit Report"
                      >
                        <DescriptionIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Status Update Dialog */}
          <Dialog 
            open={dialogType === 'status'} 
            onClose={handleCloseDialog}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Update Submission Status</DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 2, display: 'grid', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Project Status</InputLabel>
                  <Select
                    value={newStatus}
                    label="Project Status"
                    onChange={(e) => setNewStatus(e.target.value as ProjectStatus)}
                  >
                    <MenuItem value="Draft">Draft</MenuItem>
                    <MenuItem value="Submitted">Submitted</MenuItem>
                    <MenuItem value="Pending Review">Pending Review</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="On Hold">On Hold</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel>Payment Status</InputLabel>
                  <Select
                    value={newPaymentStatus}
                    label="Payment Status"
                    onChange={(e) => setNewPaymentStatus(e.target.value as PaymentStatus)}
                  >
                    <MenuItem value="Unpaid">Unpaid</MenuItem>
                    <MenuItem value="Pending Review">Pending Review</MenuItem>
                    <MenuItem value="Processing">Processing</MenuItem>
                    <MenuItem value="Paid">Paid</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Status Note"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Add a note about this status update..."
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleStatusUpdate} variant="contained">
                Update Status
              </Button>
            </DialogActions>
          </Dialog>

          {/* Report Dialog */}
          <Dialog
            open={dialogType === 'report'}
            onClose={handleCloseDialog}
            maxWidth="xl"
            fullWidth
          >
            <DialogTitle>
              {selectedSubmission?.projectName} - Search Report
            </DialogTitle>
            <DialogContent>
              {selectedSubmission && (
                <Box sx={{ mt: 2 }}>
                  <SearchReportTemplate submissionId={selectedSubmission.id} />
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </Dialog>
        </>
      ) : (
        <>
          <Typography variant="h4" gutterBottom>
            Non-Disclosure Agreements
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Signer</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>User Email</TableCell>
                  <TableCell>Signed Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Associated Projects</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ndaAgreements.map((nda) => (
                  <TableRow key={nda.id}>
                    <TableCell>
                      <Typography variant="body2">{nda.signerName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {nda.signerTitle}
                      </Typography>
                    </TableCell>
                    <TableCell>{nda.signerCompany || 'N/A'}</TableCell>
                    <TableCell>{nda.userEmail || 'Unknown'}</TableCell>
                    <TableCell>{nda.signedAt.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={nda.status}
                        color={
                          nda.status === 'signed' ? 'success' :
                          nda.status === 'expired' ? 'error' :
                          'warning'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {nda.associatedProjects.length > 0 ? (
                        <Box>
                          {nda.associatedProjects.map((project) => (
                            <Typography key={project.id} variant="caption" display="block">
                              {project.projectName} ({project.referenceNumber})
                            </Typography>
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          No associated projects
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {nda.pdfUrl && (
                        <Link
                          href={nda.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ textDecoration: 'none' }}
                        >
                          <Button size="small" variant="outlined">
                            View NDA
                          </Button>
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Container>
  );
};

export default AdminDashboard;
