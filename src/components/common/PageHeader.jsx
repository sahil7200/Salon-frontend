import { Box, Typography, Button } from '@mui/material';

const PageHeader = ({ title, subtitle, actionLabel, actionIcon, onActionClick, onAction }) => {
  const handleAction = onActionClick || onAction;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: '100%',
        mb: 3,
      }}
    >
      <Box>
        <Typography
          sx={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: '1.6rem',
            fontWeight: 500,
            color: '#2c2528',
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontSize: '0.85rem', color: '#8a7e82', mt: 0.4 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {actionLabel && (
        <Button
          variant="contained"
          startIcon={actionIcon}
          onClick={handleAction}
          sx={{
            bgcolor: '#be4b6e',
            px: 2.5,
            py: 1,
            fontWeight: 600,
            '&:hover': { bgcolor: '#9a3a57' },
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default PageHeader;
