import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export default function ComposeDialog({
  open,
  onClose,
  compose,
  setCompose,
  validationErrors,
  setValidationErrors,
  onSend,
  isGenerating,
  onAiPromptOpen,
}) {
  const handleFieldChange = (field, value) => {
    setCompose({ ...compose, [field]: value });
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        New message
        <Button
          size="small"
          startIcon={<AutoAwesomeIcon />}
          sx={{ ml: 2 }}
          onClick={onAiPromptOpen}
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
            onChange={(e) => handleFieldChange('to', e.target.value)}
            size="small"
            fullWidth
            error={!!validationErrors.to}
            helperText={validationErrors.to}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="CC"
              value={compose.cc}
              onChange={(e) => handleFieldChange('cc', e.target.value)}
              size="small"
              fullWidth
              error={!!validationErrors.cc}
              helperText={validationErrors.cc}
            />
            <TextField
              label="BCC"
              value={compose.bcc}
              onChange={(e) => handleFieldChange('bcc', e.target.value)}
              size="small"
              fullWidth
              error={!!validationErrors.bcc}
              helperText={validationErrors.bcc}
            />
          </Stack>
          <TextField
            label="Subject"
            value={compose.subject}
            onChange={(e) => handleFieldChange('subject', e.target.value)}
            size="small"
            fullWidth
            error={!!validationErrors.subject}
            helperText={validationErrors.subject}
          />
          <TextField
            label="Body"
            value={compose.body}
            onChange={(e) => handleFieldChange('body', e.target.value)}
            minRows={8}
            multiline
            fullWidth
            error={!!validationErrors.body}
            helperText={validationErrors.body}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={onSend} disabled={isGenerating}>
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
}
