import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, Tabs, Tab } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [salonName, setSalonName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        salonName,
        phone,
        address,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left brand panel */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          background: 'linear-gradient(145deg, #2c2528 0%, #3d3235 50%, #4a3a3f 100%)',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          px: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Typography
            sx={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: '2.8rem',
              fontWeight: 600,
              color: '#f0e8e4',
              lineHeight: 1.2,
              mb: 2,
            }}
          >
            Salon CRM
          </Typography>
          <Typography
            sx={{
              fontSize: '0.85rem',
              color: 'rgba(240,232,228,0.45)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            Management Suite
          </Typography>
          <Box sx={{ width: 48, height: 2, bgcolor: '#be4b6e', mx: 'auto', mt: 3 }} />
          <Typography sx={{ fontSize: '0.95rem', color: 'rgba(240,232,228,0.5)', mt: 3, maxWidth: 320 }}>
            Manage appointments, clients, staff, and subscriptions — all in one place.
          </Typography>
        </Box>
      </Box>

      {/* Right form panel */}
      <Box
        sx={{
          flex: { xs: 1, md: '0 0 520px' },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: '#faf8f5',
          px: { xs: 3, md: 6 },
          py: 4,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          <Tabs
            value={tabIndex}
            onChange={(e, val) => {
              setTabIndex(val);
              setError('');
            }}
            textColor="primary"
            indicatorColor="primary"
            sx={{ mb: 3 }}
          >
            <Tab label="Sign In" />
            <Tab label="Register Salon" />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {tabIndex === 0 ? (
            <Box component="form" onSubmit={handleLoginSubmit}>
              <Typography sx={{ fontSize: '1.4rem', fontWeight: 600, color: '#2c2528', mb: 1 }}>
                Welcome back
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', color: '#6b5e62', mb: 3 }}>
                Sign in to your account to continue
              </Typography>

              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#6b5e62', mb: 0.5 }}>
                Email address
              </Typography>
              <TextField
                fullWidth
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{ mb: 2 }}
              />

              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#6b5e62', mb: 0.5 }}>
                Password
              </Typography>
              <TextField
                fullWidth
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{ mb: 3 }}
              />

              <Button fullWidth variant="contained" type="submit" disabled={loading} sx={{ py: 1.4, bgcolor: '#be4b6e' }}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleRegisterSubmit}>
              <Typography sx={{ fontSize: '1.4rem', fontWeight: 600, color: '#2c2528', mb: 1 }}>
                Create your Salon
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', color: '#6b5e62', mb: 3 }}>
                Register as Salon Owner and start your subscription
              </Typography>

              <TextField
                fullWidth
                label="Owner Full Name"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="email"
                label="Email address"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="password"
                label="Password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Salon Name"
                value={salonName}
                onChange={(e) => setSalonName(e.target.value)}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Phone Number"
                placeholder="+91-9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Salon Address"
                placeholder="City, State"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                sx={{ mb: 3 }}
              />

              <Button fullWidth variant="contained" type="submit" disabled={loading} sx={{ py: 1.4, bgcolor: '#be4b6e' }}>
                {loading ? 'Registering...' : 'Register & Launch Salon'}
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
