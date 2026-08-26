import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, LinearProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { getSalons } from '../services/api';
import PageHeader from '../components/common/PageHeader';
import StatusChip from '../components/common/StatusChip';

const SubscriptionStatus = () => {
  const [salon, setSalon] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getSalons();
        if (data.length > 0) setSalon(data[0]);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  if (!salon) {
    return <Typography sx={{ color: '#8a7e82', p: 2 }}>Loading...</Typography>;
  }

  const isActive = salon.subscriptionStatus === 'ACTIVE';
  const totalDays = salon.currentPlan?.durationInDays || 30;
  const daysLeft = isActive && salon.subscriptionEndDate
    ? Math.max(0, Math.ceil((new Date(salon.subscriptionEndDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;
  const progress = isActive ? ((totalDays - daysLeft) / totalDays) * 100 : 100;

  const InfoRow = ({ label, value }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: '1px solid #f0ebe7' }}>
      <Typography sx={{ fontSize: '0.85rem', color: '#8a7e82', fontWeight: 500 }}>{label}</Typography>
      <Typography sx={{ fontSize: '0.9rem', color: '#2c2528', fontWeight: 500 }}>{value}</Typography>
    </Box>
  );

  return (
    <Box>
      <PageHeader title="Subscription Status" subtitle="Your current plan details" />

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              {/* Status header */}
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    bgcolor: isActive ? '#e8f0e8' : '#fce8e8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isActive
                    ? <CheckCircleIcon sx={{ fontSize: 26, color: '#5b8a5e' }} />
                    : <CancelIcon sx={{ fontSize: 26, color: '#c45c5c' }} />}
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontFamily: '"Playfair Display", Georgia, serif',
                      fontSize: '1.1rem',
                      fontWeight: 500,
                      color: '#2c2528',
                    }}
                  >
                    {isActive ? 'Active Subscription' : 'No Active Subscription'}
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <StatusChip status={salon.subscriptionStatus} />
                  </Box>
                </Box>
              </Box>

              {/* Plan details */}
              <InfoRow label="Plan" value={salon.currentPlan?.name || 'No Plan'} />
              <InfoRow label="Price" value={`₹${salon.currentPlan?.price?.toLocaleString() || 'N/A'}`} />
              <InfoRow
                label="Start Date"
                value={salon.subscriptionStartDate
                  ? new Date(salon.subscriptionStartDate).toLocaleDateString()
                  : 'N/A'}
              />
              <InfoRow
                label="End Date"
                value={salon.subscriptionEndDate
                  ? new Date(salon.subscriptionEndDate).toLocaleDateString()
                  : 'N/A'}
              />

              {/* Days remaining with progress */}
              {isActive && (
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontSize: '0.82rem', color: '#8a7e82', fontWeight: 500 }}>
                      Days Remaining
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: daysLeft < 7 ? '#c45c5c' : '#5b8a5e',
                      }}
                    >
                      {daysLeft} days
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(progress, 100)}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: '#f0ebe7',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        bgcolor: daysLeft < 7 ? '#c45c5c' : '#5b8a5e',
                      },
                    }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SubscriptionStatus;
