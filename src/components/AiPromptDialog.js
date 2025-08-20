import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';

export default function AiPromptDialog({
  open,
  onClose,
  aiPrompt,
  setAiPrompt,
  onGenerate,
  isGenerating,
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
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
        <Button onClick={onClose} disabled={isGenerating}>Cancel</Button>
        <Button 
          onClick={onGenerate} 
          variant="contained" 
          disabled={!aiPrompt || isGenerating}
        >
          {isGenerating ? 'Generating…' : 'Generate'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
