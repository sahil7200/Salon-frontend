import { Chip } from '@mui/material';

const STATUS_CONFIG = {
  PENDING: { color: '#c9923e', bg: '#fdf3e4', label: 'Pending' },
  CONFIRMED: { color: '#5b8a5e', bg: '#e8f0e8', label: 'Confirmed' },
  CANCELLED: { color: '#c45c5c', bg: '#fce8e8', label: 'Cancelled' },
  COMPLETED: { color: '#5b7e9e', bg: '#e6eef4', label: 'Completed' },
  ACTIVE: { color: '#5b8a5e', bg: '#e8f0e8', label: 'Active' },
  INACTIVE: { color: '#8a7e82', bg: '#f0ebe7', label: 'Inactive' },
  EXPIRED: { color: '#c45c5c', bg: '#fce8e8', label: 'Expired' },
  NONE: { color: '#8a7e82', bg: '#f0ebe7', label: 'None' },
  ASSIGN: { color: '#5b7e9e', bg: '#e6eef4', label: 'Assign' },
  RENEW: { color: '#c9923e', bg: '#fdf3e4', label: 'Renew' },
  UPGRADE: { color: '#5b8a5e', bg: '#e8f0e8', label: 'Upgrade' },
};

const StatusChip = ({ status = 'PENDING', customLabel }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

  return (
    <Chip
      label={customLabel || config.label}
      size="small"
      sx={{
        bgcolor: config.bg,
        color: config.color,
        fontWeight: 600,
        border: 'none',
      }}
    />
  );
};

export default StatusChip;
