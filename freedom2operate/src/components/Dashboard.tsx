import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
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
} from '@mui/material';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface ReferenceData {
  referenceNumber: string;
  createdAt: string;
  status: string;
}

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [references, setReferences] = useState<ReferenceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReferences = async () => {
      if (!currentUser) return;

      try {
        const q = query(
          collection(db, 'submissions'),
          where('userId', '==', currentUser.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const refsData: ReferenceData[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          refsData.push({
            referenceNumber: data.referenceNumber,
            createdAt: new Date(data.createdAt.toDate()).toLocaleDateString(),
            status: data.status || 'Pending',
          });
        });

        setReferences(refsData);
      } catch (error) {
        console.error('Error fetching references:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReferences();
  }, [currentUser]);

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
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Welcome, {currentUser?.email}
        </Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          My Reference Numbers
        </Typography>
        {references.length === 0 ? (
          <Typography color="textSecondary">
            No reference numbers found. Submit a new request to get started.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Reference Number</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {references.map((ref) => (
                  <TableRow key={ref.referenceNumber}>
                    <TableCell>{ref.referenceNumber}</TableCell>
                    <TableCell>{ref.createdAt}</TableCell>
                    <TableCell>{ref.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default Dashboard;
