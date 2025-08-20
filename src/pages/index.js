import { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Fab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EmailSidebar from '../components/EmailSidebar';
import EmailDetail from '../components/EmailDetail';
import ComposeDialog from '../components/ComposeDialog';
import AiPromptDialog from '../components/AiPromptDialog';
import emailService from '../services/emailService';
import aiService from '../services/aiService';


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

  const fetchEmails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await emailService.fetchEmails();
      
      if (result.success) {
        setEmails(result.data);
      } else {
        setError('Failed to load emails.');
        console.error('Failed to fetch emails:', err);
      }
    } catch (err) {
      console.error('Failed to fetch emails:', err);
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
    setValidationErrors({});
    setCompose({
      to: '',
      cc: '',
      bcc: '',
      subject: '',
      body: ''
    });
  };

  const handleSend = async () => {
    setValidationErrors({});
    
    try {

      const result = await emailService.sendEmail(compose);

      if (result.success) {
        setCompose({
          to: '',
          cc: '',
          bcc: '',
          subject: '',
          body: ''
        });
        setValidationErrors({});
        setComposeOpen(false);
        await fetchEmails();
        
      } else {
        if (result.validationErrors) {
          setValidationErrors(result.validationErrors);
        } else {
          setError(result.error);
        }
      }
      
    } catch (err) {
      console.error('Failed to send email:', err);
      setError('Failed to send email. Please try again.');
    }
  };


  async function handleAiGenerate() {
    setIsGenerating(true);
    try {
      const result = await aiService.handleAiGenerate(aiPrompt);
      
      if (result.success) {
        setCompose((c) => ({ 
          ...c, 
          subject: result.data.subject, 
          body: result.data.body 
        }));
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('AI generation error:', err);
      setError('Failed to generate email with AI');
    } finally {
      setIsGenerating(false);
      setAiPromptOpen(false);
      setAiPrompt(''); 
    }
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', flex: 1, height: '100%', pt: 0 }}>
        <EmailSidebar
          emails={emails}
          loading={loading}
          error={error}
          selectedId={selectedId}
          onEmailSelect={setSelectedId}
        />

        <EmailDetail
          selectedEmail={selectedEmail}
          loading={loading}
          emails={emails}
        />

        <Fab
          color="primary"
          sx={{ position: 'fixed', right: 24, bottom: 24 }}
          onClick={handleOpenCompose}
          aria-label="compose"
        >
          <AddIcon />
        </Fab>

        <ComposeDialog
          open={composeOpen}
          onClose={handleCloseCompose}
          compose={compose}
          setCompose={setCompose}
          validationErrors={validationErrors}
          setValidationErrors={setValidationErrors}
          onSend={handleSend}
          isGenerating={isGenerating}
          onAiPromptOpen={() => setAiPromptOpen(true)}
        />

        <AiPromptDialog
          open={aiPromptOpen}
          onClose={() => setAiPromptOpen(false)}
          aiPrompt={aiPrompt}
          setAiPrompt={setAiPrompt}
          onGenerate={handleAiGenerate}
          isGenerating={isGenerating}
        />
      </Box>
    </Box>
  );
}
