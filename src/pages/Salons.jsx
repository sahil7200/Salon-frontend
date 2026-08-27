import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert, Stack, MenuItem, Select, FormControl, InputLabel, Tooltip, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { getSalons, createSalon, getPlans, assignPlan } from '../services/api';
import PageHeader from '../components/common/PageHeader';
import StatusChip from '../components/common/StatusChip';
import EmptyState from '../components/common/EmptyState';
import TableSkeleton from '../components/common/TableSkeleton';
import DetailModal from '../components/common/DetailModal';
import { useAuth } from '../context/AuthContext';

const Salons = () => {
  const { user } = useAuth();
  const [salons, setSalons] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openPlanModal, setOpenPlanModal] = useState(false);
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State - Create
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [planId, setPlanId] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [allowedRadius, setAllowedRadius] = useState('100');
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Form State - Assign Plan
  const [assignPlanId, setAssignPlanId] = useState('');
  const [assignAction, setAssignAction] = useState('ASSIGN');

  const loadSalons = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getSalons();
      const salonList = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setSalons(salonList);
      if (user?.role === 'SUPER_ADMIN') {
        const plansRes = await getPlans();
        const planList = Array.isArray(plansRes.data) ? plansRes.data : (plansRes.data?.data || []);
        setPlans(planList);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadSalons(); }, [loadSalons]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setDetectingLocation(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setDetectingLocation(false);
        setSuccess('Current GPS coordinates detected!');
      },
      (err) => {
        setError('Failed to get current location: ' + err.message);
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };

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
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        allowedRadius: allowedRadius ? Number(allowedRadius) : 100,
      });
      setSuccess(`Salon '${name}' created! Owner email: ${ownerEmail}`);
      setOpenCreateModal(false);
      setName('');
      setOwnerName('');
      setOwnerEmail('');
      setOwnerPassword('');
      setAddress('');
      setPhone('');
      setPlanId('');
      setLatitude('');
      setLongitude('');
      setAllowedRadius('100');
      loadSalons();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create salon');
    }
  };

  const handleAssignPlan = async (e) => {
    e.preventDefault();
    if (!selectedSalon || !assignPlanId) return;
    setError('');
    setSuccess('');
    try {
      await assignPlan({
        salonId: selectedSalon._id,
        planId: assignPlanId,
        action: assignAction,
      });
      setSuccess(`Plan successfully updated for ${selectedSalon.name}!`);
      setOpenPlanModal(false);
      setSelectedSalon(null);
      setAssignPlanId('');
      loadSalons();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update plan');
    }
  };

  const openPlanDialog = (salon, e) => {
    e.stopPropagation();
    setSelectedSalon(salon);
    setAssignPlanId(salon.currentPlan?._id || '');
    setAssignAction('ASSIGN');
    setOpenPlanModal(true);
  };

  return (
    <Box>
      <PageHeader
        title="Salons"
        subtitle="All registered salon businesses"
        actionLabel={user?.role === 'SUPER_ADMIN' ? 'Create Salon' : null}
        actionIcon={<AddIcon />}
        onActionClick={() => setOpenCreateModal(true)}
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
              <TableCell>Geo-Fence (Lat, Long)</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Expires</TableCell>
              {user?.role === 'SUPER_ADMIN' && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableSkeleton rows={5} columns={user?.role === 'SUPER_ADMIN' ? 8 : 7} />
            ) : (
              salons.map((salon) => (
                <TableRow
                  key={salon._id}
                  hover
                  onClick={() => setDetailData(salon)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#2c2528' }}>{salon.name}</Typography>
                  </TableCell>
                  <TableCell>{salon.ownerId?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <Typography sx={{ color: salon.address ? '#2c2528' : '#b5adb0', fontSize: '0.85rem' }}>
                      {salon.address || 'Not set'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#475569' }}>
                      {salon.latitude?.toFixed(4)}, {salon.longitude?.toFixed(4)} ({salon.allowedRadius || 100}m)
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
                  {user?.role === 'SUPER_ADMIN' && (
                    <TableCell align="right">
                      <Tooltip title="Assign or Renew Plan">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(e) => openPlanDialog(salon, e)}
                        >
                          <CardMembershipIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
            {!loading && salons.length === 0 && <EmptyState colSpan={7} message="No salons found" />}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Row Detail Modal */}
      <DetailModal
        open={Boolean(detailData)}
        onClose={() => setDetailData(null)}
        title={detailData ? `Salon: ${detailData.name}` : 'Details'}
        data={detailData}
      />

      {/* Create Salon Modal */}
      <Dialog open={openCreateModal} onClose={() => setOpenCreateModal(false)} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={handleCreateSalon}>
          <DialogTitle sx={{ fontWeight: 600 }}>Create New Salon</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField label="Salon Name" value={name} onChange={(e) => setName(e.target.value)} required fullWidth />
              <TextField label="Owner Full Name" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} fullWidth />
              <TextField type="email" label="Owner Email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} required fullWidth />
              <TextField type="password" label="Owner Password" value={ownerPassword} onChange={(e) => setOwnerPassword(e.target.value)} required fullWidth />
              <TextField label="Address" value={address} onChange={(e) => setAddress(e.target.value)} fullWidth />
              <TextField label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth />
              <FormControl fullWidth>
                <InputLabel>Initial Plan</InputLabel>
                <Select value={planId} label="Initial Plan" onChange={(e) => setPlanId(e.target.value)}>
                  {plans.map((p) => (
                    <MenuItem key={p._id} value={p._id}>
                      {p.name} - ₹{p.price} ({p.durationInDays} days, max {p.maxStaff} staff)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Geo-Fence Location Config */}
              <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#334155' }}>
                    Geo-Fence Location Config (Optional)
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<LocationOnIcon />}
                    onClick={handleDetectLocation}
                    disabled={detectingLocation}
                    sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                  >
                    {detectingLocation ? 'Detecting...' : 'Detect My Location'}
                  </Button>
                </Stack>
                <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 }}>
                  <TextField
                    label="Latitude"
                    placeholder="19.0760"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    fullWidth
                    size="small"
                    helperText="Leave empty for default"
                  />
                  <TextField
                    label="Longitude"
                    placeholder="72.8777"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    fullWidth
                    size="small"
                    helperText="Leave empty for default"
                  />
                </Stack>
                <TextField
                  label="Allowed Radius (Meters)"
                  placeholder="100"
                  type="number"
                  value={allowedRadius}
                  onChange={(e) => setAllowedRadius(e.target.value)}
                  fullWidth
                  size="small"
                  helperText="Default geo-fence threshold is 100 meters"
                />
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setOpenCreateModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#be4b6e' }}>
              Create Salon
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Assign / Renew Plan Modal */}
      <Dialog open={openPlanModal} onClose={() => setOpenPlanModal(false)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={handleAssignPlan}>
          <DialogTitle sx={{ fontWeight: 600 }}>Assign / Renew Plan</DialogTitle>
          <DialogContent>
            <Typography sx={{ fontSize: '0.85rem', color: '#8a7e82', mb: 2 }}>
              Salon: <strong>{selectedSalon?.name}</strong>
            </Typography>
            <Stack spacing={2.5}>
              <FormControl fullWidth required>
                <InputLabel>Action</InputLabel>
                <Select value={assignAction} label="Action" onChange={(e) => setAssignAction(e.target.value)}>
                  <MenuItem value="ASSIGN">Assign Plan</MenuItem>
                  <MenuItem value="RENEW">Renew Subscription</MenuItem>
                  <MenuItem value="UPGRADE">Upgrade Plan</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth required>
                <InputLabel>Target Plan</InputLabel>
                <Select value={assignPlanId} label="Target Plan" onChange={(e) => setAssignPlanId(e.target.value)}>
                  {plans.map((p) => (
                    <MenuItem key={p._id} value={p._id}>
                      {p.name} - ₹{p.price} ({p.durationInDays} days, max {p.maxStaff} staff)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setOpenPlanModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#be4b6e' }}>
              Apply Plan
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Salons;
