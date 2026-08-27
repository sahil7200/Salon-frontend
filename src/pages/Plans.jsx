import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert, Stack, Tooltip, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { getPlans, createPlan, updatePlan } from '../services/api';
import PageHeader from '../components/common/PageHeader';
import StatusChip from '../components/common/StatusChip';
import EmptyState from '../components/common/EmptyState';
import TableSkeleton from '../components/common/TableSkeleton';
import DetailModal from '../components/common/DetailModal';
import { useAuth } from '../context/AuthContext';

const Plans = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [durationInDays, setDurationInDays] = useState('');
  const [maxStaff, setMaxStaff] = useState('');
  const [maxAppointments, setMaxAppointments] = useState('');

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPlans();
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setPlans(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setName('');
    setPrice('');
    setDurationInDays('30');
    setMaxStaff('5');
    setMaxAppointments('100');
    setOpenModal(true);
  };

  const handleOpenEdit = (plan, e) => {
    e.stopPropagation();
    setEditingPlan(plan);
    setName(plan.name);
    setPrice(plan.price);
    setDurationInDays(plan.durationInDays);
    setMaxStaff(plan.maxStaff);
    setMaxAppointments(plan.maxAppointments);
    setOpenModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const payload = {
        name,
        price: Number(price),
        durationInDays: Number(durationInDays),
        maxStaff: Number(maxStaff),
        maxAppointments: Number(maxAppointments),
      };

      if (editingPlan) {
        await updatePlan(editingPlan._id, payload);
        setSuccess(`Plan '${name}' updated successfully!`);
      } else {
        await createPlan(payload);
        setSuccess(`Plan '${name}' created successfully!`);
      }
      setOpenModal(false);
      loadPlans();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save plan');
    }
  };

  return (
    <Box>
      <PageHeader
        title="Subscription Plans"
        subtitle="Manage platform pricing tiers & limits"
        actionLabel={user?.role === 'SUPER_ADMIN' ? 'Create Plan' : null}
        actionIcon={<AddIcon />}
        onActionClick={handleOpenCreate}
      />

      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

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
              {user?.role === 'SUPER_ADMIN' && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableSkeleton rows={4} columns={user?.role === 'SUPER_ADMIN' ? 7 : 6} />
            ) : (
              plans.map((plan) => (
                <TableRow
                  key={plan._id}
                  hover
                  onClick={() => setDetailData(plan)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{plan.name}</Typography>
                  </TableCell>
                  <TableCell>₹{plan.price}</TableCell>
                  <TableCell>{plan.durationInDays} days</TableCell>
                  <TableCell>{plan.maxStaff}</TableCell>
                  <TableCell>{plan.maxAppointments}</TableCell>
                  <TableCell>
                    <StatusChip status={plan.isActive ? 'ACTIVE' : 'INACTIVE'} />
                  </TableCell>
                  {user?.role === 'SUPER_ADMIN' && (
                    <TableCell align="right">
                      <Tooltip title="Edit Plan">
                        <IconButton size="small" color="primary" onClick={(e) => handleOpenEdit(plan, e)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
            {!loading && plans.length === 0 && <EmptyState colSpan={7} message="No plans found" />}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Row Detail Modal */}
      <DetailModal
        open={Boolean(detailData)}
        onClose={() => setDetailData(null)}
        title={detailData ? `Plan: ${detailData.name}` : 'Details'}
        data={detailData}
      />

      {/* Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 600 }}>
            {editingPlan ? `Edit Plan: ${editingPlan.name}` : 'Create New Plan'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField label="Plan Name" value={name} onChange={(e) => setName(e.target.value)} required fullWidth />
              <TextField type="number" label="Price (₹)" value={price} onChange={(e) => setPrice(e.target.value)} required fullWidth />
              <TextField type="number" label="Duration (Days)" value={durationInDays} onChange={(e) => setDurationInDays(e.target.value)} required fullWidth />
              <TextField type="number" label="Max Staff Allowed" value={maxStaff} onChange={(e) => setMaxStaff(e.target.value)} required fullWidth />
              <TextField type="number" label="Max Appointments Allowed" value={maxAppointments} onChange={(e) => setMaxAppointments(e.target.value)} required fullWidth />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#be4b6e' }}>
              {editingPlan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Plans;
