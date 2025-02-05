import { useState, useRef, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Alert,
  Typography,
  Stack,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { addDays, setHours, setMinutes, isWeekend, format } from 'date-fns';
import { sendVideoCallRequest } from '../utils/emailService';
import { useAuth } from '../contexts/AuthContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

interface VideoCallRequestProps {
  open: boolean;
  onClose: () => void;
  references: { referenceNumber: string }[];
}

const VideoCallRequest = ({ open, onClose, references }: VideoCallRequestProps) => {
  const { currentUser, userProfile } = useAuth();
  const [callTypes, setCallTypes] = useState<string[]>([]);
  const [projectReference, setProjectReference] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);

  const minTime = useMemo(() => setHours(setMinutes(new Date(), 0), 9), []); // 9 AM
  const maxTime = useMemo(() => setHours(setMinutes(new Date(), 0), 17), []); // 5 PM

  const shouldDisableTime = (date: Date) => {
    const hours = date.getHours();
    return hours < 9 || hours >= 17; // Disable times outside 9 AM - 5 PM
  };

  const shouldDisableDate = (date: Date) => {
    return isWeekend(date); // Disable weekends
  };

  const handleCallTypeChange = (type: string) => {
    setCallTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  const handleSubmit = async () => {
    if (callTypes.length === 0 || !selectedDateTime) {
      setError('Please select a call type and preferred date/time');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      setError('');
      
      // Upload files to Firebase Storage
      const fileUrls = await Promise.all(
        files.map(async (file) => {
          try {
            const storageRef = ref(storage, `video-call-docs/${Date.now()}-${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            return await getDownloadURL(snapshot.ref);
          } catch (uploadError) {
            console.error('File upload error:', uploadError);
            throw new Error(`Failed to upload file: ${file.name}`);
          }
        })
      );

      await sendVideoCallRequest({
        callType: callTypes,
        projectReference: projectReference || undefined,
        additionalInfo: additionalInfo || undefined,
        userEmail: currentUser?.email || '',
        userName: userProfile?.displayName || currentUser?.email || '',
        preferredTime: format(selectedDateTime, "MMMM do 'at' h:mm a 'CT'"),
        files: files.map((file, index) => ({
          name: file.name,
          url: fileUrls[index]
        }))
      });
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setCallTypes([]);
        setProjectReference('');
        setAdditionalInfo('');
        setFiles([]);
      }, 2000);
    } catch (error) {
      console.error('Video call request error:', error);
      setError(error instanceof Error ? error.message : 'Failed to send video call request. Please try again.');
      setSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Request Video Call</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>Request sent successfully!</Alert>}
          
          <FormGroup sx={{ mb: 3 }}>
            <FormControlLabel
              control={<Checkbox 
                checked={callTypes.includes('Information')}
                onChange={() => handleCallTypeChange('Information')}
              />}
              label="General Information"
            />
            <FormControlLabel
              control={<Checkbox 
                checked={callTypes.includes('Discuss Invention')}
                onChange={() => handleCallTypeChange('Discuss Invention')}
              />}
              label="Discuss Invention"
            />
          </FormGroup>

          {references.length > 0 && (
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Project Reference</InputLabel>
              <Select
                value={projectReference}
                label="Project Reference"
                onChange={(e) => setProjectReference(e.target.value)}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {references.map((ref) => (
                  <MenuItem key={ref.referenceNumber} value={ref.referenceNumber}>
                    {ref.referenceNumber}
                  </MenuItem>
                ))}
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          )}

          <Box sx={{ mb: 3 }}>
            <Stack spacing={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Preferred Date & Time (CT)"
                  value={selectedDateTime}
                  onChange={setSelectedDateTime}
                  minDate={new Date()}
                  maxDate={addDays(new Date(), 30)}
                  shouldDisableDate={shouldDisableDate}
                  shouldDisableTime={shouldDisableTime}
                  minTime={minTime}
                  maxTime={maxTime}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    }
                  }}
                />
              </LocalizationProvider>

              <Box>
                <input
                  type="file"
                  multiple
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".doc,.docx,.pdf,.png,.jpg,.jpeg"
                />
                <Button
                  variant="outlined"
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ mb: 1 }}
                >
                  Upload Documents
                </Button>
                {files.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Selected Files:
                    </Typography>
                    {files.map((file, index) => (
                      <Typography key={index} variant="body2" color="text.secondary">
                        • {file.name}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>
            </Stack>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Additional Information"
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            sx={{ mb: 2 }}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting}
        >
          Submit Request
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VideoCallRequest;
