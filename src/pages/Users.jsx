import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow,
  Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, Select, MenuItem, FormControl, InputLabel, Chip, Stack
} from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import StatusChip from '../components/common/StatusChip';
import { getUsers, createUser, getSalons } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  return (
    <Box>
      <PageHeader
        title="User Management"
        subtitle={user?.role === 'SUPER_ADMIN' ? 'Manage platform users & salon credentials' : 'Manage receptionist accounts for your salon'}
        actionLabel="Create User"
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

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Salon</TableCell>
                <TableCell>Created At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u._id}>
                  <TableCell sx={{ fontWeight: 500 }}>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={u.role}
                      size="small"
                      color={u.role === 'SUPER_ADMIN' ? 'error' : u.role === 'SALON_OWNER' ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>{u.salonId?.name || (u.role === 'SUPER_ADMIN' ? 'Global Admin' : '-')}</TableCell>
                  <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: '#8a7e82' }}>
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={handleCreateUser}>
          <DialogTitle sx={{ fontWeight: 600 }}>Create New User</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
              />
              <TextField
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
              />
              <TextField
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select value={role} label="Role" onChange={(e) => setRole(e.target.value)}>
                  {user?.role === 'SUPER_ADMIN' && <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>}
                  {user?.role === 'SUPER_ADMIN' && <MenuItem value="SALON_OWNER">Salon Owner</MenuItem>}
                  <MenuItem value="RECEPTIONIST">Receptionist</MenuItem>
                </Select>
              </FormControl>

              {user?.role === 'SUPER_ADMIN' && role === 'RECEPTIONIST' && (
                <FormControl fullWidth required>
                  <InputLabel>Assign Salon</InputLabel>
                  <Select value={salonId} label="Assign Salon" onChange={(e) => setSalonId(e.target.value)}>
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
