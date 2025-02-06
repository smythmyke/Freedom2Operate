import { Box, Typography, Paper, TextField, Button, Grid, Alert } from '@mui/material';
import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const ContactPage = () => {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    subject: string;
    message: string;
  }

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
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
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    }
  };

  return (
    <Box sx={{ width: '100%', py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ textAlign: 'center', fontWeight: 700 }}>
        Contact Us
      </Typography>
      
      {/* Contact Information */}
      <Grid container spacing={4} sx={{ mb: 6, width: '100%' }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%', textAlign: 'center' }}>
            <EmailIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Email
            </Typography>
            <Typography color="text.secondary" sx={{ wordBreak: 'break-word' }}>
              smythmyke@gmail.com
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%', textAlign: 'center' }}>
            <PhoneIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Phone
            </Typography>
            <Typography color="text.secondary">
              (214) 400-3781
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%', textAlign: 'center' }}>
            <LocationOnIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Location
            </Typography>
            <Typography color="text.secondary">
              Dallas, TX
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Contact Form */}
      <Paper sx={{ p: 4, width: '100%' }}>
        <Typography variant="h5" gutterBottom>
          Send us a Message
        </Typography>
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
      </Paper>
    </Box>
  );
};

export default ContactPage;
