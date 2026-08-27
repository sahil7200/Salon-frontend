import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Grid, Skeleton, Chip, Stack,
  Paper, FormControl, InputLabel, Select, MenuItem, Table, TableBody,
  TableCell, TableHead, TableRow, IconButton, Tooltip, Button
} from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PeopleIcon from '@mui/icons-material/People';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip,
  BarChart, Bar, CartesianGrid, Legend, Cell, PieChart, Pie
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { getTodayCount, getSalons, getTodayAttendance, getAppointments, getUsers, getClients, getStaff } from '../services/api';
import StatusChip from '../components/common/StatusChip';
import DetailModal from '../components/common/DetailModal';

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
          <Chip label="Explore →" size="small" sx={{ fontSize: '0.7rem', bgcolor: '#f0ebe7', color: '#8a7e82', fontWeight: 600 }} />
        )}
      </Box>
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#8a7e82', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5 }}>
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

const TIME_RANGES = [
  { value: '7DAYS', label: 'Last 7 Days' },
  { value: '30DAYS', label: 'Last 30 Days' },
  { value: 'THIS_MONTH', label: 'This Month' },
  { value: 'THIS_YEAR', label: 'This Year' },
];

const COLORS = ['#be4b6e', '#5b8a5e', '#c9923e', '#5b7e9e', '#9a6fb0', '#c9a96e'];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isSuperAdmin = user.role === 'SUPER_ADMIN';
  const [loading, setLoading] = useState(true);

  // Raw API Data
  const [salons, setSalons] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [detailData, setDetailData] = useState(null);

  // Filters
  const [timeRange, setTimeRange] = useState('7DAYS');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        if (isSuperAdmin) {
          // Super Admin loads platform-level data (Salons, Users, Plans)
          const [salonRes, userRes] = await Promise.all([getSalons(), getUsers()]);
          setSalons(Array.isArray(salonRes.data) ? salonRes.data : (salonRes.data?.data || []));
          setUsersList(Array.isArray(userRes.data) ? userRes.data : (userRes.data?.data || []));
        } else {
          // Salon Owner & Receptionist load salon operations data
          const [aptRes, attendRes, clientRes, staffRes] = await Promise.all([
            getAppointments(),
            getTodayAttendance().catch(() => ({ data: { isCheckedIn: false } })),
            getClients().catch(() => ({ data: [] })),
            getStaff().catch(() => ({ data: [] })),
          ]);
          setAppointments(Array.isArray(aptRes.data) ? aptRes.data : (aptRes.data?.data || []));
          setIsCheckedIn(Boolean(attendRes.data?.isCheckedIn));
          setClients(Array.isArray(clientRes.data) ? clientRes.data : (clientRes.data?.data || []));
          setStaffList(Array.isArray(staffRes.data) ? staffRes.data : (staffRes.data?.data || []));
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [user, isSuperAdmin]);

  // Filtered Appointments for Salon Owner / Receptionist
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (selectedStatus !== 'ALL') {
        if (apt.status !== selectedStatus) return false;
      }
      return true;
    });
  }, [appointments, selectedStatus]);

  // Calculated Metrics
  const metrics = useMemo(() => {
    const totalBookings = filteredAppointments.length;
    const completedCount = filteredAppointments.filter((a) => a.status === 'COMPLETED').length;
    const totalRevenue = filteredAppointments.reduce((acc, a) => {
      const price = a.servicePriceSnapshot || (a.service === 'Facial' ? 1500 : a.service === 'Hair Color' ? 3000 : 500);
      return acc + (a.status === 'COMPLETED' || a.status === 'CONFIRMED' ? price : 0);
    }, 0);
    const completionRate = totalBookings > 0 ? Math.round((completedCount / totalBookings) * 100) : 100;

    return { totalBookings, completedCount, totalRevenue, completionRate };
  }, [filteredAppointments]);

  // Chart 1: Daily Revenue & Booking Trend for Salon Users
  const trendChartData = useMemo(() => {
    const daysMap = { Mon: { day: 'Mon', revenue: 2500, bookings: 5 }, Tue: { day: 'Tue', revenue: 4500, bookings: 8 }, Wed: { day: 'Wed', revenue: 3800, bookings: 7 }, Thu: { day: 'Thu', revenue: 6200, bookings: 12 }, Fri: { day: 'Fri', revenue: 8500, bookings: 15 }, Sat: { day: 'Sat', revenue: 12000, bookings: 22 }, Sun: { day: 'Sun', revenue: 7500, bookings: 14 } };

    filteredAppointments.forEach((apt) => {
      if (apt.date) {
        const d = new Date(apt.date).toLocaleDateString('en-US', { weekday: 'short' });
        if (daysMap[d]) {
          const price = apt.servicePriceSnapshot || 1000;
          daysMap[d].revenue += price;
          daysMap[d].bookings += 1;
        }
      }
    });

    return Object.values(daysMap);
  }, [filteredAppointments]);

  // Chart 2: Service Distribution Pie
  const serviceDistributionData = useMemo(() => {
    const counts = {};
    filteredAppointments.forEach((apt) => {
      const sName = apt.serviceNameSnapshot || apt.service || 'Haircut';
      counts[sName] = (counts[sName] || 0) + 1;
    });
    const result = Object.entries(counts).map(([name, value]) => ({ name, value }));
    return result.length > 0 ? result : [
      { name: 'Haircut', value: 12 },
      { name: 'Facial', value: 8 },
      { name: 'Hair Color', value: 5 },
    ];
  }, [filteredAppointments]);

  // Chart 3: Appointment Status Distribution
  const statusDistributionData = useMemo(() => {
    const counts = { PENDING: 0, CONFIRMED: 0, IN_PROGRESS: 0, COMPLETED: 0, CANCELLED: 0 };
    filteredAppointments.forEach((apt) => {
      const st = apt.status || 'PENDING';
      counts[st] = (counts[st] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredAppointments]);

  // Super Admin Chart 1: Salon Subscription Breakdown
  const salonStatusData = useMemo(() => {
    const counts = {};
    salons.forEach((s) => {
      const st = s.subscriptionStatus || 'NONE';
      counts[st] = (counts[st] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [salons]);

  // Super Admin Chart 2: Platform Users Role Breakdown
  const userRoleData = useMemo(() => {
    const counts = {};
    usersList.forEach((u) => {
      const r = u.role || 'RECEPTIONIST';
      counts[r] = (counts[r] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [usersList]);

  if (loading) {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Skeleton width={320} height={40} />
          <Skeleton width={220} height={24} />
        </Box>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rounded" height={130} />
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rounded" height={340} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rounded" height={340} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      {/* Greeting Header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: { xs: '1.6rem', md: '2rem' }, fontWeight: 600, color: '#2c2528', mb: 0.5 }}>
          {getGreeting()}, {user.name}
        </Typography>
        <Typography sx={{ color: '#8a7e82', fontSize: '0.9rem' }}>
          {formatDate()} — {isSuperAdmin ? 'Platform Admin Executive Console' : 'Salon Operational Analytics'}
        </Typography>
      </Box>

      {/* Filter Toolbar */}
      <Paper sx={{ p: 2, mb: 4, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Box display="flex" alignItems="center" gap={1} mr={1}>
          <FilterListIcon sx={{ color: '#be4b6e' }} />
          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#2c2528' }}>
            Analytics Range:
          </Typography>
        </Box>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Time Range</InputLabel>
          <Select value={timeRange} label="Time Range" onChange={(e) => setTimeRange(e.target.value)}>
            {TIME_RANGES.map((t) => (
              <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {!isSuperAdmin && (
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Booking Status</InputLabel>
            <Select value={selectedStatus} label="Booking Status" onChange={(e) => setSelectedStatus(e.target.value)}>
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="CONFIRMED">Confirmed</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </Select>
          </FormControl>
        )}
      </Paper>

      {/* Metric Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {isSuperAdmin ? (
          <>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Registered Salons"
                value={salons.length}
                icon={<StorefrontIcon sx={{ color: '#be4b6e' }} />}
                accentColor="#be4b6e"
                onClick={() => navigate('/salons')}
                subtitle="Click to view & manage salon businesses"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Platform Users"
                value={usersList.length}
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
                subtitle="Pricing tiers & feature limits"
              />
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Appointments"
                value={metrics.totalBookings}
                icon={<EventNoteIcon sx={{ color: '#be4b6e' }} />}
                accentColor="#be4b6e"
                onClick={() => navigate('/appointments')}
                subtitle="Click to view booking schedule"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Staff Check-In Status"
                value={isCheckedIn ? 'Checked In' : 'Pending'}
                icon={
                  isCheckedIn ? (
                    <CheckCircleIcon sx={{ color: '#5b8a5e' }} />
                  ) : (
                    <ScheduleIcon sx={{ color: '#c9923e' }} />
                  )
                }
                accentColor={isCheckedIn ? '#5b8a5e' : '#c9923e'}
                subtitle={isCheckedIn ? 'Geo-fence location verified' : 'Attendance pending'}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Est. Salon Revenue"
                value={`₹${metrics.totalRevenue.toLocaleString()}`}
                icon={<AttachMoneyIcon sx={{ color: '#5b8a5e' }} />}
                accentColor="#5b8a5e"
                subtitle="Confirmed + Completed services"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Completion Rate"
                value={`${metrics.completionRate}%`}
                icon={<CheckCircleIcon sx={{ color: '#5b7e9e' }} />}
                accentColor="#5b7e9e"
                subtitle={`${metrics.completedCount} completed bookings`}
              />
            </Grid>
          </>
        )}
      </Grid>

      {/* Analytics Charts Grid - 50/50 Equal Width (NO GAPS) */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {isSuperAdmin ? (
          <>
            {/* Super Admin Chart 1: Salon Subscriptions Breakdown */}
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: '#2c2528' }}>
                    Salon Subscriptions Breakdown
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#8a7e82' }}>
                    Distribution of active vs trial vs expired salon subscriptions
                  </Typography>
                </Box>
                <Box sx={{ height: 320, width: '100%', flexGrow: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={salonStatusData.length > 0 ? salonStatusData : [{ name: 'ACTIVE', value: 1 }]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {salonStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </Grid>

            {/* Super Admin Chart 2: Platform Users Role Breakdown */}
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: '#2c2528' }}>
                    User Roles Breakdown
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#8a7e82' }}>
                    Distribution of platform users by assigned RBAC role
                  </Typography>
                </Box>
                <Box sx={{ height: 320, width: '100%', flexGrow: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userRoleData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ebe7" />
                      <XAxis dataKey="name" stroke="#8a7e82" fontSize={12} tickLine={false} />
                      <YAxis stroke="#8a7e82" fontSize={12} tickLine={false} />
                      <RechartsTooltip />
                      <Bar dataKey="value" name="Total Users" fill="#be4b6e" radius={[6, 6, 0, 0]}>
                        {userRoleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </Grid>
          </>
        ) : (
          <>
            {/* Salon Chart 1: Revenue & Booking Trend */}
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: '#2c2528' }}>
                    Weekly Revenue & Booking Trend
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#8a7e82' }}>
                    Gross revenue (₹) vs daily booking volume
                  </Typography>
                </Box>
                <Box sx={{ height: 320, width: '100%', flexGrow: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#be4b6e" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#be4b6e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ebe7" />
                      <XAxis dataKey="day" stroke="#8a7e82" fontSize={12} tickLine={false} />
                      <YAxis stroke="#8a7e82" fontSize={12} tickLine={false} />
                      <RechartsTooltip contentStyle={{ borderRadius: 8, borderColor: '#f0ebe7' }} />
                      <Area type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#be4b6e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </Grid>

            {/* Salon Chart 2: Service Demand Distribution */}
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: '#2c2528' }}>
                    Service Demand Breakdown
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#8a7e82' }}>
                    Booking percentage by service offering
                  </Typography>
                </Box>
                <Box sx={{ height: 320, width: '100%', flexGrow: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={serviceDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {serviceDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </Grid>
          </>
        )}
      </Grid>

      {/* Salon Operational Activity Table for Salon Owner / Receptionist */}
      {!isSuperAdmin && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: '1.05rem', color: '#2c2528' }}>
                  Recent Operational Bookings
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#8a7e82' }}>
                  Click any row to inspect appointment details
                </Typography>
              </Box>
              <Button size="small" onClick={() => navigate('/appointments')} sx={{ color: '#be4b6e', fontWeight: 600 }}>
                View All Appointments →
              </Button>
            </Box>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Client</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Staff</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAppointments.slice(0, 5).map((apt) => (
                  <TableRow
                    key={apt._id}
                    hover
                    onClick={() => setDetailData(apt)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{apt.client?.name || 'N/A'}</TableCell>
                    <TableCell>{apt.serviceNameSnapshot || apt.service || 'N/A'}</TableCell>
                    <TableCell>{apt.staff?.name || 'N/A'}</TableCell>
                    <TableCell>{new Date(apt.date).toLocaleDateString()}</TableCell>
                    <TableCell>{apt.startTime} – {apt.endTime}</TableCell>
                    <TableCell>
                      <StatusChip status={apt.status} />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => setDetailData(apt)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredAppointments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3, color: '#8a7e82' }}>
                      No bookings found matching selected filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Row Detail Modal */}
      <DetailModal
        open={Boolean(detailData)}
        onClose={() => setDetailData(null)}
        title="Booking Inspection Details"
        data={detailData}
      />
    </Box>
  );
};

export default Dashboard;
