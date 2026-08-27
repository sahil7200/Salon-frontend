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
        const res = await getSalons();
        const salonList = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        if (salonList.length > 0) setSalon(salonList[0]);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  if (!salon) {
    return <Typography sx={{ color: '#8a7e82', p: 2 }}>Loading subscription details...</Typography>;
  }

  const isActive = salon.subscriptionStatus === 'ACTIVE' || salon.subscriptionStatus === 'TRIAL';
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
      <PageHeader title="Subscription Status" subtitle="Your current plan details & status" />

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
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      color: '#2c2528',
                    }}
                  >
                    {salon.currentPlan?.name || 'No Active Plan'}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <StatusChip status={salon.subscriptionStatus} />
                    {isActive && (
                      <Typography sx={{ fontSize: '0.8rem', color: '#8a7e82' }}>
                        {daysLeft} days remaining
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Progress bar */}
              {isActive && (
                <Box mb={3}>
                  <Box display="flex" justifyContent="space-between" mb={0.75}>
                    <Typography sx={{ fontSize: '0.78rem', color: '#8a7e82' }}>Subscription Period</Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: '#8a7e82', fontWeight: 600 }}>
                      {daysLeft} / {totalDays} days left
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, Math.max(0, progress))}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: '#f0ebe7',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: daysLeft < 5 ? '#c45c5c' : '#be4b6e',
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              )}

              {/* Info list */}
              <InfoRow label="Salon Name" value={salon.name} />
              <InfoRow label="Current Plan" value={salon.currentPlan?.name || 'None'} />
              <InfoRow label="Plan Price" value={salon.currentPlan ? `₹${salon.currentPlan.price}` : 'N/A'} />
              <InfoRow label="Max Staff Allowed" value={salon.currentPlan?.maxStaff || 'N/A'} />
              <InfoRow label="Max Appointments Allowed" value={salon.currentPlan?.maxAppointments || 'N/A'} />
              <InfoRow
                label="Start Date"
                value={salon.subscriptionStartDate ? new Date(salon.subscriptionStartDate).toLocaleDateString() : 'N/A'}
              />
              <InfoRow
                label="End Date"
                value={salon.subscriptionEndDate ? new Date(salon.subscriptionEndDate).toLocaleDateString() : 'N/A'}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SubscriptionStatus;
