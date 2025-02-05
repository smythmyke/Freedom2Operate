import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DownloadIcon from '@mui/icons-material/Download';
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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Link,
} from '@mui/material';
import VideoCallRequest from './VideoCallRequest';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import ProjectProgress from './ProjectProgress';
import PaymentHistory from './PaymentHistory';

// Helper function to properly capitalize titles
const toTitleCase = (str: string) => {
  // Words that should not be capitalized (unless they're the first word)
  const minorWords = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet', 'with']);

  return str.toLowerCase().split(' ').map((word, index) => {
    // Always capitalize the first word
    if (index === 0) return word.charAt(0).toUpperCase() + word.slice(1);
    
    // Don't capitalize minor words
    if (minorWords.has(word)) return word;
    
    // Capitalize other words
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
};

import { ProjectStatus } from './ProjectProgress';
import { FormStep } from '../types';

interface ReferenceData {
  referenceNumber: string;
  createdAt: string;
  status: ProjectStatus;
  projectName: string;
  searchType: 'fto' | 'patentability';
  draftProgress?: {
    currentStep: FormStep;
    completedSteps: FormStep[];
    lastModified: Date;
  };
  ndaInfo?: {
    id: string;
    signedAt: Date;
    pdfUrl?: string;
  };
}

interface ProfileFormData {
  displayName: string;
  company: string;
  phone: string;
}

interface ProgressData {
  currentStep: number;
  status: string;
  notes?: string;
  submissionId: string;
}

interface PaymentData {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  submissionId: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, updateProfile } = useAuth();
  const [references, setReferences] = useState<ReferenceData[]>([]);
  const [openVideoCall, setOpenVideoCall] = useState(false);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [openEditProfile, setOpenEditProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState<ProfileFormData>({
    displayName: userProfile?.displayName || '',
    company: userProfile?.company || '',
    phone: userProfile?.phone || '',
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser) return;

      try {
        // Fetch submissions and their NDAs
        const submissionsQuery = query(
          collection(db, 'submissions'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        
        const submissionsSnapshot = await getDocs(submissionsQuery);
        const refsData: ReferenceData[] = [];
        
        for (const doc of submissionsSnapshot.docs) {
          const data = doc.data();
          let ndaInfo;

          // If submission has an NDA ID, fetch the NDA details
          if (data.ndaId) {
            const ndaQuery = query(
              collection(db, 'ndaAgreements'),
              where('id', '==', data.ndaId)
            );
            const ndaSnapshot = await getDocs(ndaQuery);
            if (!ndaSnapshot.empty) {
              const ndaData = ndaSnapshot.docs[0].data();
              ndaInfo = {
                id: ndaData.id,
                signedAt: new Date(ndaData.signedAt.toDate()),
                pdfUrl: ndaData.pdfUrl
              };
            }
          }

          refsData.push({
            referenceNumber: data.referenceNumber,
            createdAt: new Date(data.createdAt.toDate()).toLocaleDateString(),
            status: data.status || 'Draft',
            projectName: data.projectName || 'Untitled Project',
            searchType: data.searchType || 'fto',
            draftProgress: data.status === 'Draft' ? {
              currentStep: data.currentStep || 'Basic Information',
              completedSteps: data.completedSteps || [],
              lastModified: new Date(data.lastModified?.toDate() || data.createdAt.toDate())
            } : undefined,
            ndaInfo
          });
        }

        setReferences(refsData);

        // Fetch progress data
        const progressQuery = query(
          collection(db, 'progress'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        
        const progressSnapshot = await getDocs(progressQuery);
        const progressData: ProgressData[] = [];
        
        progressSnapshot.forEach((doc) => {
          const data = doc.data();
          progressData.push({
            currentStep: data.currentStep,
            status: data.status,
            notes: data.notes,
            submissionId: data.submissionId,
          });
        });

        setProgressData(progressData);

        // Fetch payments
        const paymentsQuery = query(
          collection(db, 'payments'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        
        const paymentsSnapshot = await getDocs(paymentsQuery);
        const paymentsData: PaymentData[] = [];
        
        paymentsSnapshot.forEach((doc) => {
          const data = doc.data();
          paymentsData.push({
            id: doc.id,
            amount: data.amount,
            status: data.status,
            createdAt: data.createdAt.toDate().toISOString(),
            submissionId: data.submissionId,
          });
        });

        setPayments(paymentsData);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  useEffect(() => {
    if (userProfile) {
      setProfileFormData({
        displayName: userProfile.displayName || '',
        company: userProfile.company || '',
        phone: userProfile.phone || '',
      });
    }
  }, [userProfile]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      // Format phone number as (XXX) XXX-XXXX
      const numbers = value.replace(/\D/g, '');
      const truncated = numbers.slice(0, 10);
      let formatted = truncated;
      if (truncated.length > 0) formatted = '(' + formatted;
      if (truncated.length > 3) formatted = formatted.slice(0, 4) + ') ' + formatted.slice(4);
      if (truncated.length > 6) formatted = formatted.slice(0, 9) + '-' + formatted.slice(9);
      setProfileFormData(prev => ({ ...prev, [name]: formatted }));
    } else {
      setProfileFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setUpdating(true);
      await updateProfile(profileFormData);
      setOpenEditProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Dashboard
      </Typography>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/submit')}
          >
            Start A Search
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setOpenVideoCall(true)}
          >
            Request Video Call
          </Button>
        </Box>
      </Paper>
      
      <Grid container spacing={3}>
        {/* Profile Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Profile Information
              </Typography>
              <Button variant="outlined" onClick={() => setOpenEditProfile(true)}>
                Edit Profile
              </Button>
            </Box>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <Typography>
                <strong>Name:</strong> {userProfile?.displayName || 'Not set'}
              </Typography>
              <Typography>
                <strong>Email:</strong> {currentUser?.email}
              </Typography>
              <Typography>
                <strong>Company:</strong> {userProfile?.company || 'Not set'}
              </Typography>
              <Typography>
                <strong>Phone:</strong> {userProfile?.phone || 'Not set'}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Project Progress Section */}
        <Grid item xs={12}>
          {progressData.length > 0 && (
            <ProjectProgress
              status={progressData[0].status}
              notes={progressData[0].notes}
            />
          )}
        </Grid>

        {/* Payment History Section */}
        <Grid item xs={12} md={6}>
          <PaymentHistory payments={payments} />
        </Grid>

        {/* Projects Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              My Projects
            </Typography>
            {references.length === 0 ? (
              <Typography color="textSecondary">
                No projects found. Submit a new request to get started.
              </Typography>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Project Name</TableCell>
                        <TableCell>Reference Number</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Created Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {references.map((ref) => (
                        <TableRow 
                          key={ref.referenceNumber}
                          sx={{
                            backgroundColor: ref.status === 'Draft' ? 'action.hover' : 'inherit'
                          }}
                        >
                          <TableCell>{toTitleCase(ref.projectName)}</TableCell>
                          <TableCell>{ref.referenceNumber}</TableCell>
                          <TableCell>{ref.searchType === 'fto' ? 'F2O' : 'Patentability'}</TableCell>
                          <TableCell>{ref.createdAt}</TableCell>
                          <TableCell>
                            <Chip
                              label={ref.status}
                              color={
                                ref.status === 'Completed' ? 'success' :
                                ref.status === 'In Progress' ? 'primary' :
                                ref.status === 'On Hold' ? 'warning' :
                                ref.status === 'Draft' ? 'default' :
                                'info'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              {ref.status === 'Draft' && (
                                <>
                                  <Typography variant="caption" color="text.secondary">
                                    Last step: {ref.draftProgress?.currentStep}
                                  </Typography>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() => navigate(`/submit?draft=${ref.referenceNumber}`)}
                                  >
                                    Continue
                                  </Button>
                                </>
                              )}
                              {ref.status !== 'Draft' && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => navigate(`/project/${ref.referenceNumber}`)}
                                >
                                  View Details
                                </Button>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="caption" color="text.secondary">
                    Status Legend:
                  </Typography>
                  <Chip label="Draft" size="small" sx={{ mr: 1 }} />
                  <Chip label="Submitted" color="info" size="small" sx={{ mr: 1 }} />
                  <Chip label="In Progress" color="primary" size="small" sx={{ mr: 1 }} />
                  <Chip label="On Hold" color="warning" size="small" sx={{ mr: 1 }} />
                  <Chip label="Completed" color="success" size="small" />
                </Box>
              </>
            )}
          </Paper>
        </Grid>

        {/* NDAs Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              My NDAs
            </Typography>
            {references.filter(ref => ref.ndaInfo).length === 0 ? (
              <Typography color="textSecondary">
                No NDAs found. NDAs will appear here once signed.
              </Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Project Name</TableCell>
                      <TableCell>Reference Number</TableCell>
                      <TableCell>Signed Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {references
                      .filter(ref => ref.ndaInfo)
                      .map((ref) => (
                        <TableRow key={ref.ndaInfo?.id}>
                          <TableCell>{toTitleCase(ref.projectName)}</TableCell>
                          <TableCell>{ref.referenceNumber}</TableCell>
                          <TableCell>
                            {ref.ndaInfo?.signedAt.toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {ref.ndaInfo?.pdfUrl && (
                              <Link
                                href={ref.ndaInfo.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ textDecoration: 'none' }}
                              >
                                <Button 
                                  size="small" 
                                  variant="outlined"
                                  startIcon={<DownloadIcon />}
                                >
                                  Download NDA
                                </Button>
                              </Link>
                            )}
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog open={openEditProfile} onClose={() => setOpenEditProfile(false)}>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'grid', gap: 2 }}>
            <TextField
              fullWidth
              label="Full Name"
              name="displayName"
              value={profileFormData.displayName}
              onChange={handleProfileChange}
            />
            <TextField
              fullWidth
              label="Company"
              name="company"
              value={profileFormData.company}
              onChange={handleProfileChange}
            />
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={profileFormData.phone}
              onChange={handleProfileChange}
              helperText="Format: (555) 555-5555"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditProfile(false)}>Cancel</Button>
          <Button 
            onClick={handleUpdateProfile} 
            variant="contained"
            disabled={updating}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Video Call Request Dialog */}
      <VideoCallRequest
        open={openVideoCall}
        onClose={() => setOpenVideoCall(false)}
        references={references}
      />
    </Container>
  );
};

export default Dashboard;
