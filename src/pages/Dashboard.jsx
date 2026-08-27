import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Grid, Skeleton, Chip, Stack } from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PeopleIcon from '@mui/icons-material/People';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip,
  BarChart, Bar, CartesianGrid, Legend, Cell, PieChart, Pie
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { getTodayCount, getSalons, getTodayAttendance, getAppointments, getUsers } from '../services/api';

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

const StatCard = ({ title, value, icon, accentColor = '#be4b6e', onClick, subtitle }) => (
  <Card
    onClick={onClick}
    sx={{
      height: '100%',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      '&:hover': onClick
        ? {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          }
        : {},
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            bgcolor: `${accentColor}14`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        {onClick && (
          <Chip label="View details →" size="small" sx={{ fontSize: '0.7rem', bgcolor: '#f0ebe7', color: '#8a7e82' }} />
        )}
      </Box>
      <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#8a7e82', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5 }}>
        {title}
      </Typography>
      <Typography sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '2rem', fontWeight: 600, color: '#2c2528', lineHeight: 1.1 }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography sx={{ fontSize: '0.8rem', color: '#8a7e82', mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const MOCK_TREND_DATA = [
  { day: 'Mon', appointments: 12, completed: 10 },
  { day: 'Tue', appointments: 18, completed: 15 },
  { day: 'Wed', appointments: 15, completed: 14 },
  { day: 'Thu', appointments: 22, completed: 20 },
  { day: 'Fri', appointments: 28, completed: 25 },
  { day: 'Sat', appointments: 35, completed: 32 },
  { day: 'Sun', appointments: 20, completed: 18 },
];

const PIE_COLORS = ['#be4b6e', '#5b8a5e', '#c9923e', '#5b7e9e', '#9a6fb0'];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSalons: 0,
    activeSalons: 0,
    totalUsers: 0,
    todayAppointments: 0,
    isCheckedIn: false,
  });
  const [salonStatusData, setSalonStatusData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        if (user.role === 'SUPER_ADMIN') {
          const [salonRes, userRes] = await Promise.all([getSalons(), getUsers()]);
          const salonList = Array.isArray(salonRes.data) ? salonRes.data : (salonRes.data?.data || []);
          const userList = Array.isArray(userRes.data) ? userRes.data : (userRes.data?.data || []);

          const activeCount = salonList.filter((s) => s.subscriptionStatus === 'ACTIVE' || s.subscriptionStatus === 'TRIAL').length;
          setStats({
            totalSalons: salonList.length,
            activeSalons: activeCount,
            totalUsers: userList.length,
            todayAppointments: 0,
            isCheckedIn: false,
          });

          // Salon status breakdown
          const counts = {};
          salonList.forEach((s) => {
            const st = s.subscriptionStatus || 'NONE';
            counts[st] = (counts[st] || 0) + 1;
          });
          setSalonStatusData(Object.entries(counts).map(([name, value]) => ({ name, value })));
        } else {
          const [countRes, attendRes] = await Promise.all([getTodayCount(), getTodayAttendance()]);
          setStats({
            totalSalons: 0,
            activeSalons: 0,
            totalUsers: 0,
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
      <Box>
        <Box sx={{ mb: 4 }}>
          <Skeleton width={300} height={40} />
          <Skeleton width={200} height={24} />
        </Box>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rounded" height={130} />
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Skeleton variant="rounded" height={320} />
          </Grid>
          <Grid item xs={12} md={5}>
            <Skeleton variant="rounded" height={320} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      {/* Greeting Header */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: { xs: '1.6rem', md: '2rem' }, fontWeight: 600, color: '#2c2528', mb: 0.5 }}>
          {getGreeting()}, {user.name}
        </Typography>
        <Typography sx={{ color: '#8a7e82', fontSize: '0.9rem' }}>
          {formatDate()} — Here is your platform operational overview
        </Typography>
      </Box>

      {/* Metric Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {user.role === 'SUPER_ADMIN' ? (
          <>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Registered Salons"
                value={stats.totalSalons}
                icon={<StorefrontIcon sx={{ color: '#be4b6e' }} />}
                accentColor="#be4b6e"
                onClick={() => navigate('/salons')}
                subtitle={`${stats.activeSalons} Active / Trial Salons`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Platform Users"
                value={stats.totalUsers}
                icon={<PeopleIcon sx={{ color: '#5b7e9e' }} />}
                accentColor="#5b7e9e"
                onClick={() => navigate('/users')}
                subtitle="Owners & Receptionists"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Subscription Plans"
                value="Active"
                icon={<SubscriptionsIcon sx={{ color: '#5b8a5e' }} />}
                accentColor="#5b8a5e"
                onClick={() => navigate('/plans')}
                subtitle="Manage pricing tier packages"
              />
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Today's Appointments"
                value={stats.todayAppointments}
                icon={<EventNoteIcon sx={{ color: '#be4b6e' }} />}
                accentColor="#be4b6e"
                onClick={() => navigate('/appointments')}
                subtitle="Click to view daily booking schedule"
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
                subtitle={stats.isCheckedIn ? 'Location verified' : 'Staff attendance pending'}
              />
            </Grid>
          </>
        )}
      </Grid>

      {/* Analytics Charts */}
      <Grid container spacing={3}>
        {/* Weekly Appointment Trend Chart */}
        <Grid item xs={12} md={user.role === 'SUPER_ADMIN' ? 7 : 12}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: '#2c2528' }}>
                Weekly Appointment Trends
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#8a7e82' }}>
                Bookings vs Completed Services
              </Typography>
            </Box>
            <Box sx={{ height: 280, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorApt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#be4b6e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#be4b6e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ebe7" />
                  <XAxis dataKey="day" stroke="#8a7e82" fontSize={12} tickLine={false} />
                  <YAxis stroke="#8a7e82" fontSize={12} tickLine={false} />
                  <RechartsTooltip contentStyle={{ borderRadius: 8, borderColor: '#f0ebe7' }} />
                  <Area type="monotone" dataKey="appointments" stroke="#be4b6e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorApt)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Salon Status Breakdown Pie Chart for Super Admin */}
        {user.role === 'SUPER_ADMIN' && (
          <Grid item xs={12} md={5}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: '#2c2528' }}>
                  Salon Subscriptions Breakdown
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#8a7e82' }}>
                  Distribution of active vs expired salon subscriptions
                </Typography>
              </Box>
              <Box sx={{ height: 280, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={salonStatusData.length > 0 ? salonStatusData : [{ name: 'ACTIVE', value: 1 }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {salonStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;
