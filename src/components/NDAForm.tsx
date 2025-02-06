import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Box,
  Checkbox,
  FormControlLabel,
  Paper,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { generateNDAPDF } from '../utils/ndaPdfGenerator';
import { useAuth } from '../contexts/AuthContext';

interface NDAFormProps {
  open: boolean;
  onClose: () => void;
  userDetails?: {
    firstName?: string;
    lastName?: string;
    companyName?: string;
  };
}

const NDAForm = ({ open, onClose, userDetails }: NDAFormProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: userDetails?.firstName || '',
    lastName: userDetails?.lastName || '',
    companyName: userDetails?.companyName || '',
    title: '',
    agreed: false
  });

  // Load saved form data if it exists
  useEffect(() => {
    const savedData = sessionStorage.getItem('pendingNdaData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(prev => ({
          ...prev,
          ...parsedData
        }));
        // Clear the saved data after loading
        sessionStorage.removeItem('pendingNdaData');
      } catch (error) {
        console.error('Error parsing saved NDA data:', error);
      }
    }
  }, []);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      agreed: event.target.checked
    }));
  };

  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      if (!currentUser) {
        // Save form data before redirecting
        sessionStorage.setItem('pendingNdaData', JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          companyName: formData.companyName,
          title: formData.title
        }));
        
        onClose();
        navigate('/login', { 
          state: { 
            returnUrl: '/submit',
            openNda: true,
            message: 'Please log in to complete your NDA submission.'
          } 
        });
        return;
      }

      setLoading(true);
      setError(null);

      // Verify user is still authenticated
      if (!currentUser?.uid) {
        // Save form data before redirecting
        sessionStorage.setItem('pendingNdaData', JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          companyName: formData.companyName,
          title: formData.title
        }));
        
        onClose();
        navigate('/login', { 
          state: { 
            returnUrl: '/submit',
            openNda: true,
            message: 'Your session has expired. Please log in again to complete your NDA submission.'
          } 
        });
        return;
      }

      console.log('Attempting to save NDA...');
      // First save the NDA agreement to Firestore
      const ndaRef = await addDoc(collection(db, 'ndaAgreements'), {
        ...formData,
        userId: currentUser.uid,
        signedAt: new Date(),
        status: 'signed',
        version: '2.0',
        terms: {
          duration: '5 years',
          governingLaw: 'Texas',
          returnPeriod: '5 days',
          nonAssignable: true,
          confidentialityExclusions: [
            'public domain information',
            'prior possession information',
            'third party information'
          ],
          obligations: [
            'maintain confidentiality',
            'examine at own expense',
            'no reproduction without consent',
            'no disclosure to third parties',
            'limit internal dissemination',
            'no use without consent',
            'no derivative works',
            'protect from loss/theft'
          ]
        },
        metadata: {
          type: 'Patent/Invention NDA',
          parties: {
            disclosing: {
              name: `${formData.firstName} ${formData.lastName}`,
              company: formData.companyName || null,
              title: formData.title
            },
            receiving: {
              name: 'Michael Smith',
              company: 'Freedom2Operate',
              title: 'CEO/Owner'
            }
          },
          signatureDate: new Date(),
          effectiveDate: new Date()
        }
      });
      
      console.log('NDA saved successfully with ID:', ndaRef.id);
      // Store NDA ID and signer info in session storage immediately after creating the NDA
      sessionStorage.setItem('ndaId', ndaRef.id);
      sessionStorage.setItem('ndaSignerName', `${formData.firstName} ${formData.lastName}`);
      sessionStorage.setItem('ndaCompanyName', formData.companyName || '');

      try {
        // Generate and upload PDF after saving to Firestore
        const pdf = generateNDAPDF({
          signerName: `${formData.firstName} ${formData.lastName}`,
          signerCompany: formData.companyName,
          signerTitle: formData.title,
          signedAt: new Date(),
          version: '2.0'
        });

        const pdfBlob = pdf.output('blob');
        const storageRef = ref(storage, `ndas/${currentUser.uid}/${ndaRef.id}.pdf`);
        await uploadBytes(storageRef, pdfBlob);
        const pdfUrl = await getDownloadURL(storageRef);

        // Update the NDA document with the PDF URL
        await updateDoc(ndaRef, { pdfUrl });
        sessionStorage.setItem('ndaPdfUrl', pdfUrl);
      } catch (uploadError) {
        console.error('Error uploading PDF:', uploadError);
        // Even if PDF upload fails, we can still proceed since the NDA is saved
      }

      // Check for any draft submissions
      const draftQuery = query(
        collection(db, 'submissions'),
        where('userId', '==', currentUser.uid),
        where('status', '==', 'Draft')
      );

      const draftDocs = await getDocs(draftQuery);
      if (!draftDocs.empty) {
        // Update all drafts with the NDA ID
        for (const doc of draftDocs.docs) {
          await updateDoc(doc.ref, {
            ndaId: ndaRef.id
          });
        }
      }

      onClose();
      navigate('/submit', { 
        state: { 
          fromNda: true,
          name: `${formData.firstName} ${formData.lastName}`,
          company: formData.companyName
        } 
      });
    } catch (error) {
      console.error('Error submitting NDA:', error);
      setError('Failed to submit NDA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Non-Disclosure Agreement</DialogTitle>
      <DialogContent>
        <Paper elevation={0} sx={{ p: 3 }}>
          <Typography paragraph>
            This Non-Disclosure Agreement (the "Agreement") is entered into on {currentDate} between:
          </Typography>
          
          <Typography paragraph>
            <strong>Freedom2Operate</strong>, represented by Michael Smith, CEO/Owner ("Recipient")
          </Typography>

          <Typography paragraph>
            and
          </Typography>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="First Name"
              required
              value={formData.firstName}
              onChange={handleInputChange('firstName')}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Last Name"
              required
              value={formData.lastName}
              onChange={handleInputChange('lastName')}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Company Name (Optional)"
              value={formData.companyName}
              onChange={handleInputChange('companyName')}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Title/Position"
              required
              value={formData.title}
              onChange={handleInputChange('title')}
            />
          </Box>

          {/* Agreement content sections... */}
          {/* [Previous agreement content remains unchanged] */}

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Signatures
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              For Freedom2Operate:
            </Typography>
            <Typography>
              Michael Smith
            </Typography>
            <Typography color="text.secondary">
              CEO/Owner
            </Typography>
            <Typography color="text.secondary">
              Date: {currentDate}
            </Typography>
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.agreed}
                onChange={handleCheckboxChange}
                color="primary"
              />
            }
            label="I have read and agree to the terms of this Non-Disclosure Agreement"
          />
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.agreed || !formData.firstName || !formData.lastName || !formData.title}
        >
          {loading ? <CircularProgress size={24} /> : 'Accept & Continue'}
        </Button>
      </DialogActions>
      {error && (
        <Box sx={{ p: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}
    </Dialog>
  );
};

export default NDAForm;
