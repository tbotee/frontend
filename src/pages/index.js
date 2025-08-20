import { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  Stack,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EmailSidebar from '../components/EmailSidebar';
import EmailDetail from '../components/EmailDetail';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';


export default function Home() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  
  const [selectedId, setSelectedId] = useState(null);
  const selectedEmail = useMemo(
    () => {
      if (emails.length === 0) return null;
      return emails.find((e) => e.id === selectedId) ?? null;
    },
    [selectedId, emails]
  );

  const [composeOpen, setComposeOpen] = useState(false);
  const [aiPromptOpen, setAiPromptOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  const [compose, setCompose] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
  });

  // Fetch emails from backend
  const fetchEmails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${backendUrl}/emails`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const jsoResponse = await response.json();

      if (!jsoResponse.success) {
        throw new Error(`Something went wrong fetching the emails: ${jsoResponse}`);
      }
      setEmails(jsoResponse.data);
      
      // if (jsoResponse.data.length > 0 && !selectedId) {
      //   setSelectedId(jsoResponse.data[0].id);
      // }
    } catch (err) {
      console.error('Failed to fetch emails:', err);
      setError('Failed to load emails.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const handleOpenCompose = () => setComposeOpen(true);
  const handleCloseCompose = () => {
    setComposeOpen(false);
    setIsGenerating(false);
    setValidationErrors({}); // Clear validation errors when closing
  };

  // Email validation helper function
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateEmailList = (emailList) => {
    if (!emailList.trim()) return true; // Empty is valid
    const emails = emailList.split(',').map(email => email.trim());
    return emails.every(email => validateEmail(email));
  };

  const handleSend = async () => {
    setValidationErrors({});
    
    const errors = {};
    
    if (!compose.to.trim() || !validateEmail(compose.to.trim())) {
      errors.to = 'To field is required and must be a valid email';
    }

    if (!validateEmailList(compose.cc)) {
      errors.cc = 'CC must contain valid email addresses separated by commas';
    }

    if (!validateEmailList(compose.bcc)) {
      errors.bcc = 'BCC must contain valid email addresses separated by commas';
    }
    
    if (!compose.subject.trim()) {
      errors.subject = 'Subject is required';
    }
    
    if (!compose.body.trim()) {
      errors.body = 'Body is required';
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    try {
      const response = await fetch(`${backendUrl}/emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(compose)
      });

      if (!response.ok) {
        throw new Error(`Failed to send email: ${response.status}`);
      }

      // Reset compose form
      setCompose({
        to: '',
        cc: '',
        bcc: '',
        subject: '',
        body: ''
      });

      // Refresh email list to show the new email
      await fetchEmails();

      setComposeOpen(false);
    } catch (err) {
      console.error('Failed to send email:', err);
      setError('Failed to send email. Please try again.');
    }
  };


  async function getAssistantType() {
    const routeResult = await fetch('/api/ai/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: aiPrompt }),
    });

    const routeAssistant = await routeResult.json();
    return routeAssistant.assistant;
  }

  async function getEmail(assistantType, aiPrompt){
    const emailResult = await fetch(`/api/ai/generate?assistant=${assistantType}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: aiPrompt }),
    });

    const email = await emailResult.json();

    setCompose((c) => ({ 
      ...c, 
      subject: email.subject || '', 
      body: email.body || '' 
    }));
  }



  async function handleAiGenerate() {
    setIsGenerating(true);
    try {
      const assistantType = await getAssistantType();
      if (assistantType === 'sales' || assistantType === 'followup') {
        await getEmail(assistantType, aiPrompt);
      } else {
        setError('Invalid assistant type');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
      setAiPromptOpen(false);
      setAiPrompt(''); 
    }
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', flex: 1, height: '100%', pt: 0 }}>
        {/* Sidebar */}
        <EmailSidebar
          emails={emails}
          loading={loading}
          error={error}
          selectedId={selectedId}
          onEmailSelect={setSelectedId}
        />

        {/* Detail pane */}
        <EmailDetail
          selectedEmail={selectedEmail}
          loading={loading}
          emails={emails}
        />

        {/* Compose FAB */}
        <Fab
          color="primary"
          sx={{ position: 'fixed', right: 24, bottom: 24 }}
          onClick={handleOpenCompose}
          aria-label="compose"
        >
          <AddIcon />
        </Fab>

        {/* Compose dialog */}
        <Dialog open={composeOpen} onClose={handleCloseCompose} fullWidth maxWidth="md">
          <DialogTitle>
            New message
            <Button
              size="small"
              startIcon={<AutoAwesomeIcon />}
              sx={{ ml: 2 }}
              onClick={() => setAiPromptOpen(true)}
              disabled={isGenerating}
            >
              AI ✨
            </Button>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="To"
                value={compose.to}
                onChange={(e) => {
                  setCompose({ ...compose, to: e.target.value });
                  if (validationErrors.to) {
                    setValidationErrors(prev => ({ ...prev, to: undefined }));
                  }
                }}
                size="small"
                fullWidth
                error={!!validationErrors.to}
                helperText={validationErrors.to}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="CC"
                  value={compose.cc}
                  onChange={(e) => {
                    setCompose({ ...compose, cc: e.target.value });
                    if (validationErrors.cc) {
                      setValidationErrors(prev => ({ ...prev, cc: undefined }));
                    }
                  }}
                  size="small"
                  fullWidth
                  error={!!validationErrors.cc}
                  helperText={validationErrors.cc}
                />
                <TextField
                  label="BCC"
                  value={compose.bcc}
                  onChange={(e) => {
                    setCompose({ ...compose, bcc: e.target.value });
                    if (validationErrors.bcc) {
                      setValidationErrors(prev => ({ ...prev, bcc: undefined }));
                    }
                  }}
                  size="small"
                  fullWidth
                  error={!!validationErrors.bcc}
                  helperText={validationErrors.bcc}
                />
              </Stack>
              <TextField
                label="Subject"
                value={compose.subject}
                onChange={(e) => {
                  setCompose({ ...compose, subject: e.target.value });
                  if (validationErrors.subject) {
                    setValidationErrors(prev => ({ ...prev, subject: undefined }));
                  }
                }}
                size="small"
                fullWidth
                error={!!validationErrors.subject}
                helperText={validationErrors.subject}
              />
              <TextField
                label="Body"
                value={compose.body}
                onChange={(e) => {
                  setCompose({ ...compose, body: e.target.value });
                  if (validationErrors.body) {
                    setValidationErrors(prev => ({ ...prev, body: undefined }));
                  }
                }}
                minRows={8}
                multiline
                fullWidth
                error={!!validationErrors.body}
                helperText={validationErrors.body}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCompose}>Close</Button>
            <Button variant="contained" onClick={handleSend} disabled={isGenerating}>Send</Button>
          </DialogActions>
        </Dialog>

        {/* AI prompt dialog */}
        <Dialog open={aiPromptOpen} onClose={() => setAiPromptOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Describe the email</DialogTitle>
          <DialogContent dividers>
            <TextField
              autoFocus
              placeholder="e.g., Meeting request for Tuesday"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              multiline
              minRows={3}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAiPromptOpen(false)} disabled={isGenerating}>Cancel</Button>
            <Button onClick={handleAiGenerate} variant="contained" disabled={!aiPrompt || isGenerating}>
              {isGenerating ? 'Generating…' : 'Generate'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
