import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, TextField, Button, Typography, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
      }}
    >
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
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '60%',
            height: '60%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(190,75,110,0.15) 0%, transparent 70%)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-15%',
            left: '-5%',
            width: '45%',
            height: '45%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201,169,110,0.12) 0%, transparent 70%)',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Typography
            sx={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: '2.8rem',
              fontWeight: 600,
              color: '#f0e8e4',
              letterSpacing: '0.02em',
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
          <Box
            sx={{
              width: 48,
              height: 2,
              bgcolor: '#be4b6e',
              borderRadius: 1,
              mx: 'auto',
              mt: 3,
            }}
          />
          <Typography
            sx={{
              fontSize: '0.95rem',
              color: 'rgba(240,232,228,0.5)',
              mt: 3,
              maxWidth: 320,
              lineHeight: 1.7,
            }}
          >
            Manage appointments, clients, and your team — all in one place.
          </Typography>
        </Box>
      </Box>

      {/* Right login form panel */}
      <Box
        sx={{
          flex: { xs: 1, md: '0 0 480px' },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: '#faf8f5',
          px: { xs: 3, md: 6 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 380 }}>
          {/* Mobile brand (hidden on desktop since we have the left panel) */}
          <Box sx={{ display: { md: 'none' }, textAlign: 'center', mb: 4 }}>
            <Typography
              sx={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: '1.8rem',
                fontWeight: 600,
                color: '#2c2528',
              }}
            >
              Salon CRM
            </Typography>
          </Box>

          <Typography
            sx={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: '1.6rem',
              fontWeight: 500,
              color: '#2c2528',
              mb: 0.5,
            }}
          >
            Welcome back
          </Typography>
          <Typography
            sx={{
              fontSize: '0.9rem',
              color: '#8a7e82',
              mb: 4,
            }}
          >
            Sign in to your account to continue
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'error.light',
                bgcolor: '#fef5f5',
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Typography
              component="label"
              sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#6b5e62', mb: 0.5, display: 'block' }}
            >
              Email address
            </Typography>
            <TextField
              fullWidth
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              sx={{ mb: 2.5 }}
              size="medium"
            />

            <Typography
              component="label"
              sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#6b5e62', mb: 0.5, display: 'block' }}
            >
              Password
            </Typography>
            <TextField
              fullWidth
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 3.5 }}
              size="medium"
            />

            <Button
              fullWidth
              variant="contained"
              type="submit"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: '0.95rem',
                bgcolor: '#be4b6e',
                '&:hover': {
                  bgcolor: '#9a3a57',
                },
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
