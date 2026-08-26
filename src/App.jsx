import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box, CircularProgress } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Route-level code splitting via React.lazy
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Appointments = lazy(() => import('./pages/Appointments'));
const Clients = lazy(() => import('./pages/Clients'));
const Plans = lazy(() => import('./pages/Plans'));
const Salons = lazy(() => import('./pages/Salons'));
const SubscriptionHistory = lazy(() => import('./pages/SubscriptionHistory'));
const SubscriptionStatus = lazy(() => import('./pages/SubscriptionStatus'));

const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
    <CircularProgress sx={{ color: '#be4b6e' }} />
  </Box>
);

const theme = createTheme({
  palette: {
    primary: {
      main: '#be4b6e',
      dark: '#9a3a57',
      light: '#d4809a',
      contrastText: '#fff',
    },
    secondary: {
      main: '#c9a96e',
      dark: '#a8894e',
      light: '#dcc499',
      contrastText: '#2c2528',
    },
    background: {
      default: '#faf8f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#2c2528',
      secondary: '#8a7e82',
    },
    success: { main: '#5b8a5e', light: '#e8f0e8' },
    warning: { main: '#c9923e', light: '#fdf3e4' },
    error: { main: '#c45c5c', light: '#fce8e8' },
    info: { main: '#5b7e9e', light: '#e6eef4' },
    divider: '#e8e2de',
  },
  typography: {
    fontFamily: '"DM Sans", "Inter", "Roboto", sans-serif',
    h1: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600 },
    h2: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600 },
    h3: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600 },
    h4: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 500 },
    h5: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 500 },
    h6: { fontFamily: '"DM Sans", sans-serif', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
  },
  shape: { borderRadius: 10 },
  shadows: [
    'none',
    '0 1px 3px rgba(44,37,40,0.04)',
    '0 2px 6px rgba(44,37,40,0.06)',
    '0 4px 12px rgba(44,37,40,0.08)',
    '0 6px 16px rgba(44,37,40,0.10)',
    '0 8px 24px rgba(44,37,40,0.12)',
    ...Array(19).fill('0 8px 24px rgba(44,37,40,0.12)'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#faf8f5',
        },
        '::selection': {
          backgroundColor: '#be4b6e',
          color: '#fff',
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: '1px solid #e8e2de',
          borderRadius: 12,
          transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
          '&:hover': {
            borderColor: '#d4c8c2',
            boxShadow: '0 4px 12px rgba(44,37,40,0.08)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        contained: {
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(190,75,110,0.25)',
          },
        },
        outlined: {
          borderColor: '#d4c8c2',
          color: '#2c2528',
          '&:hover': {
            borderColor: '#be4b6e',
            backgroundColor: 'rgba(190,75,110,0.04)',
          },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid #e8e2de',
          boxShadow: 'none',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#f5f0ec',
            color: '#6b5e62',
            fontWeight: 600,
            fontSize: '0.8rem',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            borderBottom: '2px solid #e8e2de',
            padding: '14px 16px',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.15s ease',
          '&:hover': {
            backgroundColor: '#faf6f3',
          },
          '&:last-child td': {
            borderBottom: 0,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#f0ebe7',
          padding: '14px 16px',
          fontSize: '0.875rem',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.75rem',
          letterSpacing: '0.02em',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          padding: '8px',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: '"Playfair Display", Georgia, serif',
          fontWeight: 500,
          fontSize: '1.25rem',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': { borderColor: '#e0d8d3' },
            '&:hover fieldset': { borderColor: '#c9a96e' },
            '&.Mui-focused fieldset': { borderColor: '#be4b6e' },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#2c2528',
          boxShadow: 'none',
          borderBottom: '1px solid #e8e2de',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
        },
      },
    },
  },
});

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<Layout />}>
              <Route path="/dashboard" element={
                <ProtectedRoute><Dashboard /></ProtectedRoute>
              } />
              {/* Owner & Receptionist routes */}
              <Route path="/appointments" element={
                <ProtectedRoute allowedRoles={['SALON_OWNER', 'RECEPTIONIST']}><Appointments /></ProtectedRoute>
              } />
              <Route path="/clients" element={
                <ProtectedRoute allowedRoles={['SALON_OWNER', 'RECEPTIONIST']}><Clients /></ProtectedRoute>
              } />
              <Route path="/subscription-status" element={
                <ProtectedRoute allowedRoles={['SALON_OWNER']}><SubscriptionStatus /></ProtectedRoute>
              } />
              {/* Super Admin routes */}
              <Route path="/plans" element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN']}><Plans /></ProtectedRoute>
              } />
              <Route path="/salons" element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN']}><Salons /></ProtectedRoute>
              } />
              <Route path="/subscriptions" element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN']}><SubscriptionHistory /></ProtectedRoute>
              } />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
