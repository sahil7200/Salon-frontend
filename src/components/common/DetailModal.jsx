import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Divider, Grid } from '@mui/material';
import StatusChip from './StatusChip';

const DetailModal = ({ open, onClose, title = 'Details', data }) => {
  if (!data) return null;

  const renderValue = (val, key) => {
    if (val == null) return 'N/A';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (typeof val === 'object') {
      if (val.name) return val.name;
      if (val.email) return `${val.name || ''} (${val.email})`;
      return JSON.stringify(val);
    }
    if (key.toLowerCase().includes('date') || key.toLowerCase().includes('at')) {
      const parsed = new Date(val);
      if (!isNaN(parsed.getTime())) return parsed.toLocaleString();
    }
    if (key.toLowerCase().includes('status') || key === 'role' || key === 'action') {
      return <StatusChip status={String(val)} />;
    }
    return String(val);
  };

  const formatKey = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/Id$/, ' ID');
  };

  const entries = Object.entries(data).filter(
    ([k]) => !['__v', 'password', 'tokens'].includes(k)
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, fontFamily: '"Playfair Display", Georgia, serif', fontSize: '1.25rem' }}>
        {title}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          {entries.map(([key, value]) => (
            <Grid item xs={12} sm={6} key={key}>
              <Typography sx={{ fontSize: '0.75rem', color: '#8a7e82', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {formatKey(key)}
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Typography sx={{ fontSize: '0.9rem', color: '#2c2528', fontWeight: 500, wordBreak: 'break-word' }}>
                  {renderValue(value, key)}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained" sx={{ bgcolor: '#be4b6e' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DetailModal;
