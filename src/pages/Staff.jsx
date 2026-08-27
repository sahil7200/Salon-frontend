import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, Avatar, Chip, Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { getStaff, createStaff } from '../services/api';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import StatusChip from '../components/common/StatusChip';
import { useAuth } from '../context/AuthContext';

const AVATAR_COLORS = ['#be4b6e', '#5b7e9e', '#c9a96e', '#5b8a5e', '#9a6fb0', '#c9923e'];

const getAvatarColor = (name) => {
  if (!name) return AVATAR_COLORS[0];
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

const Staff = () => {
  const { user } = useAuth();
  const isOwner = user?.role === 'SALON_OWNER' || user?.role === 'SUPER_ADMIN';
  const [staffList, setStaffList] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadStaff = useCallback(async () => {
    try {
      const res = await getStaff();
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setStaffList(list);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => { loadStaff(); }, [loadStaff]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createStaff(form);
      setOpen(false);
      setForm({ name: '', phone: '' });
      loadStaff();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add staff member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Staff Members"
        subtitle="Manage salon staff & stylists"
        actionLabel={isOwner ? "Add Staff Member" : null}
        actionIcon={<AddIcon />}
        onActionClick={() => setOpen(true)}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Staff Name</TableCell>
              <TableCell>Phone Number</TableCell>
              <TableCell>Services Offered</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Joined Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {staffList.map((s) => (
              <TableRow key={s._id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: '0.85rem',
                        bgcolor: getAvatarColor(s.name),
                      }}
                    >
                      {s.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{s.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{s.phone}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                    {(s.services || ['Haircut', 'Facial', 'Hair Color']).map((srv) => (
                      <Chip key={srv} label={srv} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
                    ))}
                  </Stack>
                </TableCell>
                <TableCell>
                  <StatusChip status={s.status || (s.isActive !== false ? 'ACTIVE' : 'INACTIVE')} />
                </TableCell>
                <TableCell>{new Date(s.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
            {staffList.length === 0 && <EmptyState colSpan={5} message="No staff members found" />}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Staff Dialog */}
      {isOwner && (
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <Box component="form" onSubmit={handleCreate}>
            <DialogTitle sx={{ fontWeight: 600 }}>Add New Staff Member</DialogTitle>
            <DialogContent>
              {error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}
              <Stack spacing={2} sx={{ mt: 1 }}>
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
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={loading} sx={{ bgcolor: '#be4b6e' }}>
                {loading ? 'Adding...' : 'Add Staff Member'}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      )}
    </Box>
  );
};

export default Staff;
