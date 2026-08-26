import React from 'react';
import { Box, Typography, Button } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            p: 3,
            textAlign: 'center',
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: '1.5rem',
              color: '#2c2528',
              mb: 1,
            }}
          >
            Something went wrong
          </Typography>
          <Typography sx={{ color: '#8a7e82', fontSize: '0.9rem', mb: 3, maxWidth: 400 }}>
            An unexpected error occurred while rendering this page.
          </Typography>
          <Button variant="contained" onClick={this.handleReset} sx={{ bgcolor: '#be4b6e' }}>
            Reload Page
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
