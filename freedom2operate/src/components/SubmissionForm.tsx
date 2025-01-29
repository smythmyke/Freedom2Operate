import { useState } from 'react';
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
} from '@mui/material';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

const steps = ['Basic Information', 'Invention Details', 'Supporting Documents', 'Review & Submit'];

const SubmissionForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    projectName: '',
    referenceNumber: '',
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    inventionTitle: '',
    background: '',
    description: '',
    features: ['', '', '', '', '', ''],
    technicalField: '',
    existingSolutions: '',
    advantages: '',
  });

  const handleInputChange = (field: string, value: string | string[]) => {
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
        return formData.projectName && formData.companyName && formData.contactName && 
               formData.email && formData.phone;
      case 1:
        return formData.inventionTitle && formData.description && 
               formData.features.filter(f => f).length > 0;
      case 2:
        return true; // File upload is optional
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    try {
      // Upload files first
      const fileUrls = await Promise.all(
        files.map(async (file) => {
          const storageRef = ref(storage, `submissions/${Date.now()}_${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);
          return await getDownloadURL(snapshot.ref);
        })
      );

      // Then create the submission with file URLs
      await addDoc(collection(db, 'submissions'), {
        ...formData,
        fileUrls,
        submittedAt: new Date(),
        status: 'pending',
      });
      
      setSubmitStatus('success');
      setActiveStep(steps.length);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
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
                label="Reference Number (Optional)"
                value={formData.referenceNumber}
                onChange={(e) => handleInputChange('referenceNumber', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Name"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                required
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Invention Title"
                value={formData.inventionTitle}
                onChange={(e) => handleInputChange('inventionTitle', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Technical Field"
                value={formData.technicalField}
                onChange={(e) => handleInputChange('technicalField', e.target.value)}
                required
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
              {formData.features.map((feature, index) => (
                <TextField
                  key={index}
                  fullWidth
                  label={`Feature ${index + 1}`}
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  sx={{ mb: 2 }}
                  required={index === 0}
                />
              ))}
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Existing Solutions"
                value={formData.existingSolutions}
                onChange={(e) => handleInputChange('existingSolutions', e.target.value)}
                helperText="Describe any existing solutions or competing products you're aware of, including any known patent numbers or publication numbers"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Advantages"
                value={formData.advantages}
                onChange={(e) => handleInputChange('advantages', e.target.value)}
                helperText="Describe the advantages of your invention over existing solutions"
              />
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
                {formData.referenceNumber && (
                  <Typography><strong>Reference Number:</strong> {formData.referenceNumber}</Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>Invention Details</Typography>
                <Typography><strong>Title:</strong> {formData.inventionTitle}</Typography>
                <Typography><strong>Technical Field:</strong> {formData.technicalField}</Typography>
                <Typography sx={{ mt: 2 }}><strong>Background:</strong></Typography>
                <Typography sx={{ ml: 2, mb: 2 }}>{formData.background}</Typography>
                <Typography><strong>Detailed Description:</strong></Typography>
                <Typography sx={{ ml: 2, mb: 2 }}>{formData.description}</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Key Features:</Typography>
                {formData.features.filter(f => f).map((feature, index) => (
                  <Typography key={index} sx={{ ml: 2 }}>• {feature}</Typography>
                ))}
                {formData.existingSolutions && (
                  <>
                    <Typography sx={{ mt: 2 }}><strong>Existing Solutions:</strong></Typography>
                    <Typography sx={{ ml: 2 }}>{formData.existingSolutions}</Typography>
                  </>
                )}
                {formData.advantages && (
                  <>
                    <Typography sx={{ mt: 2 }}><strong>Advantages:</strong></Typography>
                    <Typography sx={{ ml: 2 }}>{formData.advantages}</Typography>
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

      default:
        return null;
    }
  };

  if (activeStep === steps.length) {
    return (
      <Paper sx={{ p: 4, maxWidth: '100%', mx: 'auto', mt: 4 }}>
        {submitStatus === 'success' ? (
          <Box textAlign="center">
            <Typography variant="h5" gutterBottom>
              Thank you for your submission!
            </Typography>
            <Typography color="text.secondary">
              We will review your invention details and contact you soon.
            </Typography>
          </Box>
        ) : (
          <Alert severity="error">
            There was an error submitting your form. Please try again later.
          </Alert>
        )}
      </Paper>
    );
  }

  return (
      <Paper sx={{ p: 4, maxWidth: '100%', mx: 'auto', mt: 4 }}>
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
          onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
          disabled={!isStepValid()}
        >
          {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
        </Button>
      </Box>
    </Paper>
  );
};

export default SubmissionForm;
