import { useState, useEffect, useRef } from 'react';
import SignaturePad from 'react-signature-canvas';
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
  const signaturePadRef = useRef<SignaturePad | null>(null);

  const handlePreview = () => {
    if (!formData.firstName || !formData.lastName || !formData.title) return;

    const signatureData = signaturePadRef.current?.getTrimmedCanvas().toDataURL('image/png');
    const pdf = generateNDAPDF({
      signerName: `${formData.firstName} ${formData.lastName}`,
      signerCompany: formData.companyName,
      signerTitle: formData.title,
      signedAt: new Date(),
      version: '2.0',
      signatureData
    });

    // Open PDF in new window
    const pdfUrl = URL.createObjectURL(pdf.output('blob'));
    window.open(pdfUrl, '_blank');
  };

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: userDetails?.firstName || '',
    lastName: userDetails?.lastName || '',
    companyName: userDetails?.companyName || '',
    title: '',
    agreed: false,
    hasSignature: false
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

  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!currentUser || !userProfile) {
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

      // Check for existing NDA
      try {
        const existingNdaQuery = query(
          collection(db, 'ndaAgreements'),
          where('userId', '==', currentUser.uid)
        );
        const existingNdaSnapshot = await getDocs(existingNdaQuery);
        
        const signedNda = existingNdaSnapshot.docs.find(doc => doc.data().status === 'signed');
        if (signedNda) {
          const existingNda = existingNdaSnapshot.docs[0];
          const ndaData = existingNda.data();
          
          // Store NDA info in session storage
          sessionStorage.setItem('ndaId', existingNda.id);
          sessionStorage.setItem('ndaSignerName', `${ndaData.firstName} ${ndaData.lastName}`);
          sessionStorage.setItem('ndaCompanyName', ndaData.companyName || '');
          if (ndaData.pdfUrl) {
            sessionStorage.setItem('ndaPdfUrl', ndaData.pdfUrl);
          }

          onClose();
          navigate('/submit', { 
            state: { 
              fromNda: true,
              name: `${ndaData.firstName} ${ndaData.lastName}`,
              company: ndaData.companyName
            } 
          });
          return;
        }
      } catch (error) {
        console.error('Error checking existing NDA:', error);
        // Continue with new NDA creation even if check fails
      }

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
      // First save the NDA agreement to Firestore with all required fields
      const ndaRef = await addDoc(collection(db, 'ndaAgreements'), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        title: formData.title,
        agreed: formData.agreed,
        hasSignature: formData.hasSignature,
        userId: currentUser.uid,
        signedAt: new Date(),
        status: 'signed',
        version: '2.0',
        companyName: formData.companyName,
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
        // Generate and save PDF locally first
        const signatureData = signaturePadRef.current?.getTrimmedCanvas().toDataURL('image/png');
        const pdf = generateNDAPDF({
          signerName: `${formData.firstName} ${formData.lastName}`,
          signerCompany: formData.companyName,
          signerTitle: formData.title,
          signedAt: new Date(),
          version: '2.0',
          signatureData
        });

        // Save PDF locally
        pdf.save(`NDA_${formData.firstName}_${formData.lastName}.pdf`);

        // Upload to Firebase Storage
        const pdfBlob = pdf.output('blob');
        const storageRef = ref(storage, `ndas/${currentUser.uid}/${ndaRef.id}.pdf`);
        const uploadResult = await uploadBytes(storageRef, pdfBlob);
        const pdfUrl = await getDownloadURL(uploadResult.ref);

        // Update Firestore document with PDF URL
        await updateDoc(ndaRef, { pdfUrl });
        sessionStorage.setItem('ndaPdfUrl', pdfUrl);
      } catch (error) {
        console.error('Error handling PDF:', error);
        // Show error but don't block the process since NDA is saved
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

          {/* Agreement content sections */}
          <Box sx={{ my: 3 }}>
            <Typography variant="h6" gutterBottom>I. CONFIDENTIAL INFORMATION</Typography>
            <Typography paragraph>
              A. Freedom2Operate agrees to receive INFORMATION from the Disclosing Party to facilitate possible future business dealings between the parties.
            </Typography>
            <Typography paragraph>
              B. Freedom2Operate agrees to receive such INFORMATION and to refrain from copying, disclosing, using, selling, or offering for sale any and all of said INFORMATION, other than at the request of the Disclosing Party. Freedom2Operate agrees to keep confidential and refrain from disclosing any and all of the INFORMATION, and to take all necessary and reasonable steps to prevent unauthorized disclosure or use of any and all of the INFORMATION.
            </Typography>
            <Typography paragraph>
              C. Freedom2Operate shall not be liable for disclosure or use of INFORMATION only if, and only to the extent that, said INFORMATION was in the public domain at the time it was disclosed by the Disclosing Party, or was known to and recorded in writing by Freedom2Operate prior to the time of disclosure by the Disclosing Party.
            </Typography>
            <Typography paragraph>
              D. This is not an offer for sale or license. No right or license is granted by the Disclosing Party to Freedom2Operate in connection with the technical information or inventions disclosed under this agreement.
            </Typography>
            <Typography paragraph>
              E. This Agreement shall remain in force in spite of disclosure of the INFORMATION by the Disclosing Party in the form of patent applications, copyright applications, or other disclosures.
            </Typography>

            <Typography variant="h6" gutterBottom>II. RESTRICTIONS</Typography>
            <Typography paragraph>
              A. Except for the express written consent of the Disclosing Party, Freedom2Operate agrees:
            </Typography>
            <Typography component="div" sx={{ pl: 3 }}>
              1. Not to use or disclose to another person or entity any confidential information;<br />
              2. Not to make, or cause to be made, any copies, facsimiles or other reproductions including data files of any documents containing confidential information; and<br />
              3. To use all other reasonable means to maintain the secrecy and confidentiality of the confidential information.
            </Typography>
            <Typography paragraph sx={{ mt: 2 }}>
              B. Freedom2Operate further agrees, at the request of the Disclosing Party:
            </Typography>
            <Typography component="div" sx={{ pl: 3 }}>
              1. To immediately return all items containing confidential information; and<br />
              2. To refrain from using or disclosing to any other person or entity any confidential information.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>III. INTELLECTUAL PROPERTY</Typography>
            <Typography paragraph>
              All intellectual property rights related to the INFORMATION shall remain the sole property of the Disclosing Party. This includes but is not limited to patents, copyrights, trademarks, trade secrets, and any other proprietary rights.
            </Typography>

            <Typography variant="h6" gutterBottom>IV. DAMAGES AND SPECIFIC PERFORMANCE</Typography>
            <Typography paragraph>
              Freedom2Operate agrees that should Freedom2Operate breach any of the promises contained in this Agreement, the Disclosing Party would suffer irreparable harm and would be without adequate remedy at law. The Disclosing Party may obtain injunctive relief, including specific performance of the Agreement, as well as monetary award for damages suffered.
            </Typography>

            <Typography variant="h6" gutterBottom>V. GOVERNING LAW</Typography>
            <Typography paragraph>
              This Agreement shall be governed by, construed, and enforced in accordance with the laws of the State of Texas. Any dispute involving the terms or conditions of this Agreement shall be brought in a Texas State court of competent jurisdiction.
            </Typography>

            <Typography variant="h6" gutterBottom>VI. TERM</Typography>
            <Typography paragraph>
              This Agreement shall remain in effect for a period of five (5) years from the date of signing. The confidentiality obligations shall survive the termination of this Agreement.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Signatures
          </Typography>

          <Box sx={{ mb: 3, mt: 4 }}>
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

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Your Signature:
            </Typography>
            <Paper 
              variant="outlined" 
              sx={{ 
                width: '100%', 
                height: 200, 
                backgroundColor: '#f8f8f8',
                mb: 2
              }}
            >
              <SignaturePad
                canvasProps={{
                  width: 600,
                  height: 200,
                  style: { width: '100%', height: '100%' }
                }}
                ref={signaturePadRef}
                onEnd={() => setFormData(prev => ({ ...prev, hasSignature: true }))}
              />
            </Paper>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button 
                size="small" 
                onClick={() => {
                  if (signaturePadRef.current) {
                    signaturePadRef.current.clear();
                    setFormData(prev => ({ ...prev, hasSignature: false }));
                  }
                }}
              >
                Clear Signature
              </Button>
              <Button 
                size="small"
                onClick={handlePreview}
                disabled={!formData.firstName || !formData.lastName || !formData.title}
              >
                Preview NDA
              </Button>
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
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
          </Box>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.agreed || !formData.hasSignature || !formData.firstName || !formData.lastName || !formData.title}
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
