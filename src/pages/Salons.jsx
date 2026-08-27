import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert, Stack, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { getSalons, createSalon, getPlans } from '../services/api';
import PageHeader from '../components/common/PageHeader';
import StatusChip from '../components/common/StatusChip';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';

const Salons = () => {
  const { user } = useAuth();
  const [salons, setSalons] = useState([]);
  const [plans, setPlans] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [planId, setPlanId] = useState('');

  const loadSalons = useCallback(async () => {
    try {
      const { data } = await getSalons();
      setSalons(data);
      if (user?.role === 'SUPER_ADMIN') {
        const { data: plansData } = await getPlans();
        setPlans(plansData);
      }
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  useEffect(() => { loadSalons(); }, [loadSalons]);

  const handleCreateSalon = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await createSalon({
        name,
        ownerName,
        ownerEmail,
        ownerPassword,
        address,
        phone,
        planId,
      });
      setSuccess(`Salon '${name}' created! Owner email: ${ownerEmail}`);
      setOpenModal(false);
      setName('');
      setOwnerName('');
      setOwnerEmail('');
      setOwnerPassword('');
      setAddress('');
      setPhone('');
      setPlanId('');
      loadSalons();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create salon');
    }
  };

  return (
    <Box>
      <PageHeader
        title="Salons"
        subtitle="All registered salon businesses"
        actionLabel={user?.role === 'SUPER_ADMIN' ? 'Create Salon' : null}
        onAction={() => setOpenModal(true)}
      />

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Salon Name</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Expires</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {salons.map((salon) => (
              <TableRow key={salon._id}>
                <TableCell>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{salon.name}</Typography>
                </TableCell>
                <TableCell>{salon.ownerId?.name || 'N/A'}</TableCell>
                <TableCell>
                  <Typography sx={{ color: salon.address ? '#2c2528' : '#b5adb0', fontSize: '0.85rem' }}>
                    {salon.address || 'Not set'}
                  </Typography>
                </TableCell>
                <TableCell>{salon.currentPlan?.name || 'No Plan'}</TableCell>
                <TableCell>
                  <StatusChip status={salon.subscriptionStatus} />
                </TableCell>
                <TableCell>
                  {salon.subscriptionEndDate
                    ? new Date(salon.subscriptionEndDate).toLocaleDateString()
                    : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
            {salons.length === 0 && <EmptyState colSpan={6} message="No salons found" />}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={handleCreateSalon}>
          <DialogTitle sx={{ fontWeight: 600 }}>Create New Salon</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField
                label="Salon Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Owner Full Name"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                fullWidth
              />
              <TextField
                type="email"
                label="Owner Email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                required
                fullWidth
              />
              <TextField
                type="password"
                label="Owner Password"
                value={ownerPassword}
                onChange={(e) => setOwnerPassword(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                fullWidth
              />
              <TextField
                label="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Initial Plan</InputLabel>
                <Select value={planId} label="Initial Plan" onChange={(e) => setPlanId(e.target.value)}>
                  {plans.map((p) => (
                    <MenuItem key={p._id} value={p._id}>
                      {p.name} - ₹{p.price} ({p.durationInDays} days, max {p.maxStaff} staff, {p.maxAppointments} apts)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#be4b6e' }}>
              Create Salon
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Salons;
