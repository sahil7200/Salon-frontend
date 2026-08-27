import { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Button, Chip, Stack, Alert,
  Paper, Divider, Skeleton
} from '@mui/material';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import PageHeader from '../components/common/PageHeader';
import StatusChip from '../components/common/StatusChip';
import { getSalons, getPlans, requestSubscription } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SubscriptionStatus = () => {
  const { user } = useAuth();
  const [salon, setSalon] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingPlanId, setSubmittingPlanId] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const loadSubscriptionData = useCallback(async () => {
    try {
      setLoading(true);
      const [salonRes, planRes] = await Promise.all([
        getSalons(),
        getPlans(),
      ]);

      const salonList = Array.isArray(salonRes.data) ? salonRes.data : (salonRes.data?.data || []);
      const mySalon = salonList.find((s) => s.ownerId?._id === user.id || s._id === user.salonId) || salonList[0];
      setSalon(mySalon || null);

      const planList = Array.isArray(planRes.data) ? planRes.data : (planRes.data?.data || []);
      setPlans(planList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadSubscriptionData(); }, [loadSubscriptionData]);

  const handleRequestPlan = async (plan) => {
    setSubmittingPlanId(plan._id);
    setError('');
    setSuccess('');
    try {
      const res = await requestSubscription(plan._id);
      setSuccess(res.data?.message || `Subscription request for ${plan.name} submitted successfully!`);
      loadSubscriptionData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit subscription request');
    } finally {
      setSubmittingPlanId(null);
    }
  };

  if (loading) {
    return (
      <Box>
        <Skeleton width={300} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={160} sx={{ mb: 4 }} />
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} md={4} key={i}>
              <Skeleton variant="rounded" height={280} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  const daysRemaining = salon?.subscriptionEndDate
    ? Math.max(0, Math.ceil((new Date(salon.subscriptionEndDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <Box>
      <PageHeader
        title="Salon Subscription & Pricing Plans"
        subtitle="Manage your salon's active plan, request plan upgrades, and view limits"
      />

      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Pending Plan Request Alert Banner */}
      {salon?.pendingPlan && (
        <Paper
          sx={{
            p: 3,
            mb: 4,
            bgcolor: '#fdf3e4',
            border: '1px solid #c9923e',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <HourglassEmptyIcon sx={{ color: '#c9923e', fontSize: 32 }} />
          <Box flexGrow={1}>
            <Typography sx={{ fontWeight: 600, color: '#c9923e', fontSize: '1rem' }}>
              Subscription Request Pending Super Admin Approval
            </Typography>
            <Typography sx={{ fontSize: '0.85rem', color: '#2c2528', mt: 0.5 }}>
              You requested the <strong>{salon.pendingPlan.name}</strong> plan (₹{salon.pendingPlan.price} / {salon.pendingPlan.durationInDays} days). Status: <Chip label="PENDING_APPROVAL" size="small" color="warning" sx={{ fontWeight: 600 }} />
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Current Active Plan Overview Card */}
      {salon && (
        <Card sx={{ mb: 4, borderLeft: '5px solid #be4b6e' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                  <CardMembershipIcon sx={{ color: '#be4b6e', fontSize: 28 }} />
                  <Typography sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '1.4rem', fontWeight: 600 }}>
                    {salon.currentPlan?.name || 'No Plan Active'}
                  </Typography>
                  <StatusChip status={salon.subscriptionStatus} />
                </Stack>
                <Typography sx={{ color: '#8a7e82', fontSize: '0.875rem' }}>
                  Salon: <strong>{salon.name}</strong> | Registered Address: {salon.address || 'N/A'}
                </Typography>
              </Box>

              <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Typography sx={{ fontSize: '0.78rem', color: '#8a7e82', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Days Remaining
                </Typography>
                <Typography sx={{ fontSize: '1.8rem', fontWeight: 700, color: daysRemaining < 7 ? '#c45c5c' : '#5b8a5e' }}>
                  {daysRemaining} Days
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <Typography sx={{ fontSize: '0.75rem', color: '#8a7e82' }}>START DATE</Typography>
                <Typography sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
                  {salon.subscriptionStartDate ? new Date(salon.subscriptionStartDate).toLocaleDateString() : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography sx={{ fontSize: '0.75rem', color: '#8a7e82' }}>EXPIRATION DATE</Typography>
                <Typography sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
                  {salon.subscriptionEndDate ? new Date(salon.subscriptionEndDate).toLocaleDateString() : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography sx={{ fontSize: '0.75rem', color: '#8a7e82' }}>MAX STAFF LIMIT</Typography>
                <Typography sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
                  {salon.currentPlan?.maxStaff || 5} Members Allowed
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography sx={{ fontSize: '0.75rem', color: '#8a7e82' }}>MAX APPOINTMENTS LIMIT</Typography>
                <Typography sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
                  {salon.currentPlan?.maxAppointments || 100} Bookings Allowed
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Available Plans Catalog */}
      <Typography sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '1.25rem', fontWeight: 600, mb: 2 }}>
        Available Subscription Tiers & Request Upgrade
      </Typography>

      <Grid container spacing={3}>
        {plans.map((p) => {
          const isCurrent = salon?.currentPlan?._id === p._id;
          const isPending = salon?.pendingPlan?._id === p._id;

          return (
            <Grid item xs={12} md={4} key={p._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: isCurrent ? '2px solid #be4b6e' : '1px solid #f0ebe7',
                  position: 'relative',
                }}
              >
                {isCurrent && (
                  <Chip
                    label="Active Plan"
                    color="primary"
                    size="small"
                    sx={{ position: 'absolute', top: 12, right: 12, fontWeight: 600, bgcolor: '#be4b6e' }}
                  />
                )}
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '1.2rem', color: '#2c2528', mb: 1 }}>
                    {p.name}
                  </Typography>
                  <Typography sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '2rem', fontWeight: 700, color: '#be4b6e', mb: 2 }}>
                    ₹{p.price} <Typography component="span" sx={{ fontSize: '0.85rem', color: '#8a7e82' }}>/ {p.durationInDays} days</Typography>
                  </Typography>

                  <Divider sx={{ mb: 2 }} />

                  <Stack spacing={1.5}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CheckCircleIcon sx={{ color: '#5b8a5e', fontSize: 18 }} />
                      <Typography sx={{ fontSize: '0.875rem' }}>Up to <strong>{p.maxStaff}</strong> Staff Members</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CheckCircleIcon sx={{ color: '#5b8a5e', fontSize: 18 }} />
                      <Typography sx={{ fontSize: '0.875rem' }}>Up to <strong>{p.maxAppointments}</strong> Appointments</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CheckCircleIcon sx={{ color: '#5b8a5e', fontSize: 18 }} />
                      <Typography sx={{ fontSize: '0.875rem' }}>Full Client CRM & Analytics</Typography>
                    </Box>
                  </Stack>
                </CardContent>

                <Box sx={{ p: 3, pt: 0 }}>
                  {isCurrent ? (
                    <Button fullWidth disabled variant="outlined">
                      Current Active Plan
                    </Button>
                  ) : isPending ? (
                    <Button fullWidth disabled variant="contained" color="warning">
                      Approval Pending
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<UpgradeIcon />}
                      onClick={() => handleRequestPlan(p)}
                      disabled={submittingPlanId === p._id}
                      sx={{ bgcolor: '#be4b6e' }}
                    >
                      {submittingPlanId === p._id ? 'Submitting...' : 'Request Plan / Upgrade'}
                    </Button>
                  )}
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default SubscriptionStatus;
