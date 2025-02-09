import { useState, useEffect, ChangeEvent } from 'react';
import { useLocation, useNavigate, Location } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc,
  orderBy,
  limit,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { generateReferenceNumber } from '../utils/referenceNumber';
import { generateSubmissionPDF } from '../utils/pdfGenerator';
import { sendSubmissionEmail, sendAdminNotification } from '../utils/emailService';
import PaymentStep from './PaymentStep';
import F2O from './F2O';

interface LocationState {
  fromNda?: boolean;
  name?: string;
  company?: string;
}

interface SearchTimeframe {
  startYear: number;
  endYear: number;
}

interface SearchParameters {
  includeNonPatentLiterature: boolean;
  includeExpiredPatents: boolean;
  includeApplications: boolean;
  searchLanguages: string[];
  classificationCodes: string[];
  keywordStrategy: 'broad' | 'narrow';
}

interface FormData {
  projectName: string;
  referenceNumber: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  requestConsultation: boolean;
  consultationDate: string;
  consultationTime: string;
  autoGenerateFeatures: boolean;
  inventionTitle: string;
  background: string;
  specialInstructions: string;
  description: string;
  features: string[];
  technicalField: string;
  targetMarkets: string[];
  conceptionDate: string;
  targetJurisdictions: string[];
  relatedPatents: string[];
  searchTimeframe: SearchTimeframe;
  priorityJurisdictions: string[];
  secondaryJurisdictions: string[];
  searchParameters: SearchParameters;
  commercializationTimeline: string;
  competitorCompanies: string[];
  budgetConstraints: string;
}

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

const steps = ['Basic Information', 'Invention Details', 'Supporting Documents', 'Review', 'Payment'];

// Service pricing
const PRICING = {
  base: 650, // Base price for F2O search
  expedited: 1000, // Additional cost for expedited service
  consultation: 500, // Additional cost for consultation
  featureGeneration: 75, // Cost for auto-generating features
};

