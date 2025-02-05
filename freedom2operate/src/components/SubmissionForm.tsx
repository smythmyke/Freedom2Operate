import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  Chip,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  OutlinedInput,
} from '@mui/material';
import { collection, addDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { generateReferenceNumber } from '../utils/referenceNumber';
import { generateSubmissionPDF } from '../utils/pdfGenerator';
import { sendSubmissionEmail, sendAdminNotification } from '../utils/emailService';
import PaymentStep from './PaymentStep';
import F2O from './F2O';

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
  base: 500, // Base price for F2O search
  expedited: 1000, // Additional cost for expedited service
  consultation: 500, // Additional cost for consultation
  featureGeneration: 75, // Cost for auto-generating features
};

const SubmissionForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error' | 'draft'>('idle');
  const [files, setFiles] = useState<File[]>([]);
  const [searchType, setSearchType] = useState<'fto' | 'patentability'>('fto');
  const [totalAmount, setTotalAmount] = useState(PRICING.base);
  const { currentUser, userProfile } = useAuth();

  // Check if user came from NDA form
  useEffect(() => {
    const ndaId = sessionStorage.getItem('ndaId');
    const fromNda = location.state?.fromNda;
    const name = location.state?.name;
    const company = location.state?.company;
    
    if (!ndaId) {
      // Only redirect if we haven't just come from the NDA form
      if (!fromNda) {
        navigate('/', { state: { openNda: true } });
        return;
      }
    } else if (name) {
      // Pre-fill form with NDA details
      setFormData(prev => ({
        ...prev,
        contactName: name,
        companyName: company || ''
      }));
    }
  }, [location, navigate]);

  const [formData, setFormData] = useState({
    projectName: '',
    referenceNumber: '',
    companyName: userProfile?.company || '',
    contactName: userProfile?.displayName || '',
    email: currentUser?.email || '',
    phone: userProfile?.phone || '',
    requestConsultation: false,
    consultationDateTime: '',
    autoGenerateFeatures: false,
    inventionTitle: '',
    background: '',
    description: '',
    features: ['', '', '', '', '', ''],
    technicalField: '',
    targetMarkets: ['US'],
    conceptionDate: '',
    targetJurisdictions: ['US'],
    relatedPatents: [''],
  });

  // Update user information when profile is loaded
  useEffect(() => {
    if (currentUser?.email) {
      handleInputChange('email', currentUser.email);
    }
    if (userProfile) {
      if (userProfile.company) {
        handleInputChange('companyName', userProfile.company);
      }
      if (userProfile.displayName) {
        handleInputChange('contactName', userProfile.displayName);
      }
      if (userProfile.phone) {
        handleInputChange('phone', userProfile.phone);
      }
    }
  }, [currentUser, userProfile]);

  useEffect(() => {
    let total = PRICING.base;
    if (formData.autoGenerateFeatures) {
      total += PRICING.featureGeneration;
    }
    setTotalAmount(total);
  }, [formData.requestConsultation, formData.autoGenerateFeatures]);

  const handleInputChange = (field: string, value: string | string[] | boolean) => {
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

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    handleInputChange('features', newFeatures);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  const searchParams = new URLSearchParams(location.search);
  const draftId = searchParams.get('draft');

  // Load draft if available
  useEffect(() => {
    const loadDraft = async () => {
      if (!draftId || !currentUser) return;

      try {
        const draftDoc = await getDocs(
          query(
            collection(db, 'submissions'),
            where('referenceNumber', '==', draftId),
            where('userId', '==', currentUser.uid),
            where('status', '==', 'Draft')
          )
        );

        if (!draftDoc.empty) {
          const draftData = draftDoc.docs[0].data();
          setFormData({
            projectName: draftData.projectName || '',
            referenceNumber: draftData.referenceNumber || '',
            companyName: draftData.companyName || '',
            contactName: draftData.contactName || '',
            email: draftData.email || '',
            phone: draftData.phone || '',
            requestConsultation: draftData.requestConsultation || false,
            consultationDateTime: draftData.consultationDateTime || '',
            autoGenerateFeatures: draftData.autoGenerateFeatures || false,
            inventionTitle: draftData.inventionTitle || '',
            background: draftData.background || '',
            description: draftData.description || '',
            features: draftData.features || ['', '', '', '', '', ''],
            technicalField: draftData.technicalField || '',
            targetMarkets: draftData.targetMarkets || ['US'],
            conceptionDate: draftData.conceptionDate || '',
            targetJurisdictions: draftData.targetJurisdictions || ['US'],
            relatedPatents: draftData.relatedPatents || [''],
          });
          setSearchType(draftData.searchType);
          setSubmitStatus('draft');
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    };

    loadDraft();
  }, [draftId, currentUser]);

  // Save draft when form data changes
  const saveDraft = useCallback(async () => {
    if (!currentUser || activeStep === 4) return; // Don't save during payment step

    try {
      const referenceNumber = formData.referenceNumber || generateReferenceNumber(currentUser.uid);
      const currentStepName = steps[activeStep];
      const completedSteps = steps.slice(0, activeStep);
      
      const draftData = {
        ...formData,
        referenceNumber,
        userId: currentUser.uid,
        createdAt: new Date(),
        lastModified: new Date(),
        status: 'Draft',
        paymentStatus: 'Unpaid',
        searchType,
        currentStep: currentStepName,
        completedSteps,
        formData: { ...formData },
      };

      // Check if draft already exists
      const draftQuery = query(
        collection(db, 'submissions'),
        where('referenceNumber', '==', referenceNumber),
        where('userId', '==', currentUser.uid),
        where('status', '==', 'Draft')
      );
      
      const draftSnapshot = await getDocs(draftQuery);
      
      if (!draftSnapshot.empty) {
        // Update existing draft
        await updateDoc(draftSnapshot.docs[0].ref, draftData);
      } else {
        // Create new draft
        await addDoc(collection(db, 'submissions'), draftData);
      }

      // Update form data with reference number if it was just generated
      if (!formData.referenceNumber) {
        setFormData(prev => ({ ...prev, referenceNumber }));
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  }, [formData, currentUser, activeStep, searchType, steps]);

  // Auto-save draft when form data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.projectName && submitStatus !== 'success') {
        saveDraft();
      }
    }, 2000); // Save after 2 seconds of no changes

    return () => clearTimeout(timeoutId);
  }, [formData, saveDraft, submitStatus]);

  const handleNext = () => {
    const nextStep = activeStep + 1;
    setActiveStep(nextStep);
    
    // Save progress when completing a step
    if (isStepValid()) {
      saveDraft();
    }
    
    // Update status when moving to payment
    if (activeStep === steps.length - 2) {
      setSubmitStatus('idle'); // Reset from draft if it was a draft
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return formData.projectName && formData.contactName && 
               formData.email && formData.phone &&
               (!formData.requestConsultation || formData.consultationDateTime);
      case 1: {
        const baseValid = formData.inventionTitle && formData.description;
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

  interface PayPalPaymentDetails {
    id: string;
    status: string;
    payer: {
      email_address?: string;
      payer_id: string;
    };
    purchase_units: Array<{
      amount: {
        value: string;
        currency_code: string;
      };
    }>;
    create_time: string;
    update_time: string;
  }

  const handlePaymentSuccess = async (paymentDetails: PayPalPaymentDetails) => {
    try {
      const referenceNumber = generateReferenceNumber(currentUser?.uid || 'GUEST');
      
      // Upload files
      const fileUrls = await Promise.all(
        files.map(async (file) => {
          const storageRef = ref(storage, `submissions/${referenceNumber}/${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);
          return await getDownloadURL(snapshot.ref);
        })
      );

      // Generate PDF
      const pdf = generateSubmissionPDF({
        ...formData,
        referenceNumber,
      });

      // Update Firestore document
      const submissionRef = draftId ? 
        query(
          collection(db, 'submissions'),
          where('referenceNumber', '==', draftId),
          where('userId', '==', currentUser?.uid),
          where('status', '==', 'Draft')
        ) :
        null;

      const submissionData = {
        ...formData,
        referenceNumber,
        fileUrls,
        submittedAt: new Date(),
        status: 'Submitted',
        paymentStatus: 'Paid',
        searchType,
        paymentDetails,
        userId: currentUser?.uid || '',
      };

      if (submissionRef) {
        // Update existing draft
        const draftDoc = await getDocs(submissionRef);
        if (!draftDoc.empty) {
          await updateDoc(draftDoc.docs[0].ref, submissionData);
        } else {
          await addDoc(collection(db, 'submissions'), submissionData);
        }
      } else {
        // Create new submission
        await addDoc(collection(db, 'submissions'), submissionData);
      }

      // Create initial progress entry
      await addDoc(collection(db, 'progress'), {
        submissionId: referenceNumber,
        userId: currentUser?.uid,
        currentStep: 0,
        status: 'Submitted',
        notes: 'Submission received and payment confirmed.',
        createdAt: new Date(),
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
      pdf.save(`FTO_Request_${referenceNumber}.pdf`);

      setSubmitStatus('success');
    } catch (error) {
      console.error('Error processing submission:', error);
      setSubmitStatus('error');
    }
  };

  const handlePaymentError = (error: Error) => {
    console.error('Payment error:', error);
    setSubmitStatus('error');
  };

  const renderPaymentStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom align="center">
        Service Summary
      </Typography>
      <Box sx={{ maxWidth: 400, mx: 'auto', mb: 4 }}>
        <Typography><strong>{searchType === 'fto' ? 'F2O' : 'Patentability'} Search:</strong> ${PRICING.base}</Typography>
        {formData.autoGenerateFeatures && (
          <Typography><strong>Feature Generation:</strong> ${PRICING.featureGeneration}</Typography>
        )}
        <Typography variant="h6" sx={{ mt: 2 }}>
          Total: ${totalAmount}
        </Typography>
      </Box>
      <PaymentStep
        amount={totalAmount}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    </Box>
  );

  // Rest of the component remains the same...
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            {/* Basic Information step content */}
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
              <TextField
                fullWidth
                label="Project Name"
                value={formData.projectName}
                onChange={(e) => handleInputChange('projectName', e.target.value)}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Name"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Name"
                value={formData.contactName}
                onChange={(e) => handleInputChange('contactName', e.target.value)}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
                helperText="Format: (555) 555-5555"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.requestConsultation}
                      onChange={(e) => handleInputChange('requestConsultation', e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography>Request a 30-minute consultation (Free)</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Schedule a video call to discuss the details of your invention with our experts
                      </Typography>
                    </Box>
                  }
                />
                {formData.requestConsultation && (
                  <Box sx={{ mt: 2, ml: 4 }}>
                    <TextField
                      fullWidth
                      label="Preferred Consultation Date & Time"
                      type="datetime-local"
                      value={formData.consultationDateTime}
                      onChange={(e) => handleInputChange('consultationDateTime', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{
                        min: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
                        max: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
                      }}
                      helperText="Please select a date and time at least 24 hours in advance (available for next 30 days)"
                      required={formData.requestConsultation}
                    />
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            {/* Invention Details step content */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Invention Title"
                value={formData.inventionTitle}
                onChange={(e) => handleInputChange('inventionTitle', e.target.value)}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            {searchType === 'fto' && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Target Markets
                  </Typography>
                  <Select
                    multiple
                    fullWidth
                    value={formData.targetMarkets}
                    onChange={(e) => handleInputChange('targetMarkets', e.target.value as string[])}
                    input={<OutlinedInput />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                  >
                    {['US', 'WO', 'CN', 'EP', 'JP', 'KR', 'CA', 'AU', 'BR', 'IN', 'RU', 'MX'].map((market) => (
                      <MenuItem key={market} value={market}>
                        {market}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
              </>
            )}
            {searchType === 'patentability' && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Conception Date"
                    type="date"
                    value={formData.conceptionDate}
                    onChange={(e) => handleInputChange('conceptionDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Target Jurisdictions
                  </Typography>
                  <Select
                    multiple
                    fullWidth
                    value={formData.targetJurisdictions}
                    onChange={(e) => handleInputChange('targetJurisdictions', e.target.value as string[])}
                    input={<OutlinedInput />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                  >
                    {['US', 'WO', 'CN', 'EP', 'JP', 'KR', 'CA', 'AU', 'BR', 'IN', 'RU', 'MX'].map((jurisdiction) => (
                      <MenuItem key={jurisdiction} value={jurisdiction}>
                        {jurisdiction}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Related Patents
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Enter patent numbers that you know are similar to or may be relevant to your invention
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      label="Add Patent Number"
                      value={formData.relatedPatents[formData.relatedPatents.length - 1]}
                      onChange={(e) => {
                        const newPatents = [...formData.relatedPatents];
                        newPatents[newPatents.length - 1] = e.target.value;
                        handleInputChange('relatedPatents', newPatents);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && formData.relatedPatents[formData.relatedPatents.length - 1]) {
                          e.preventDefault();
                          handleInputChange('relatedPatents', [...formData.relatedPatents, '']);
                        }
                      }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={() => {
                        if (formData.relatedPatents[formData.relatedPatents.length - 1]) {
                          handleInputChange('relatedPatents', [...formData.relatedPatents, '']);
                        }
                      }}
                      disabled={!formData.relatedPatents[formData.relatedPatents.length - 1]}
                    >
                      Add
                    </Button>
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    {formData.relatedPatents.slice(0, -1).map((patent, index) => (
                      <Chip
                        key={index}
                        label={patent}
                        onDelete={() => {
                          const newPatents = formData.relatedPatents.filter((_, i) => i !== index);
                          handleInputChange('relatedPatents', newPatents);
                        }}
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                </Grid>
              </>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Technical Field"
                value={formData.technicalField}
                onChange={(e) => handleInputChange('technicalField', e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Background"
                value={formData.background}
                onChange={(e) => handleInputChange('background', e.target.value)}
                helperText="Describe the problem or need that your invention addresses"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={8}
                label="Detailed Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
                helperText="Provide a detailed description of your invention"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Key Features (up to 6)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Describe the key technical aspects that make your invention unique. Each feature should be a specific technical element, not a benefit or result.
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.autoGenerateFeatures}
                      onChange={(e) => handleInputChange('autoGenerateFeatures', e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography>Let us write the features (+$75)</Typography>
                      <Typography variant="body2" color="text.secondary">
                        We'll analyze your documents and create the features for you
                      </Typography>
                    </Box>
                  }
                />
              </Box>
              {!formData.autoGenerateFeatures && (
                <>
                  {formData.features.filter((f, i) => f || i === formData.features.findIndex(feat => !feat)).map((feature, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <TextField
                        fullWidth
                        label={`Feature ${index + 1}`}
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        required={index === 0}
                        helperText={index === 0 ? "First feature is required. Example: A solar panel with bifacial cells that collect light from both sides" :
                                  index === 1 ? "Example: An anti-reflective coating made of zinc oxide nanoparticles" :
                                  index === 2 ? "Example: A tracking system that adjusts panel angle based on sun position" : ""}
                      />
                      {index > 0 && (
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => {
                            const newFeatures = formData.features.filter((_, i) => i !== index);
                            while (newFeatures.length < 6) newFeatures.push('');
                            handleInputChange('features', newFeatures);
                          }}
                          sx={{ minWidth: '48px', px: 0 }}
                        >
                          X
                        </Button>
                      )}
                    </Box>
                  ))}
                  {formData.features.filter(f => f).length < 6 && formData.features[formData.features.findIndex(f => !f)] && (
                    <Button
                      variant="contained"
                      onClick={() => {
                        const firstEmptyIndex = formData.features.findIndex(f => !f);
                        if (firstEmptyIndex >= 0 && firstEmptyIndex < 6) {
                          const newFeatures = [...formData.features];
                          newFeatures[firstEmptyIndex] = formData.features[firstEmptyIndex];
                          handleInputChange('features', newFeatures);
                        }
                      }}
                      disabled={!formData.features[formData.features.findIndex(f => !f)]}
                    >
                      Add Feature
                    </Button>
                  )}
                </>
              )}
            </Grid>
          </Grid>
        );

      case 2:
        return (
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
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Submission
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>Project Information</Typography>
                <Typography><strong>Project Name:</strong> {toTitleCase(formData.projectName)}</Typography>
                <Typography><strong>Company:</strong> {formData.companyName}</Typography>
                <Typography><strong>Contact:</strong> {formData.contactName}</Typography>
                <Typography><strong>Email:</strong> {formData.email}</Typography>
                <Typography><strong>Phone:</strong> {formData.phone}</Typography>
                {formData.requestConsultation && (
                  <>
                    <Typography sx={{ mt: 1, color: 'primary.main' }}>
                      <strong>✓ Consultation Requested:</strong> 30-minute video call
                    </Typography>
                    <Typography sx={{ color: 'primary.main', ml: 2 }}>
                      Preferred Time: {new Date(formData.consultationDateTime).toLocaleString()}
                    </Typography>
                  </>
                )}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>Invention Details</Typography>
                <Typography><strong>Title:</strong> {toTitleCase(formData.inventionTitle)}</Typography>
                {formData.technicalField && (
                  <Typography><strong>Technical Field:</strong> {formData.technicalField}</Typography>
                )}
                {formData.background && (
                  <>
                    <Typography sx={{ mt: 2 }}><strong>Background:</strong></Typography>
                    <Typography sx={{ ml: 2, mb: 2 }}>{formData.background}</Typography>
                  </>
                )}
                <Typography><strong>Detailed Description:</strong></Typography>
                <Typography sx={{ ml: 2, mb: 2 }}>{formData.description}</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Key Features:</Typography>
                {formData.features.filter(f => f).map((feature, index) => (
                  <Typography key={index} sx={{ ml: 2 }}>• {feature}</Typography>
                ))}
                {searchType === 'fto' && (
                  <>
                    <Typography sx={{ mt: 2 }}><strong>Target Markets:</strong></Typography>
                    {formData.targetMarkets.map((market, index) => (
                      <Typography key={index} sx={{ ml: 2 }}>• {market}</Typography>
                    ))}
                  </>
                )}
                {searchType === 'patentability' && (
                  <>
                    {formData.conceptionDate && (
                      <>
                        <Typography sx={{ mt: 2 }}><strong>Conception Date:</strong></Typography>
                        <Typography sx={{ ml: 2 }}>{new Date(formData.conceptionDate).toLocaleDateString()}</Typography>
                      </>
                    )}
                    {formData.targetJurisdictions.length > 0 && (
                      <>
                        <Typography sx={{ mt: 2 }}><strong>Target Jurisdictions:</strong></Typography>
                        {formData.targetJurisdictions.map((jurisdiction, index) => (
                          <Typography key={index} sx={{ ml: 2 }}>• {jurisdiction}</Typography>
                        ))}
                      </>
                    )}
                    {formData.relatedPatents.filter(p => p).length > 0 && (
                      <>
                        <Typography sx={{ mt: 2 }}><strong>Related Patents:</strong></Typography>
                        {formData.relatedPatents.filter(p => p).map((patent, index) => (
                          <Typography key={index} sx={{ ml: 2 }}>• {patent}</Typography>
                        ))}
                      </>
                    )}
                  </>
                )}
                {files.length > 0 && (
                  <>
                    <Typography sx={{ mt: 2 }}><strong>Attached Files:</strong></Typography>
                    {files.map((file, index) => (
                      <Typography key={index} sx={{ ml: 2 }}>• {file.name}</Typography>
                    ))}
                  </>
                )}
              </Grid>
            </Grid>

            {/* Service Description */}
            <Paper sx={{ p: 3, mt: 4, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <Typography variant="h6" gutterBottom>
                What We Will Do
              </Typography>
              <Typography paragraph>
                For {formData.companyName ? formData.companyName + "'s" : formData.contactName + "'s"} invention 
                "{toTitleCase(formData.inventionTitle)}", we will conduct a comprehensive {searchType === 'fto' ? <F2O /> : 'Patentability'} search across 
                multiple patent databases {searchType === 'fto' ? `focusing on ${formData.targetMarkets.join(', ')} markets` : 
                'for patentability assessment'}.
              </Typography>
              <Typography paragraph>
                Our analysis will include:
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li">
                  Primary results highlighting patents that describe similar features in their claims
                </Typography>
                <Typography component="li">
                  Secondary results showing related technologies that may be relevant but don't directly claim the features
                </Typography>
                <Typography component="li">
                  A detailed PDF report with our findings and expert observations
                </Typography>
                {formData.autoGenerateFeatures && (
                  <Typography component="li">
                    Professional feature extraction and articulation from your provided documentation
                  </Typography>
                )}
                {formData.requestConsultation && (
                  <Typography component="li">
                    A 30-minute consultation to discuss our findings and answer your questions
                  </Typography>
                )}
              </Box>
            </Paper>
          </Box>
        );

      case 4:
        return renderPaymentStep();

      default:
        return <Typography>Unknown step</Typography>;
    }
  };

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
        
        {renderStepContent()}

        {activeStep !== 4 && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            {activeStep !== 0 && (
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Back
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!isStepValid()}
            >
              {activeStep === steps.length - 2 ? 'Proceed to Payment' : 'Next'}
            </Button>
          </Box>
        )}
      </form>
    </Paper>
  );
};

export default SubmissionForm;
