import { useState } from 'react';
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
    if (!currentUser) {
      // Close NDA form and redirect to login with return URL
      onClose();
      navigate('/login', { 
        state: { 
          returnUrl: '/submit',
          openNda: true,
          ndaData: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            companyName: formData.companyName,
            title: formData.title
          }
        } 
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
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

          <Typography variant="h6" gutterBottom>
            1. Purpose
          </Typography>
          <Typography paragraph>
            The purpose of this Agreement is to protect the confidential information related to the 
            invention, patent search, and any associated intellectual property that the Disclosing 
            Party shares with Freedom2Operate for the purpose of conducting a Freedom to Operate (FTO) search.
          </Typography>

          <Typography variant="h6" gutterBottom>
            2. Definitions
          </Typography>
          <Typography paragraph>
            "Invention" shall mean all information relating to business programs, products, applications, systems, components, technologies and business topics.
          </Typography>
          <Typography paragraph>
            "Confidential Information" shall mean all information provided by Disclosing Party with respect to the Invention regardless of whether it is written, oral, audio tapes, video tapes, computer discs, machines, prototypes, designs, specifications, articles of manufacture, drawings, human or machine-readable documents.
          </Typography>
          <Typography paragraph>
            Confidential Information shall not include information that:
          </Typography>
          <Typography component="ul">
            <li>Is in the public domain at the time of disclosure or subsequently enters the public domain without fault of the Receiving Party</li>
            <li>Was in the possession of Receiving Party at the time of disclosure that may be demonstrated by business records</li>
            <li>Was acquired from a third party who did not require Receiving Party to hold the same in confidence</li>
          </Typography>

          <Typography variant="h6" gutterBottom>
            3. Use of Confidential Information
          </Typography>
          <Typography paragraph>
            Freedom2Operate agrees to:
          </Typography>
          <Typography component="ul">
            <li>Receive and maintain the Confidential Information in confidence</li>
            <li>Examine the Confidential Information at its own expense</li>
            <li>Not reproduce the Confidential Information without express written consent</li>
            <li>Not disclose the Confidential Information to any person, firm, or corporation</li>
            <li>Limit internal dissemination to employees with a need to know</li>
            <li>Not use the Confidential Information without express written consent</li>
            <li>Not use the information as a basis for similar designs or systems</li>
            <li>Utilize best efforts to protect the information from loss, theft, or destruction</li>
          </Typography>

          <Typography variant="h6" gutterBottom>
            4. Return of Information
          </Typography>
          <Typography paragraph>
            All Confidential Information shall remain the property of the Disclosing Party. Freedom2Operate agrees to return all Confidential Information within 5 days of written demand, without retaining any copies.
          </Typography>

          <Typography variant="h6" gutterBottom>
            5. Enforcement & Remedies
          </Typography>
          <Typography paragraph>
            The parties acknowledge that due to the unique and sensitive nature of the Confidential Information, any breach of this Agreement would cause irreparable harm for which damages and/or equitable relief may be sought. The parties shall be entitled to all remedies available at law.
          </Typography>

          <Typography variant="h6" gutterBottom>
            6. Non-Assignable
          </Typography>
          <Typography paragraph>
            This Agreement shall be non-assignable by either party unless prior written consent is received. If assigned or transferred, it shall be binding on all successors and assigns.
          </Typography>

          <Typography variant="h6" gutterBottom>
            7. No License
          </Typography>
          <Typography paragraph>
            Neither party does, by virtue of disclosure of the Confidential Information, grant any right or license to any patent, trade secret, invention, trademark, copyright, or other intellectual property right.
          </Typography>

          <Typography variant="h6" gutterBottom>
            8. Term and Termination
          </Typography>
          <Typography paragraph>
            This Agreement shall remain in effect for a period of five (5) years from the date of signing. The confidentiality obligations shall survive the termination of this Agreement.
          </Typography>

          <Typography variant="h6" gutterBottom>
            9. Governing Law
          </Typography>
          <Typography paragraph>
            This Agreement shall be governed by and construed in accordance with the laws of the State of Texas, United States, without regard to its conflict of laws principles.
          </Typography>

          <Typography variant="h6" gutterBottom>
            10. Severability
          </Typography>
          <Typography paragraph>
            The provisions of this Agreement are independent and separable. If any provision is found invalid or unenforceable, the remaining provisions shall remain valid and enforceable.
          </Typography>

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
