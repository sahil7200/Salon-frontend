import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Alert, IconButton, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { getAppointments, createAppointment, updateAppointmentStatus, getClients, getStaff, getServices } from '../services/api';
import PageHeader from '../components/common/PageHeader';
import StatusChip from '../components/common/StatusChip';
import EmptyState from '../components/common/EmptyState';

const DEFAULT_SERVICES = [
  { name: 'Haircut', durationInMinutes: 30 },
  { name: 'Facial', durationInMinutes: 60 },
  { name: 'Hair Color', durationInMinutes: 120 },
];

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ client: '', service: '', staff: '', date: '', startTime: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [aptRes, cliRes, stfRes, srvRes] = await Promise.all([
        getAppointments(),
        getClients(),
        getStaff(),
        getServices().catch(() => ({ data: [] })),
      ]);
      setAppointments(aptRes.data);
      setClients(cliRes.data);
      setStaffList(stfRes.data);
      setServicesList(srvRes.data && srvRes.data.length > 0 ? srvRes.data : DEFAULT_SERVICES);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      await createAppointment(form);
      setOpen(false);
      setForm({ client: '', service: '', staff: '', date: '', startTime: '' });
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
      console.error(err);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Appointments"
        subtitle="Manage client bookings and schedule"
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
                  <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{apt.client?.name}</Typography>
                </TableCell>
                <TableCell>{apt.service}</TableCell>
                <TableCell>{apt.staff?.name}</TableCell>
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
                  {apt.status === 'PENDING' && (
                    <>
                      <Tooltip title="Confirm">
                        <IconButton
                          size="small"
                          onClick={() => handleStatusUpdate(apt._id, 'CONFIRMED')}
                          sx={{ color: '#5b8a5e', '&:hover': { bgcolor: '#e8f0e8' } }}
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Cancel">
                        <IconButton
                          size="small"
                          onClick={() => handleStatusUpdate(apt._id, 'CANCELLED')}
                          sx={{ color: '#c45c5c', '&:hover': { bgcolor: '#fce8e8' } }}
                        >
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                  {apt.status === 'CONFIRMED' && (
                    <Tooltip title="Mark Complete">
                      <IconButton
                        size="small"
                        onClick={() => handleStatusUpdate(apt._id, 'COMPLETED')}
                        sx={{ color: '#5b7e9e', '&:hover': { bgcolor: '#e6eef4' } }}
                      >
                        <CheckCircleIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {appointments.length === 0 && <EmptyState colSpan={7} message="No appointments found" />}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Appointment Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Appointment</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
          <TextField select fullWidth label="Client" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} margin="normal">
            {clients.map((c) => <MenuItem key={c._id} value={c._id}>{c.name} ({c.phone})</MenuItem>)}
          </TextField>
          <TextField select fullWidth label="Service" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} margin="normal">
            {servicesList.map((s) => (
              <MenuItem key={s.name} value={s.name}>
                {s.name} ({s.durationInMinutes || s.duration || 30} min)
              </MenuItem>
            ))}
          </TextField>
          <TextField select fullWidth label="Staff" value={form.staff} onChange={(e) => setForm({ ...form, staff: e.target.value })} margin="normal">
            {staffList.map((s) => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
          </TextField>
          <TextField fullWidth label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} margin="normal"
            InputLabelProps={{ shrink: true }} />
          <TextField fullWidth label="Start Time" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} margin="normal"
            InputLabelProps={{ shrink: true }} />
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

export default Appointments;
