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
  Link,
  Tab,
  Tabs,
  IconButton,
  TextField,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import { collection, query, getDocs, orderBy, getDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { toTitleCase } from '../../utils/formatting';
import type { ProjectStatus, PaymentStatus, Submission, DraftProgress, NDAInfo, Feature } from '../../types';
import type { FieldValue } from 'firebase/firestore';
import SearchReportTemplate from '../reports/SearchReportTemplate';
import generateSampleReportPdf from '../../utils/sampleReportPdfGenerator';
import { sampleReport } from '../../data/sampleReport';

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
  const { currentUser, userProfile, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [submissions, setSubmissions] = useState<EnhancedSubmission[]>([]);
  const [ndaAgreements, setNdaAgreements] = useState<NDAWithProjects[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<EnhancedSubmission | null>(null);
  const [dialogType, setDialogType] = useState<DialogType | 'new-report'>(null);
  const [newReportData, setNewReportData] = useState<{
    projectName: string;
    searchType: 'fto' | 'patentability';
    referenceNumber: string;
  }>({
    projectName: '',
    searchType: 'fto',
    referenceNumber: ''
  });

  // Auth check effect
  useEffect(() => {
    if (!currentUser || !userProfile) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    if (!isAdmin) {
      setError('Admin access required');
      setLoading(false);
      return;
    }
  }, [currentUser, userProfile, isAdmin]);

  // Data fetching effect
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser || !userProfile || !isAdmin) return;

      try {
        // Fetch all NDAs first
        const ndasQuery = query(
          collection(db, 'ndaAgreements'),
          orderBy('signedAt', 'desc')
        );
        const ndaSnapshot = await getDocs(ndasQuery);
        const ndaData: NDAWithProjects[] = [];
        
        // Get all unique user IDs from NDAs and fetch their emails
        const userIds = new Set(ndaSnapshot.docs.map(doc => doc.data().userId));
        const userEmails = new Map();
        
        for (const userId of userIds) {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            const userData = userDoc.data() as { email: string };
            userEmails.set(userId, userData.email);
          }
        }

        // Fetch all submissions
        const submissionsQuery = query(
          collection(db, 'submissions'),
          orderBy('createdAt', 'desc')
        );
        const submissionsSnapshot = await getDocs(submissionsQuery);
        const submissionsData: EnhancedSubmission[] = [];
        
        // Process submissions
        submissionsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const ndaDoc = ndaSnapshot.docs.find(ndaDoc => ndaDoc.id === data.ndaId);
          
          let ndaInfo;
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

          submissionsData.push({
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
          });
        });

        setSubmissions(submissionsData);
        setNdaAgreements(ndaData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, userProfile, isAdmin]);

  const handleCloseDialog = () => {
    setDialogType(null);
    setSelectedSubmission(null);
  };

  const filteredSubmissions = submissions
    .filter(sub => statusFilter === 'all' || sub.status === statusFilter);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Paper sx={{ p: 3, maxWidth: 400 }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Typography color="text.secondary">
            Please ensure you are logged in with the correct permissions.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Submissions" />
          <Tab label="NDAs" />
          <Tab label="Templates & Samples" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <>
          <Typography variant="h4" gutterBottom>
            Submissions
          </Typography>

          <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
            <Box display="flex" gap={2}>
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
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setDialogType('new-report')}
            >
              Create New Report
            </Button>
          </Paper>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Reference</TableCell>
                  <TableCell>Project Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>{submission.referenceNumber}</TableCell>
                    <TableCell>{toTitleCase(submission.projectName)}</TableCell>
                    <TableCell>{submission.searchType === 'fto' ? 'F2O' : 'Patentability'}</TableCell>
                    <TableCell>
                      <Chip
                        label={submission.status}
                        color={
                          submission.status === 'Completed' ? 'success' :
                          submission.status === 'In Progress' ? 'primary' :
                          submission.status === 'On Hold' ? 'warning' :
                          'default'
                        }
                        size="small"
                      />
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
                      <IconButton
                        color="primary"
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setDialogType('report');
                        }}
                        title="View/Edit Report"
                      >
                        <DescriptionIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {activeTab === 1 && (
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
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ndaAgreements.map((nda) => (
                  <TableRow key={nda.id}>
                    <TableCell>{nda.signerName}</TableCell>
                    <TableCell>{nda.signerCompany || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={nda.status}
                        color={nda.status === 'signed' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {nda.pdfUrl && (
                        <Link
                          href={nda.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
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

      {activeTab === 2 && (
        <>
          <Typography variant="h4" gutterBottom>
            Templates & Samples
          </Typography>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sample FTO Search Report
            </Typography>
            <Typography paragraph>
              This sample report demonstrates our comprehensive FTO search process and report format.
              It can be viewed by clients from the landing page or downloaded as a PDF.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="contained"
                onClick={() => {
                  setSelectedSubmission({ id: 'sample-report-001' } as EnhancedSubmission);
                  setDialogType('report');
                }}
              >
                View Sample Report
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  const doc = generateSampleReportPdf();
                  doc.save('freedom2operate-sample-report.pdf');
                }}
              >
                Download Sample PDF
              </Button>
            </Box>
          </Paper>
        </>
      )}

      {/* New Report Dialog */}
      <Dialog
        open={dialogType === 'new-report'}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Report</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Project Name"
              value={newReportData.projectName}
              onChange={(e) => setNewReportData(prev => ({
                ...prev,
                projectName: e.target.value
              }))}
            />
            <TextField
              fullWidth
              label="Reference Number"
              value={newReportData.referenceNumber}
              onChange={(e) => setNewReportData(prev => ({
                ...prev,
                referenceNumber: e.target.value
              }))}
            />
            <FormControl fullWidth>
              <InputLabel>Search Type</InputLabel>
              <Select
                value={newReportData.searchType}
                label="Search Type"
                onChange={(e) => setNewReportData(prev => ({
                  ...prev,
                  searchType: e.target.value as 'fto' | 'patentability'
                }))}
              >
                <MenuItem value="fto">Freedom to Operate</MenuItem>
                <MenuItem value="patentability">Patentability</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              try {
                // Create a new submission document
                const submissionRef = doc(collection(db, 'submissions'));
                if (!currentUser?.uid) {
                  throw new Error('No user ID available');
                }

                const timestamp = serverTimestamp();
                const submissionData: Omit<Submission, 'createdAt'> & { createdAt: FieldValue } = {
                  id: submissionRef.id,
                  projectName: newReportData.projectName,
                  referenceNumber: newReportData.referenceNumber,
                  searchType: newReportData.searchType,
                  status: 'Draft' as ProjectStatus,
                  paymentStatus: 'Unpaid' as PaymentStatus,
                  createdAt: timestamp,
                  contactName: 'Admin Created',
                  email: 'admin@f2o.com',
                  phone: 'N/A',
                  userId: currentUser.uid,
                  inventionTitle: newReportData.projectName // Use project name as invention title for admin-created reports
                };
                await setDoc(submissionRef, submissionData);

                // Create initial report
                const reportRef = doc(db, 'reports', submissionRef.id);
                const reportData: {
                  id: string;
                  submissionId: string;
                  type: 'fto' | 'patentability';
                  status: 'draft' | 'review' | 'final';
                  createdAt: FieldValue;
                  updatedAt: FieldValue;
                  createdBy: string;
                  features: Feature[];
                  searchDate: Date;
                  examiner: {
                    name: string;
                    title: string;
                    qualifications: string[];
                  };
                  clientReference: string;
                  executiveSummary: {
                    text: string;
                    keyFindings: string[];
                    riskSummary: {
                      overall: 'Low';
                      byFeature: Record<string, never>;
                    };
                  };
                } = {
                  id: submissionRef.id,
                  submissionId: submissionRef.id,
                  type: newReportData.searchType,
                  status: 'draft',
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                  createdBy: 'admin',
                  features: [],
                  searchDate: new Date(),
                  examiner: {
                    name: 'Pending Assignment',
                    title: 'F2O Search Analyst',
                    qualifications: []
                  },
                  clientReference: newReportData.referenceNumber,
                  executiveSummary: {
                    text: '',
                    keyFindings: [],
                    riskSummary: {
                      overall: 'Low',
                      byFeature: {}
                    }
                  }
                };
                await setDoc(reportRef, reportData);

                // Update submissions list
                // Create an EnhancedSubmission with the correct date string
                const enhancedSubmission: EnhancedSubmission = {
                  ...submissionData,
                  createdAt: new Date().toLocaleDateString(),
                  status: 'Draft',
                  paymentStatus: 'Unpaid'
                };
                setSubmissions(prev => [enhancedSubmission, ...prev]);

                handleCloseDialog();
                
                // Open the new report
                setSelectedSubmission(enhancedSubmission);
                setDialogType('report');
              } catch (error) {
                console.error('Error creating report:', error);
                // TODO: Show error message to user
              }
            }}
          >
            Create Report
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
          {selectedSubmission?.id === 'sample-report-001' 
            ? 'Sample FTO Search Report'
            : `${selectedSubmission?.projectName} - Search Report`}
        </DialogTitle>
        <DialogContent>
          {selectedSubmission && (
            <>
              <Box sx={{ mt: 2 }}>
                <SearchReportTemplate 
                  submissionId={selectedSubmission.id}
                  initialData={selectedSubmission.id === 'sample-report-001' ? sampleReport : undefined}
                  readOnly={selectedSubmission.id === 'sample-report-001'}
                />
              </Box>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Button 
                  variant="outlined" 
                  onClick={handleCloseDialog}
                  size="large"
                >
                  Close Report
                </Button>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