const SubmissionForm = () => {
  const location = useLocation() as Location & { state: LocationState };
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error' | 'draft'>('idle');
  const [files, setFiles] = useState<File[]>([]);
  const [searchType, setSearchType] = useState<'fto' | 'patentability'>('fto');
  const [totalAmount, setTotalAmount] = useState(PRICING.base);
  const { currentUser, userProfile } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    projectName: '',
    referenceNumber: '',
    companyName: userProfile?.company || '',
    contactName: userProfile?.displayName || '',
    email: currentUser?.email || '',
    phone: userProfile?.phone || '',
    requestConsultation: false,
    consultationDate: '',
    consultationTime: '',
    autoGenerateFeatures: false,
    inventionTitle: '',
    background: '',
    specialInstructions: '',
    description: '',
    features: ['', '', '', '', '', ''],
    technicalField: '',
    targetMarkets: ['US'],
    conceptionDate: '',
    targetJurisdictions: ['US'],
    relatedPatents: [''],
    searchTimeframe: {
      startYear: new Date().getFullYear() - 20,
      endYear: new Date().getFullYear()
    },
    priorityJurisdictions: ['US', 'EP', 'WO'],
    secondaryJurisdictions: [],
    searchParameters: {
      includeNonPatentLiterature: true,
      includeExpiredPatents: true,
      includeApplications: true,
      searchLanguages: ['en'],
      classificationCodes: [],
      keywordStrategy: 'broad',
    },
    commercializationTimeline: '',
    competitorCompanies: [],
    budgetConstraints: '',
  });

  const [ndaStatus, setNdaStatus] = useState<'checking' | 'valid' | 'invalid'>('checking');
  const [ndaError, setNdaError] = useState<string | null>(null);

  // Check for existing NDA or if user came from NDA form
  useEffect(() => {
    const checkExistingNDA = async () => {
      if (!currentUser?.uid) {
        console.error('No authenticated user');
        setNdaError('Please log in to continue.');
        setNdaStatus('invalid');
        return;
      }

      if (!userProfile) {
        console.error('User profile not loaded');
        setNdaError('User profile is loading. Please wait...');
        return;
      }

      try {
        // First check location state since it's from direct NDA form navigation
        const fromNda = location.state?.fromNda;
        const name = location.state?.name;
        const company = location.state?.company;

        if (fromNda) {
          if (name) {
            setFormData(prev => ({
              ...prev,
              contactName: name,
              companyName: company || ''
            }));
          }
          setNdaStatus('valid');
          return;
        }

        // Then check session storage for existing NDA
        const ndaId = sessionStorage.getItem('ndaId');
        if (ndaId) {
          const signerName = sessionStorage.getItem('ndaSignerName');
          const companyName = sessionStorage.getItem('ndaCompanyName');
          
          if (signerName) {
            setFormData(prev => ({
              ...prev,
              contactName: signerName,
              companyName: companyName || ''
            }));
          }
          setNdaStatus('valid');
          return;
        }

        // Then verify AuthContext profile since it's already loaded
        if (!userProfile?.email) {
          console.error('AuthContext profile not properly initialized');
          setNdaError('User profile is incomplete. Please try logging out and back in.');
          setNdaStatus('invalid');
          return;
        }

        // Then verify Firestore user document
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          console.error('User document not found');
          setNdaError('User profile not found. Please try logging in again.');
          setNdaStatus('invalid');
          return;
        }

        const userData = userDoc.data();
        if (!userData?.role) {
          console.error('User document missing role');
          setNdaError('User permissions not set. Please contact support.');
          setNdaStatus('invalid');
          return;
        }

        // Finally check Firestore for NDAs if no session NDA found
        const ndaQuery = query(
          collection(db, 'ndaAgreements'),
          where('userId', '==', currentUser.uid),
          where('status', '==', 'signed'),
          orderBy('signedAt', 'desc'),
          limit(1)
        );
        const ndaSnapshot = await getDocs(ndaQuery);
        
        if (!ndaSnapshot.empty) {
          // Use the first NDA since the query already filters for signed NDAs
          // and the index sorts by signedAt in descending order
          const latestNda = ndaSnapshot.docs[0];
          const ndaData = latestNda.data();
          
          sessionStorage.setItem('ndaId', latestNda.id);
          sessionStorage.setItem('ndaSignerName', `${ndaData.firstName} ${ndaData.lastName}`);
          sessionStorage.setItem('ndaCompanyName', ndaData.companyName || '');
          
          // Pre-fill form with NDA details if not already filled
          if (!formData.contactName) {
            setFormData(prev => ({
              ...prev,
              contactName: `${ndaData.firstName} ${ndaData.lastName}`,
              companyName: ndaData.companyName || ''
            }));
          }
          
          setNdaStatus('valid');
          return;
        }

        // No valid NDA found
        setNdaStatus('invalid');
        navigate('/', { state: { openNda: true } });
      } catch (error) {
        console.error('Error checking existing NDA:', error);
        setNdaError('Error verifying NDA status. Please try again.');
        setNdaStatus('invalid');
      }
    };

    checkExistingNDA();
  }, [location, navigate, currentUser, userProfile, formData.contactName]);

  useEffect(() => {
    let total = PRICING.base;
    if (formData.autoGenerateFeatures) {
      total += PRICING.featureGeneration;
    }
    // Add $75 for each feature beyond the first 6
    const additionalFeatures = Math.max(0, formData.features.length - 6);
    total += additionalFeatures * PRICING.featureGeneration;
    setTotalAmount(total);
  }, [formData.requestConsultation, formData.autoGenerateFeatures, formData.features.length]);

  type FormDataValue = string | string[] | boolean | SearchTimeframe | SearchParameters;
  
  const handleInputChange = (field: keyof FormData, value: FormDataValue): void => {
    // Apply title case to project name and invention title
    if (field === 'projectName' || field === 'inventionTitle') {
      value = toTitleCase(value as string);
    }
    if (field === 'phone' && typeof value === 'string') {
      const numbers = value.replace(/\D/g, '');
      const truncated = numbers.slice(0, 10);
      let formatted = truncated;
      if (truncated.length > 0) formatted = '(' + formatted;
      if (truncated.length > 3) formatted = formatted.slice(0, 4) + ') ' + formatted.slice(4);
      if (truncated.length > 6) formatted = formatted.slice(0, 9) + '-' + formatted.slice(9);
      value = formatted;
    }
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFeatureChange = (index: number, value: string): void => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    handleInputChange('features', newFeatures);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      const referenceNumber = generateReferenceNumber(currentUser?.uid || 'GUEST');
      
      // Upload files
      const fileUrls = await Promise.all(
        files.map(async (file) => {
          const storageRef = ref(storage, `submissions/${currentUser?.uid}/${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);
          return await getDownloadURL(snapshot.ref);
        })
      );

      const submissionData = {
        ...formData,
        referenceNumber,
        fileUrls,
        submittedAt: new Date(),
        status: 'Submitted',
        paymentStatus: 'Paid',
        searchType,
        userId: currentUser?.uid || '',
        createdAt: new Date(),
        lastModified: new Date(),
      };

      // Save to Firestore
      const submissionRef = await addDoc(collection(db, 'submissions'), submissionData);

      // Create initial progress entry
      await addDoc(collection(db, 'progress'), {
        userId: currentUser?.uid,
        submissionId: submissionRef.id,
        status: 'Submitted',
        currentStep: 0,
        notes: 'Payment received. Submission under initial review.',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Generate PDF
      const pdf = await generateSubmissionPDF({
        ...formData,
        referenceNumber,
      });

      // Send confirmation email
      await sendSubmissionEmail({
        to: formData.email,
        projectName: formData.projectName,
        referenceNumber,
        pdf,
      });

      // Send admin notification
      await sendAdminNotification({
        projectName: formData.projectName,
        referenceNumber,
        contactName: formData.contactName,
        email: formData.email,
      });

      // Download PDF for user
      await pdf.save(`FTO_Request_${referenceNumber}.pdf`);

      setSubmitStatus('success');
      navigate('/dashboard', { state: { refresh: true } });
    } catch (error) {
      console.error('Error processing submission:', error);
      setSubmitStatus('error');
    }
  };

  const handlePaymentError = (error: Error) => {
    console.error('Payment error:', error);
    setSubmitStatus('error');
  };

  const handleSubmitForReview = async () => {
    try {
      const referenceNumber = generateReferenceNumber(currentUser?.uid || 'GUEST');
      
      // Upload files
      const fileUrls = await Promise.all(
        files.map(async (file) => {
          const storageRef = ref(storage, `submissions/${currentUser?.uid}/${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);
          return await getDownloadURL(snapshot.ref);
        })
      );

      // Generate PDF
      const pdf = await generateSubmissionPDF({
        ...formData,
        referenceNumber,
      });

      const submissionData = {
        ...formData,
        referenceNumber,
        fileUrls,
        submittedAt: new Date(),
        status: 'Submitted',
        paymentStatus: 'Pending Review',
        searchType,
        userId: currentUser?.uid || '',
        createdAt: new Date(),
        lastModified: new Date(),
      };

      // Save to Firestore
      const submissionRef = await addDoc(collection(db, 'submissions'), submissionData);

      // Create initial progress entry
      await addDoc(collection(db, 'progress'), {
        userId: currentUser?.uid,
        submissionId: submissionRef.id,
        status: 'Submitted',
        currentStep: 0,
        notes: 'Submission received and under initial review.',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Send confirmation email
      await sendSubmissionEmail({
        to: formData.email,
        projectName: formData.projectName,
        referenceNumber,
        pdf,
      });

      // Send admin notification
      await sendAdminNotification({
        projectName: formData.projectName,
        referenceNumber,
        contactName: formData.contactName,
        email: formData.email,
      });

      // Download PDF for user
      await pdf.save(`FTO_Request_${referenceNumber}.pdf`);

      setSubmitStatus('success');
      navigate('/dashboard', { state: { refresh: true } });
    } catch (error) {
      console.error('Error submitting for review:', error);
      setSubmitStatus('error');
    }
  };

  const handleNext = (): void => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = (): void => {
    setActiveStep((prev) => prev - 1);
  };

  const isStepValid = (): boolean => {
    switch (activeStep) {
      case 0:
        return Boolean(formData.projectName && formData.contactName && 
               formData.email && formData.phone &&
               (!formData.requestConsultation || (formData.consultationDate && formData.consultationTime)));
      case 1: {
        const baseValid = Boolean(formData.inventionTitle && formData.description && formData.background);
        if (formData.autoGenerateFeatures) {
          return baseValid;
        }
        return baseValid && formData.features.filter(f => f).length > 0;
      }
      case 2:
        return true; // File upload is optional
      case 3:
        return true; // Review step should always be valid
      case 4:
        return true; // Payment step validation handled by PayPal
      default:
        return false;
    }
  };

  const renderPaymentStep = (): JSX.Element => (
    <Box>
      <Typography variant="h6" gutterBottom align="center">
        Service Summary
      </Typography>
      <Box sx={{ maxWidth: 400, mx: 'auto', mb: 4 }}>
        <Typography><strong>{searchType === 'fto' ? 'F2O' : 'Patentability'} Search:</strong> ${PRICING.base}</Typography>
        {formData.autoGenerateFeatures && (
          <Typography><strong>Feature Generation:</strong> ${PRICING.featureGeneration}</Typography>
        )}
        {formData.features.length > 6 && (
          <Typography>
            <strong>Additional Features ({formData.features.length - 6}):</strong> ${(formData.features.length - 6) * PRICING.featureGeneration}
          </Typography>
        )}
        <Typography variant="h6" sx={{ mt: 2 }}>
          Total: ${totalAmount}
        </Typography>
      </Box>
      <PaymentStep
        amount={totalAmount}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        onSubmitForReview={handleSubmitForReview}
      />
    </Box>
  );

  if (submitStatus === 'success') {
    return (
      <Paper sx={{ p: 4, maxWidth: '100%', mx: 'auto', mt: 4 }}>
        <Box textAlign="center">
          <Typography variant="h5" gutterBottom>
            Thank you for your submission!
          </Typography>
          <Typography color="text.secondary">
            We have sent a confirmation email with your submission details.
            {formData.requestConsultation && (
              <Typography color="primary" sx={{ mt: 2 }}>
                Our team will reach out to schedule your 30-minute consultation video call.
              </Typography>
            )}
          </Typography>
        </Box>
      </Paper>
    );
  }

  if (submitStatus === 'error') {
    return (
      <Paper sx={{ p: 4, maxWidth: '100%', mx: 'auto', mt: 4 }}>
        <Alert severity="error">
          There was an error processing your submission. Please try again later.
        </Alert>
      </Paper>
    );
  }

  if (ndaStatus === 'checking') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (ndaError) {
    return (
      <Paper sx={{ p: 4, maxWidth: '100%', mx: 'auto', mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {ndaError}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/')}>
          Return to Home
        </Button>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 4, maxWidth: '100%', mx: 'auto', mt: 4 }}>
      <form>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {activeStep === 4 ? renderPaymentStep() : (
          <>
            {/* Form content */}
            {activeStep === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Select Search Type
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Button
                      variant={searchType === 'fto' ? 'contained' : 'outlined'}
                      onClick={() => setSearchType('fto')}
                      sx={{ mr: 2 }}
                    >
                      <F2O />
                    </Button>
                    <Button
                      variant={searchType === 'patentability' ? 'contained' : 'outlined'}
                      onClick={() => setSearchType('patentability')}
                    >
                      Patentability
                    </Button>
                  </Box>
                  <Box sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
                    <Typography variant="h6" gutterBottom>
                      What to Expect
                    </Typography>
                    <Typography paragraph>
                      Our comprehensive search process involves a thorough analysis of patent databases including USPTO, EPO, WIPO, and other relevant technical literature. The search is conducted by experienced patent professionals using advanced search strategies and tools.
                    </Typography>
                    <Typography paragraph>
                      You can expect to receive your detailed report within 5 business days. The report will include:
                      • A comprehensive analysis of relevant patents and prior art
                      • Detailed examination of potential freedom to operate issues
                      • Market and competitive landscape insights
                      • Strategic recommendations and next steps
                    </Typography>
                    <Typography>
                      Our search utilizes industry-standard databases and resources to ensure thorough coverage of both patent and non-patent literature, providing you with actionable insights for your innovation strategy.
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    label="Project Name"
                    value={formData.projectName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('projectName', e.target.value)}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    value={formData.companyName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('companyName', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact Name"
                    value={formData.contactName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('contactName', e.target.value)}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={formData.phone}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('phone', e.target.value)}
                    required
                    helperText="Format: (555) 555-5555"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            )}
            {activeStep === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Invention Title"
                    value={formData.inventionTitle}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('inventionTitle', e.target.value)}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Search Parameters</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Search Start Year"
                        value={formData.searchTimeframe.startYear}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('searchTimeframe', {
                          ...formData.searchTimeframe,
                          startYear: parseInt(e.target.value) || new Date().getFullYear() - 20
                        })}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Search End Year"
                        value={formData.searchTimeframe.endYear}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('searchTimeframe', {
                          ...formData.searchTimeframe,
                          endYear: parseInt(e.target.value) || new Date().getFullYear()
                        })}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>Priority Jurisdictions</Typography>
                  <Grid container spacing={1}>
                    {['US', 'EP', 'WO', 'CN', 'JP', 'KR'].map((jurisdiction) => (
                      <Grid item key={jurisdiction}>
                        <Button
                          variant={formData.priorityJurisdictions.includes(jurisdiction) ? 'contained' : 'outlined'}
                          onClick={() => {
                            const newJurisdictions = formData.priorityJurisdictions.includes(jurisdiction)
                              ? formData.priorityJurisdictions.filter(j => j !== jurisdiction)
                              : [...formData.priorityJurisdictions, jurisdiction];
                            handleInputChange('priorityJurisdictions', newJurisdictions);
                          }}
                          size="small"
                        >
                          {jurisdiction}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>Search Options</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.searchParameters.includeNonPatentLiterature}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('searchParameters', {
                              ...formData.searchParameters,
                              includeNonPatentLiterature: e.target.checked
                            })}
                          />
                        }
                        label="Include Non-Patent Literature"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.searchParameters.includeExpiredPatents}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('searchParameters', {
                              ...formData.searchParameters,
                              includeExpiredPatents: e.target.checked
                            })}
                          />
                        }
                        label="Include Expired Patents"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.searchParameters.includeApplications}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('searchParameters', {
                              ...formData.searchParameters,
                              includeApplications: e.target.checked
                            })}
                          />
                        }
                        label="Include Patent Applications"
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Known Competitor Companies"
                    value={formData.competitorCompanies.join(', ')}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('competitorCompanies', e.target.value.split(',').map(s => s.trim()))}
                    helperText="Enter company names separated by commas"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Background"
                    value={formData.background}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('background', e.target.value)}
                    required
                    helperText="Describe the problem or need that your invention addresses"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Special Instructions"
                    value={formData.specialInstructions}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('specialInstructions', e.target.value)}
                    helperText="Add any special instructions or additional information not covered in other fields"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    label="Detailed Description"
                    value={formData.description}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('description', e.target.value)}
                    required
                    helperText="Provide a detailed description of your invention"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Key Features
                    </Typography>
                    <Typography color="text.secondary" gutterBottom>
                      First 6 features are included. Additional features cost $75 each.
                    </Typography>
                    {formData.features.map((feature, index) => (
                      <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <TextField
                          fullWidth
                          label={`Feature ${index + 1}`}
                          value={feature}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => handleFeatureChange(index, e.target.value)}
                          required={index === 0}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Box>
                    ))}
                    <Button
                      variant="outlined"
                      onClick={() => {
                        const newFeatures = [...formData.features, ''];
                        handleInputChange('features', newFeatures);
                      }}
                      sx={{ mt: 1 }}
                    >
                      Add Feature (+$75)
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            )}
            {activeStep === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Supporting Documents
                  </Typography>
                  <Typography color="text.secondary" gutterBottom>
                    Upload any supporting documents (Word, PDF, images) that help explain your invention
                  </Typography>
                  <input
                    accept=".doc,.docx,.pdf,.png,.jpg,.jpeg"
                    style={{ display: 'none' }}
                    id="raised-button-file"
                    multiple
                    type="file"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="raised-button-file">
                    <Button variant="outlined" component="span">
                      Choose Files
                    </Button>
                  </label>
                  {files.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Selected Files:
                      </Typography>
                      {files.map((file, index) => (
                        <Typography key={index} color="text.secondary">
                          • {file.name}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Grid>
              </Grid>
            )}
            {activeStep === 3 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Review Your Submission
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>Project Information</Typography>
                    <Typography><strong>Project Name:</strong> {formData.projectName}</Typography>
                    <Typography><strong>Company:</strong> {formData.companyName}</Typography>
                    <Typography><strong>Contact:</strong> {formData.contactName}</Typography>
                    <Typography><strong>Email:</strong> {formData.email}</Typography>
                    <Typography><strong>Phone:</strong> {formData.phone}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>Search Parameters</Typography>
                    <Typography><strong>Time Range:</strong> {formData.searchTimeframe.startYear} - {formData.searchTimeframe.endYear}</Typography>
                    <Typography><strong>Priority Jurisdictions:</strong> {formData.priorityJurisdictions.join(', ')}</Typography>
                    <Typography><strong>Search Options:</strong></Typography>
                    <Box sx={{ ml: 2 }}>
                      <Typography>• Include Non-Patent Literature: {formData.searchParameters.includeNonPatentLiterature ? 'Yes' : 'No'}</Typography>
                      <Typography>• Include Expired Patents: {formData.searchParameters.includeExpiredPatents ? 'Yes' : 'No'}</Typography>
                      <Typography>• Include Patent Applications: {formData.searchParameters.includeApplications ? 'Yes' : 'No'}</Typography>
                    </Box>
                    {formData.competitorCompanies.length > 0 && (
                      <>
                        <Typography><strong>Competitor Companies:</strong></Typography>
                        <Box sx={{ ml: 2 }}>
                          {formData.competitorCompanies.map((company, index) => (
                            <Typography key={index}>• {company}</Typography>
                          ))}
                        </Box>
                      </>
                    )}
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>Invention Details</Typography>
                    <Typography><strong>Title:</strong> {formData.inventionTitle}</Typography>
                    {formData.background && (
                      <>
                        <Typography sx={{ mt: 2 }}><strong>Background:</strong></Typography>
                        <Typography sx={{ ml: 2, mb: 2 }}>{formData.background}</Typography>
                      </>
                    )}
                    <Typography><strong>Description:</strong></Typography>
                    <Typography sx={{ ml: 2, mb: 2 }}>{formData.description}</Typography>
                    {formData.specialInstructions && (
                      <>
                        <Typography><strong>Special Instructions:</strong></Typography>
                        <Typography sx={{ ml: 2, mb: 2 }}>{formData.specialInstructions}</Typography>
                      </>
                    )}
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Key Features:</Typography>
                    {formData.features.filter(f => f).map((feature, index) => (
                      <Typography key={index} sx={{ ml: 2 }}>• {feature}</Typography>
                    ))}
                  </Grid>
                  {files.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>Supporting Documents</Typography>
                      {files.map((file, index) => (
                        <Typography key={index} sx={{ ml: 2 }}>• {file.name}</Typography>
                      ))}
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
            <Box sx={{ mt: 2 }}>
              <Button
                onClick={handleBack}
                sx={{ mr: 1 }}
                disabled={activeStep === 0}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepValid()}
              >
                {activeStep === steps.length - 2 ? 'Proceed to Payment' : 'Next'}
              </Button>
            </Box>
          </>
        )}
      </form>
    </Paper>
  );
};

export default SubmissionForm;
