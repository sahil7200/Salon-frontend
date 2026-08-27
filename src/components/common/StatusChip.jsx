import { Chip } from '@mui/material';

const STATUS_CONFIG = {
  PENDING: { color: '#c9923e', bg: '#fdf3e4', label: 'Pending' },
  CONFIRMED: { color: '#5b8a5e', bg: '#e8f0e8', label: 'Confirmed' },
  IN_PROGRESS: { color: '#3b82f6', bg: '#eff6ff', label: 'In Progress' },
  COMPLETED: { color: '#5b7e9e', bg: '#e6eef4', label: 'Completed' },
  CANCELLED: { color: '#c45c5c', bg: '#fce8e8', label: 'Cancelled' },
  NO_SHOW: { color: '#6b7280', bg: '#f3f4f6', label: 'No Show' },
  ACTIVE: { color: '#5b8a5e', bg: '#e8f0e8', label: 'Active' },
  TRIAL: { color: '#8b5cf6', bg: '#f5f3ff', label: 'Trial' },
  INACTIVE: { color: '#8a7e82', bg: '#f0ebe7', label: 'Inactive' },
  SUSPENDED: { color: '#d97706', bg: '#fffbeb', label: 'Suspended' },
  CLOSED: { color: '#4b5563', bg: '#f3f4f6', label: 'Closed' },
  EXPIRED: { color: '#c45c5c', bg: '#fce8e8', label: 'Expired' },
  NONE: { color: '#8a7e82', bg: '#f0ebe7', label: 'None' },
  ASSIGN: { color: '#5b7e9e', bg: '#e6eef4', label: 'Assign' },
  RENEW: { color: '#c9923e', bg: '#fdf3e4', label: 'Renew' },
  UPGRADE: { color: '#5b8a5e', bg: '#e8f0e8', label: 'Upgrade' },
  DOWNGRADE: { color: '#6b7280', bg: '#f3f4f6', label: 'Downgrade' },
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
