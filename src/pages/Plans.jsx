import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { getPlans, createPlan } from '../services/api';
import PageHeader from '../components/common/PageHeader';
import StatusChip from '../components/common/StatusChip';
import EmptyState from '../components/common/EmptyState';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', durationInDays: '', maxStaff: '', maxAppointments: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadPlans = useCallback(async () => {
    try {
      const { data } = await getPlans();
      setPlans(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      await createPlan({
        ...form,
        price: Number(form.price),
        durationInDays: Number(form.durationInDays),
        maxStaff: Number(form.maxStaff),
        maxAppointments: Number(form.maxAppointments),
      });
      setOpen(false);
      setForm({ name: '', price: '', durationInDays: '', maxStaff: '', maxAppointments: '' });
      loadPlans();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Subscription Plans"
        subtitle="Manage pricing tiers for salons"
        actionLabel="Create Plan"
        actionIcon={<AddIcon />}
        onActionClick={() => setOpen(true)}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Plan Name</TableCell>
              <TableCell>Price (₹)</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Max Staff</TableCell>
              <TableCell>Max Appointments</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan._id}>
                <TableCell>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{plan.name}</Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontWeight: 500 }}>₹{plan.price.toLocaleString()}</Typography>
                </TableCell>
                <TableCell>{plan.durationInDays} days</TableCell>
                <TableCell>{plan.maxStaff}</TableCell>
                <TableCell>{plan.maxAppointments}</TableCell>
                <TableCell>
                  <StatusChip status={plan.isActive ? 'ACTIVE' : 'INACTIVE'} />
                </TableCell>
              </TableRow>
            ))}
            {plans.length === 0 && <EmptyState colSpan={6} message="No plans found" />}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Plan</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
          <TextField fullWidth label="Plan Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} margin="normal" required />
          <TextField fullWidth label="Price (₹)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} margin="normal" required />
          <TextField fullWidth label="Duration (Days)" type="number" value={form.durationInDays} onChange={(e) => setForm({ ...form, durationInDays: e.target.value })} margin="normal" required />
          <TextField fullWidth label="Max Staff" type="number" value={form.maxStaff} onChange={(e) => setForm({ ...form, maxStaff: e.target.value })} margin="normal" required />
          <TextField fullWidth label="Max Appointments" type="number" value={form.maxAppointments} onChange={(e) => setForm({ ...form, maxAppointments: e.target.value })} margin="normal" required />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: '#8a7e82' }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={loading}>
            {loading ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Plans;
