import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, CircularProgress } from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { useAuth } from '../context/AuthContext';
import { getTodayCount, getSalons, getTodayAttendance } from '../services/api';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const formatDate = () => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

const StatCard = ({ title, value, icon, accentColor = '#be4b6e', bgTint }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            bgcolor: bgTint || `${accentColor}12`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
      <Typography
        sx={{
          fontSize: '0.8rem',
          fontWeight: 600,
          color: '#8a7e82',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          mb: 0.5,
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontSize: '2rem',
          fontWeight: 600,
          color: '#2c2528',
          lineHeight: 1.1,
        }}
      >
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalSalons: 0, todayAppointments: 0, isCheckedIn: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        if (user.role === 'SUPER_ADMIN') {
          const res = await getSalons();
          const salonList = Array.isArray(res.data) ? res.data : (res.data?.data || []);
          setStats({ totalSalons: salonList.length });
        } else {
          const [countRes, attendRes] = await Promise.all([
            getTodayCount(),
            getTodayAttendance(),
          ]);
          setStats({
            todayAppointments: countRes.data.count,
            isCheckedIn: attendRes.data.isCheckedIn,
          });
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
        <CircularProgress sx={{ color: '#be4b6e' }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Greeting header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          sx={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: { xs: '1.6rem', md: '2rem' },
            fontWeight: 600,
            color: '#2c2528',
            mb: 0.5,
          }}
        >
          {getGreeting()}, {user.name}
        </Typography>
        <Typography sx={{ color: '#8a7e82', fontSize: '0.9rem' }}>
          {formatDate()} — Here is your operational overview
        </Typography>
      </Box>

      {/* Metric Cards */}
      <Grid container spacing={3}>
        {user.role === 'SUPER_ADMIN' ? (
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Registered Salons"
              value={stats.totalSalons}
              icon={<StorefrontIcon sx={{ color: '#be4b6e' }} />}
              accentColor="#be4b6e"
            />
          </Grid>
        ) : (
          <>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Today's Appointments"
                value={stats.todayAppointments}
                icon={<EventNoteIcon sx={{ color: '#be4b6e' }} />}
                accentColor="#be4b6e"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Staff Check-In Status"
                value={stats.isCheckedIn ? 'Checked In' : 'Not Checked In'}
                icon={
                  stats.isCheckedIn ? (
                    <CheckCircleIcon sx={{ color: '#5b8a5e' }} />
                  ) : (
                    <ScheduleIcon sx={{ color: '#c9923e' }} />
                  )
                }
                accentColor={stats.isCheckedIn ? '#5b8a5e' : '#c9923e'}
              />
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;
