import {
  Avatar,
  Box,
  Divider,
  Stack,
  Typography,
} from '@mui/material';

export default function EmailDetail({ selectedEmail, loading, emails }) {
  if (selectedEmail) {
    return (
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            {selectedEmail.subject}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Avatar>Me</Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {selectedEmail.to}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(selectedEmail.created_at).toLocaleString()}
              </Typography>
            </Box>
          </Stack>
          <Divider />
        </Box>
        <Box sx={{ px: 3, pb: 3, overflowY: 'auto' }}>
          <Typography variant="body1" paragraph style={{ whiteSpace: "pre-line" }}>
            {selectedEmail.body}
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!loading && emails.length === 0) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No emails found
        </Typography>
      </Box>
    );
  }

  return null;
}
