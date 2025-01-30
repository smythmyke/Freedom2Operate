import { useState, useEffect } from 'react';
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
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { generateReferenceNumber } from '../utils/referenceNumber';
import { generateSubmissionPDF } from '../utils/pdfGenerator';
import { sendSubmissionEmail, sendAdminNotification } from '../utils/emailService';
import PaymentStep from './PaymentStep';

const steps = ['Basic Information', 'Invention Details', 'Supporting Documents', 'Review', 'Payment'];

// Service pricing
const PRICING = {
  base: 2500, // Base price for FTO search
  expedited: 1000, // Additional cost for expedited service
  consultation: 500, // Additional cost for consultation
};

const SubmissionForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [files, setFiles] = useState<File[]>([]);
  const [searchType, setSearchType] = useState<'fto' | 'patentability'>('fto');
  const [totalAmount, setTotalAmount] = useState(PRICING.base);
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    projectName: '',
    referenceNumber: '',
    companyName: '',
    contactName: '',
    email: currentUser?.email || '',
    phone: '',
    requestConsultation: false,
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

  // Update email when user is loaded
  useEffect(() => {
    if (currentUser?.email) {
      handleInputChange('email', currentUser.email);
    }
  }, [currentUser]);

  useEffect(() => {
    let total = PRICING.base;
    if (formData.requestConsultation) {
      total += PRICING.consultation;
    }
    setTotalAmount(total);
  }, [formData.requestConsultation]);

  const handleInputChange = (field: string, value: string | string[] | boolean) => {
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

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return formData.projectName && formData.contactName && 
               formData.email && formData.phone;
      case 1: {
        const baseValid = formData.inventionTitle && formData.description && 
               formData.features.filter(f => f).length > 0;
        return baseValid;
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

      // Create Firestore document
      await addDoc(collection(db, 'submissions'), {
        ...formData,
        referenceNumber,
        fileUrls,
        submittedAt: new Date(),
        status: 'paid',
        searchType,
        paymentDetails,
        userId: currentUser?.uid || '',
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
        <Typography><strong>Base Service:</strong> ${PRICING.base}</Typography>
        {formData.requestConsultation && (
          <Typography><strong>Consultation:</strong> ${PRICING.consultation}</Typography>
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

  // Rest of the component remains the same until the renderStepContent switch
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
                  Freedom 2 Operate
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
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Name"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Name"
                value={formData.contactName}
                onChange={(e) => handleInputChange('contactName', e.target.value)}
                required
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
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.requestConsultation}
                    onChange={(e) => handleInputChange('requestConsultation', e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography>Request a 30-minute consultation (+${PRICING.consultation})</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Schedule a video call to discuss the details of your invention with our experts
                    </Typography>
                  </Box>
                }
              />
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
                        handleInputChange('relatedPatents', [...formData.relatedPatents, '']);
                      }
                    }}
                  />
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
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Key Features (up to 6)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Describe the key technical aspects that make your invention unique. Each feature should be a specific technical element, not a benefit or result.
              </Typography>
              {formData.features.map((feature, index) => (
                <TextField
                  key={index}
                  fullWidth
                  label={`Feature ${index + 1}`}
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  sx={{ mb: 2 }}
                  required={index === 0}
                  helperText={index === 0 ? "First feature is required. Example: A solar panel with bifacial cells that collect light from both sides" :
                             index === 1 ? "Example: An anti-reflective coating made of zinc oxide nanoparticles" :
                             index === 2 ? "Example: A tracking system that adjusts panel angle based on sun position" : ""}
                />
              ))}
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
                <Typography><strong>Project Name:</strong> {formData.projectName}</Typography>
                <Typography><strong>Company:</strong> {formData.companyName}</Typography>
                <Typography><strong>Contact:</strong> {formData.contactName}</Typography>
                <Typography><strong>Email:</strong> {formData.email}</Typography>
                <Typography><strong>Phone:</strong> {formData.phone}</Typography>
                {formData.requestConsultation && (
                  <Typography sx={{ mt: 1, color: 'primary.main' }}>
                    <strong>✓ Consultation Requested:</strong> 30-minute video call
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>Invention Details</Typography>
                <Typography><strong>Title:</strong> {formData.inventionTitle}</Typography>
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
      </form>
    </Paper>
  );
};

export default SubmissionForm;
