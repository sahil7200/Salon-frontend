import { useState, useEffect, useMemo } from 'react';
import {
  Box, Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow,
  Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, Select, MenuItem, FormControl, InputLabel, Chip, Stack, Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import StorefrontIcon from '@mui/icons-material/Storefront';
import FilterListIcon from '@mui/icons-material/FilterList';
import PageHeader from '../components/common/PageHeader';
import StatusChip from '../components/common/StatusChip';
import TableSkeleton from '../components/common/TableSkeleton';
import DetailModal from '../components/common/DetailModal';
import { getUsers, createUser, getSalons } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [selectedSalonFilter, setSelectedSalonFilter] = useState('ALL');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(user?.role === 'SUPER_ADMIN' ? 'SALON_OWNER' : 'RECEPTIONIST');
  const [salonId, setSalonId] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsers();
      const userList = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setUsers(userList);
      if (user?.role === 'SUPER_ADMIN') {
        const salonRes = await getSalons();
        const salonList = Array.isArray(salonRes.data) ? salonRes.data : (salonRes.data?.data || []);
        setSalons(salonList);
      }
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await createUser({
        name,
        email,
        password,
        role,
        salonId: user?.role === 'SUPER_ADMIN' ? salonId : undefined,
      });
      setSuccess(`User '${name}' created successfully! Credentials: Email ${email} | Password ${password}`);
      setOpenModal(false);
      setName('');
      setEmail('');
      setPassword('');
      setSalonId('');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    }
  };

  // Filtered Users List salon-wise
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Salon Filter
      if (selectedSalonFilter !== 'ALL') {
        const userSalon = u.salonId?._id || u.salonId;
        if (userSalon !== selectedSalonFilter) return false;
      }
      // Role Filter
      if (selectedRoleFilter !== 'ALL') {
        if (u.role !== selectedRoleFilter) return false;
      }
      return true;
    });
  }, [users, selectedSalonFilter, selectedRoleFilter]);

  return (
    <Box>
      <PageHeader
        title="User Management (Salon-Wise)"
        subtitle={user?.role === 'SUPER_ADMIN' ? 'View and manage platform users categorized by salon' : 'Manage receptionist accounts for your salon'}
        actionLabel="Create User"
        actionIcon={<AddIcon />}
        onActionClick={() => setOpenModal(true)}
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

      {/* Salon Filter Toolbar for Super Admin */}
      {user?.role === 'SUPER_ADMIN' && (
        <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Box display="flex" alignItems="center" gap={1} mr={1}>
            <FilterListIcon sx={{ color: '#be4b6e' }} />
            <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#2c2528' }}>
              Filter Users Salon-Wise:
            </Typography>
          </Box>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Salon</InputLabel>
            <Select
              value={selectedSalonFilter}
              label="Salon"
              onChange={(e) => setSelectedSalonFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Salons</MenuItem>
              {salons.map((s) => (
                <MenuItem key={s._id} value={s._id}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={selectedRoleFilter}
              label="Role"
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Roles</MenuItem>
              <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
              <MenuItem value="SALON_OWNER">Salon Owner</MenuItem>
              <MenuItem value="RECEPTIONIST">Receptionist</MenuItem>
            </Select>
          </FormControl>

          {(selectedSalonFilter !== 'ALL' || selectedRoleFilter !== 'ALL') && (
            <Button
              size="small"
              onClick={() => {
                setSelectedSalonFilter('ALL');
                setSelectedRoleFilter('ALL');
              }}
              sx={{ color: '#be4b6e' }}
            >
              Reset Filters
            </Button>
          )}
        </Paper>
      )}

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Salon Business</TableCell>
                <TableCell>Account Status</TableCell>
                <TableCell>Created At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableSkeleton rows={5} columns={6} />
              ) : (
                filteredUsers.map((u) => (
                  <TableRow
                    key={u._id}
                    hover
                    onClick={() => setDetailData(u)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#2c2528' }}>{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={u.role}
                        size="small"
                        color={u.role === 'SUPER_ADMIN' ? 'error' : u.role === 'SALON_OWNER' ? 'primary' : 'default'}
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      {u.salonId?.name ? (
                        <Chip
                          icon={<StorefrontIcon style={{ fontSize: 16 }} />}
                          label={u.salonId.name}
                          size="small"
                          variant="outlined"
                          sx={{ borderColor: '#be4b6e', color: '#be4b6e', fontWeight: 500 }}
                        />
                      ) : (
                        <Typography sx={{ fontSize: '0.85rem', color: '#8a7e82' }}>
                          {u.role === 'SUPER_ADMIN' ? 'Global Platform Admin' : 'Unassigned'}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusChip status={u.status || (u.isActive !== false ? 'ACTIVE' : 'DEACTIVATED')} />
                    </TableCell>
                    <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
              {!loading && filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3, color: '#8a7e82' }}>
                    No users found matching salon criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <DetailModal
        open={Boolean(detailData)}
        onClose={() => setDetailData(null)}
        title={detailData ? `User Profile: ${detailData.name}` : 'Details'}
        data={detailData}
      />

      {/* Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={handleCreateUser}>
          <DialogTitle sx={{ fontWeight: 600 }}>Create New User</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required fullWidth />
              <TextField type="email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
              <TextField type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth />
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select value={role} label="Role" onChange={(e) => setRole(e.target.value)}>
                  {user?.role === 'SUPER_ADMIN' && <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>}
                  {user?.role === 'SUPER_ADMIN' && <MenuItem value="SALON_OWNER">Salon Owner</MenuItem>}
                  <MenuItem value="RECEPTIONIST">Receptionist</MenuItem>
                </Select>
              </FormControl>

              {user?.role === 'SUPER_ADMIN' && (role === 'SALON_OWNER' || role === 'RECEPTIONIST') && (
                <FormControl fullWidth required>
                  <InputLabel>Assign Salon Business</InputLabel>
                  <Select value={salonId} label="Assign Salon Business" onChange={(e) => setSalonId(e.target.value)}>
                    {salons.map((s) => (
                      <MenuItem key={s._id} value={s._id}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#be4b6e' }}>
              Create User
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Users;
