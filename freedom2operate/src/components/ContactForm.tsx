import { Typography, TextField, Button, Grid, Alert, Paper } from '@mui/material';
import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface ContactFormProps {
  showTitle?: boolean;
  paperProps?: object;
}

const ContactForm = ({ showTitle = true, paperProps = {} }: ContactFormProps) => {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    companyName: string;
    subject: string;
    message: string;
  }

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    companyName: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev: FormData) => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await addDoc(collection(db, 'contacts'), {
        ...formData,
        recipientEmail: 'smythmyke@gmail.com',
        submittedAt: new Date(),
        status: 'unread'
      });
      setSubmitStatus('success');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        companyName: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="First Name"
            required
            variant="outlined"
            value={formData.firstName}
            onChange={handleInputChange('firstName')}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Last Name"
            required
            variant="outlined"
            value={formData.lastName}
            onChange={handleInputChange('lastName')}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Email"
            required
            type="email"
            variant="outlined"
            value={formData.email}
            onChange={handleInputChange('email')}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Company Name (Optional)"
            variant="outlined"
            value={formData.companyName}
            onChange={handleInputChange('companyName')}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Subject"
            required
            variant="outlined"
            value={formData.subject}
            onChange={handleInputChange('subject')}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Message"
            required
            multiline
            rows={4}
            variant="outlined"
            value={formData.message}
            onChange={handleInputChange('message')}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid item xs={12}>
          {submitStatus === 'success' && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Message sent successfully!
            </Alert>
          )}
          {submitStatus === 'error' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to send message. Please try again.
            </Alert>
          )}
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
          >
            Send Message
          </Button>
        </Grid>
      </Grid>
    </form>
  );

  if (!paperProps) {
    return formContent;
  }

  return (
    <Paper sx={{ p: 4, ...paperProps }}>
      {showTitle && (
        <Typography variant="h5" gutterBottom>
          Send us a Message
        </Typography>
      )}
      {formContent}
    </Paper>
  );
};

export default ContactForm;
