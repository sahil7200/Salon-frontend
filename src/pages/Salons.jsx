import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { getSalons } from '../services/api';
import PageHeader from '../components/common/PageHeader';
import StatusChip from '../components/common/StatusChip';
import EmptyState from '../components/common/EmptyState';

const Salons = () => {
  const [salons, setSalons] = useState([]);

  const loadSalons = useCallback(async () => {
    try {
      const { data } = await getSalons();
      setSalons(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => { loadSalons(); }, [loadSalons]);

  return (
    <Box>
      <PageHeader title="Salons" subtitle="All registered salon businesses" />

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
    </Box>
  );
};

export default Salons;
