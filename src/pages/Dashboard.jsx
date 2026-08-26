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
        variant="h3"
        sx={{
          fontFamily: '"DM Sans", sans-serif',
          fontWeight: 700,
          fontSize: '2rem',
          color: '#2c2528',
          lineHeight: 1,
          mb: 0.5,
        }}
      >
        {value}
      </Typography>
      <Typography
        sx={{
          fontSize: '0.82rem',
          color: '#8a7e82',
          fontWeight: 500,
          letterSpacing: '0.01em',
        }}
      >
        {title}
      </Typography>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        if (user.role === 'SUPER_ADMIN') {
          const { data: salons } = await getSalons();
          setStats({ totalSalons: salons.length });
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
            fontSize: { xs: '1.5rem', md: '1.8rem' },
            fontWeight: 500,
            color: '#2c2528',
            lineHeight: 1.3,
          }}
        >
          {getGreeting()}, {user.name}
        </Typography>
        <Typography
          sx={{
            fontSize: '0.85rem',
            color: '#8a7e82',
            mt: 0.5,
            fontWeight: 400,
          }}
        >
          {formatDate()}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {user.role === 'SUPER_ADMIN' && (
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Registered Salons"
              value={stats?.totalSalons ?? 0}
              icon={<StorefrontIcon sx={{ fontSize: 22, color: '#5b7e9e' }} />}
              accentColor="#5b7e9e"
              bgTint="#e6eef4"
            />
          </Grid>
        )}

        {user.role !== 'SUPER_ADMIN' && (
          <>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Today's Appointments"
                value={stats?.todayAppointments ?? 0}
                icon={<EventNoteIcon sx={{ fontSize: 22, color: '#be4b6e' }} />}
                accentColor="#be4b6e"
                bgTint="rgba(190,75,110,0.08)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
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
                        bgcolor: stats?.isCheckedIn ? '#e8f0e8' : '#fdf3e4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {stats?.isCheckedIn
                        ? <CheckCircleIcon sx={{ fontSize: 22, color: '#5b8a5e' }} />
                        : <ScheduleIcon sx={{ fontSize: 22, color: '#c9923e' }} />}
                    </Box>
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontWeight: 700,
                      fontSize: '1.15rem',
                      color: stats?.isCheckedIn ? '#5b8a5e' : '#c9923e',
                      lineHeight: 1.2,
                      mb: 0.5,
                    }}
                  >
                    {stats?.isCheckedIn ? 'Checked In' : 'Not Checked In'}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.82rem',
                      color: '#8a7e82',
                      fontWeight: 500,
                    }}
                  >
                    Attendance Status
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;
