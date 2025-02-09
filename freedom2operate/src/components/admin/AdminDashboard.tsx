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
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import { collection, query, getDocs, orderBy, getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { toTitleCase } from '../../utils/formatting';
import type { ProjectStatus, Submission, DraftProgress, NDAInfo } from '../../types';
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
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [submissions, setSubmissions] = useState<EnhancedSubmission[]>([]);
  const [ndaAgreements, setNdaAgreements] = useState<NDAWithProjects[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<EnhancedSubmission | null>(null);
  const [dialogType, setDialogType] = useState<DialogType>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;

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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

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
            <Box sx={{ mt: 2 }}>
              <SearchReportTemplate 
                submissionId={selectedSubmission.id}
                initialData={selectedSubmission.id === 'sample-report-001' ? sampleReport : undefined}
                readOnly={selectedSubmission.id === 'sample-report-001'}
              />
            </Box>
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
