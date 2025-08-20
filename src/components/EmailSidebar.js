import {
  Avatar,
  Box,
  CircularProgress,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function EmailSidebar({ 
  emails, 
  loading, 
  error, 
  selectedId, 
  onEmailSelect 
}) {
  return (
    <Box
      sx={{
        width: 360,
        borderRight: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
      }}>
      
      <Box sx={{ overflowY: 'auto', flex: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="error" align="center">
              {error}
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {emails.map((email) => (
              <ListItem disablePadding key={email.id}>
                <ListItemButton
                  onClick={() => onEmailSelect(email.id)}
                  selected={selectedId === email.id}
                  alignItems="flex-start"
                >
                  <ListItemAvatar>
                    <Avatar>Me</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {email.to}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(email.created_at).toLocaleString()}
                        </Typography>
                      </Stack>
                    }
                    secondary={
                      <>
                        <Typography
                          variant="body2"
                          sx={{ display: 'block', fontWeight: 600 }}
                          noWrap
                        >
                          {email.subject}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {email.body.slice(0, 100)}
                        </Typography>
                      </>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
}
