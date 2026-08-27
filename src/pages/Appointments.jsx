import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Alert, IconButton, Tooltip, Stack, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { getAppointments, createAppointment, updateAppointmentStatus, getClients, getStaff, getServices } from '../services/api';
import PageHeader from '../components/common/PageHeader';
import StatusChip from '../components/common/StatusChip';
import EmptyState from '../components/common/EmptyState';

const DEFAULT_SERVICES = [
  { _id: 'Haircut', name: 'Haircut', durationInMinutes: 30 },
  { _id: 'Facial', name: 'Facial', durationInMinutes: 60 },
  { _id: 'Hair Color', name: 'Hair Color', durationInMinutes: 120 },
];

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [servicesList, setServicesList] = useState(DEFAULT_SERVICES);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ client: '', serviceId: '', service: '', staff: '', date: '', startTime: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [aptRes, cliRes, stfRes, srvRes] = await Promise.all([
        getAppointments(),
        getClients(),
        getStaff(),
        getServices().catch(() => ({ data: DEFAULT_SERVICES })),
      ]);

      const aptData = aptRes.data?.data || aptRes.data || [];
      const cliData = cliRes.data?.data || cliRes.data || [];
      const stfData = stfRes.data?.data || stfRes.data || [];
      const srvData = srvRes.data?.data || srvRes.data || DEFAULT_SERVICES;

      setAppointments(aptData);
      setClients(cliData);
      setStaffList(stfData);
      setServicesList(srvData.length > 0 ? srvData : DEFAULT_SERVICES);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createAppointment(form);
      setOpen(false);
      setForm({ client: '', serviceId: '', service: '', staff: '', date: '', startTime: '' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateAppointmentStatus(id, status);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <Box>
      <PageHeader
        title="Appointments"
        subtitle="Manage client bookings and operational schedule"
        actionLabel="New Appointment"
        actionIcon={<AddIcon />}
        onActionClick={() => setOpen(true)}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Client</TableCell>
              <TableCell>Service</TableCell>
              <TableCell>Staff</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.map((apt) => (
              <TableRow key={apt._id}>
                <TableCell>
                  <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{apt.client?.name || 'N/A'}</Typography>
                </TableCell>
                <TableCell>{apt.serviceNameSnapshot || apt.service || 'N/A'}</TableCell>
                <TableCell>{apt.staff?.name || 'N/A'}</TableCell>
                <TableCell>{new Date(apt.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: '0.85rem', color: '#6b5e62' }}>
                    {apt.startTime} – {apt.endTime}
                  </Typography>
                </TableCell>
                <TableCell>
                  <StatusChip status={apt.status} />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    {apt.status === 'PENDING' && (
                      <Tooltip title="Confirm">
                        <IconButton size="small" color="primary" onClick={() => handleStatusUpdate(apt._id, 'CONFIRMED')}>
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {apt.status === 'CONFIRMED' && (
                      <Tooltip title="Start (In Progress)">
                        <IconButton size="small" color="info" onClick={() => handleStatusUpdate(apt._id, 'IN_PROGRESS')}>
                          <PlayArrowIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {apt.status === 'IN_PROGRESS' && (
                      <Tooltip title="Complete">
                        <IconButton size="small" color="success" onClick={() => handleStatusUpdate(apt._id, 'COMPLETED')}>
                          <DoneAllIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {['PENDING', 'CONFIRMED'].includes(apt.status) && (
                      <Tooltip title="Cancel">
                        <IconButton size="small" color="error" onClick={() => handleStatusUpdate(apt._id, 'CANCELLED')}>
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {appointments.length === 0 && <EmptyState colSpan={7} message="No appointments found" />}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Booking Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={handleCreate}>
          <DialogTitle sx={{ fontWeight: 600 }}>Create New Appointment</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
                {error}
              </Alert>
            )}
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField
                select
                label="Client"
                value={form.client}
                onChange={(e) => setForm({ ...form, client: e.target.value })}
                required
                fullWidth
              >
                {clients.map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    {c.name} ({c.phone})
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Service"
                value={form.serviceId || form.service}
                onChange={(e) => {
                  const val = e.target.value;
                  const found = servicesList.find((s) => s._id === val || s.name === val);
                  setForm({
                    ...form,
                    serviceId: found?._id && found._id.length > 20 ? found._id : undefined,
                    service: found?.name || val,
                  });
                }}
                required
                fullWidth
              >
                {servicesList.map((s) => (
                  <MenuItem key={s._id || s.name} value={s._id || s.name}>
                    {s.name} ({s.durationInMinutes} mins {s.price ? `- ₹${s.price}` : ''})
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Staff Member"
                value={form.staff}
                onChange={(e) => setForm({ ...form, staff: e.target.value })}
                required
                fullWidth
              >
                {staffList.map((s) => (
                  <MenuItem key={s._id} value={s._id}>
                    {s.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                type="date"
                label="Date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
                fullWidth
              />

              <TextField
                type="time"
                label="Start Time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading} sx={{ bgcolor: '#be4b6e' }}>
              {loading ? 'Booking...' : 'Book Appointment'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Appointments;
