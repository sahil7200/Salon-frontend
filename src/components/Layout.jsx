import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Box, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, Typography, Avatar, Menu, MenuItem, Chip, Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PeopleIcon from '@mui/icons-material/People';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useAuth } from '../context/AuthContext';
import ErrorBoundary from './common/ErrorBoundary';

const DRAWER_WIDTH = 264;

const ROLE_LABELS = {
  SUPER_ADMIN: 'Admin',
  SALON_OWNER: 'Owner',
  RECEPTIONIST: 'Staff',
};

const navItems = {
  SUPER_ADMIN: [
    { text: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
    { text: 'Users', path: '/users', icon: PeopleIcon },
    { text: 'Plans', path: '/plans', icon: SubscriptionsIcon },
    { text: 'Salons', path: '/salons', icon: StorefrontIcon },
    { text: 'Subscriptions', path: '/subscriptions', icon: ReceiptIcon },
  ],
  SALON_OWNER: [
    { text: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
    { text: 'Appointments', path: '/appointments', icon: EventNoteIcon },
    { text: 'Clients', path: '/clients', icon: PeopleIcon },
    { text: 'Users', path: '/users', icon: PeopleIcon },
    { text: 'Subscription', path: '/subscription-status', icon: SubscriptionsIcon },
  ],
  RECEPTIONIST: [
    { text: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
    { text: 'Appointments', path: '/appointments', icon: EventNoteIcon },
    { text: 'Clients', path: '/clients', icon: PeopleIcon },
  ],
};

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const items = navItems[user?.role] || [];

  const sidebarStyles = {
    bgcolor: '#2c2528',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  };

  const drawer = (
    <Box sx={sidebarStyles}>
      {/* Brand */}
      <Box sx={{ p: 3, pb: 1 }}>
        <Typography
          sx={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontWeight: 600,
            fontSize: '1.35rem',
            color: '#f0e8e4',
            letterSpacing: '0.04em',
          }}
        >
          Salon CRM
        </Typography>
        <Typography
          sx={{
            fontSize: '0.7rem',
            color: 'rgba(240,232,228,0.4)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            mt: 0.5,
          }}
        >
          Management Suite
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mx: 2, my: 1 }} />

      {/* Navigation */}
      <List sx={{ px: 1.5, flex: 1 }}>
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                py: 1.2,
                px: 2,
                position: 'relative',
                color: isActive ? '#f0e8e4' : 'rgba(240,232,228,0.55)',
                bgcolor: isActive ? 'rgba(190,75,110,0.2)' : 'transparent',
                '&::before': isActive ? {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: '20%',
                  bottom: '20%',
                  width: 3,
                  borderRadius: 4,
                  bgcolor: '#be4b6e',
                } : {},
                '&:hover': {
                  bgcolor: isActive ? 'rgba(190,75,110,0.25)' : 'rgba(240,232,228,0.06)',
                  color: '#f0e8e4',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                <item.icon sx={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 400,
                  letterSpacing: '0.01em',
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      {/* User section at bottom */}
      <Box sx={{ p: 2 }}>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2 }} />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            borderRadius: 2,
            cursor: 'pointer',
            '&:hover': { bgcolor: 'rgba(240,232,228,0.06)' },
            transition: 'background-color 0.2s ease',
          }}
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          <Avatar
            sx={{
              width: 34,
              height: 34,
              bgcolor: '#be4b6e',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            {user?.name?.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: '0.82rem',
                fontWeight: 500,
                color: '#f0e8e4',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.name}
            </Typography>
            <Typography sx={{ fontSize: '0.68rem', color: 'rgba(240,232,228,0.4)' }}>
              {ROLE_LABELS[user?.role]}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Clean white AppBar for mobile */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          display: { md: 'none' },
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, color: '#2c2528' }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            sx={{
              flexGrow: 1,
              fontFamily: '"Playfair Display", Georgia, serif',
              fontWeight: 600,
              fontSize: '1.1rem',
              color: '#2c2528',
            }}
          >
            Salon CRM
          </Typography>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: '#be4b6e',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            {user?.name?.charAt(0)}
          </Avatar>
        </Toolbar>
      </AppBar>

      {/* User menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 2,
            border: '1px solid #e8e2de',
            boxShadow: '0 8px 24px rgba(44,37,40,0.12)',
            minWidth: 180,
          },
        }}
      >
        <MenuItem disabled sx={{ opacity: '0.7 !important' }}>
          <Typography variant="body2" fontWeight={500}>{user?.name}</Typography>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => { logout(); navigate('/login'); setAnchorEl(null); }}
          sx={{
            color: '#c45c5c',
            '&:hover': { bgcolor: '#fce8e8' },
          }}
        >
          <ListItemIcon><ExitToAppIcon fontSize="small" sx={{ color: '#c45c5c' }} /></ListItemIcon>
          Sign Out
        </MenuItem>
      </Menu>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none' },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            border: 'none',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          pt: { xs: 10, md: 4 },
          mt: { xs: 0, md: 0 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
        }}
      >
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </Box>
    </Box>
  );
};

export default Layout;
