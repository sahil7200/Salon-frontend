import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, Avatar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { getClients, createClient } from '../services/api';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';

const AVATAR_COLORS = ['#be4b6e', '#5b7e9e', '#c9a96e', '#5b8a5e', '#9a6fb0', '#c9923e'];

const getAvatarColor = (name) => {
  if (!name) return AVATAR_COLORS[0];
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadClients = useCallback(async () => {
    try {
      const res = await getClients();
      const clientList = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setClients(clientList);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => { loadClients(); }, [loadClients]);

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      await createClient(form);
      setOpen(false);
      setForm({ name: '', phone: '', email: '' });
      loadClients();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Clients"
        subtitle="Manage client contact details"
        actionLabel="New Client"
        actionIcon={<AddIcon />}
        onActionClick={() => setOpen(true)}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Client Name</TableCell>
              <TableCell>Phone Number</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Joined Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((c) => (
              <TableRow key={c._id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: '0.85rem',
                        bgcolor: getAvatarColor(c.name),
                      }}
                    >
                      {c.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{c.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{c.phone}</TableCell>
                <TableCell>{c.email || 'N/A'}</TableCell>
                <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
            {clients.length === 0 && <EmptyState colSpan={4} message="No clients found" />}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Create New Client</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Phone Number"
              placeholder="+91-9876543210"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
              fullWidth
            />
            <TextField
              type="email"
              label="Email Address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={loading} sx={{ bgcolor: '#be4b6e' }}>
            {loading ? 'Creating...' : 'Create Client'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Clients;
