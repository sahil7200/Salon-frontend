import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { getSubscriptionHistory } from '../services/api';
import PageHeader from '../components/common/PageHeader';
import StatusChip from '../components/common/StatusChip';
import EmptyState from '../components/common/EmptyState';

const SubscriptionHistory = () => {
  const [history, setHistory] = useState([]);

  const loadHistory = useCallback(async () => {
    try {
      const res = await getSubscriptionHistory();
      const historyList = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setHistory(historyList);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  return (
    <Box>
      <PageHeader title="Subscription History" subtitle="Track all plan assignments and renewals" />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Salon</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.map((h) => (
              <TableRow key={h._id}>
                <TableCell>
                  <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                    {h.salonId?.name || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>{h.planId?.name || 'N/A'}</TableCell>
                <TableCell>
                  <StatusChip status={h.action} />
                </TableCell>
                <TableCell>₹{h.price}</TableCell>
                <TableCell>{new Date(h.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(h.endDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(h.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
            {history.length === 0 && <EmptyState colSpan={7} message="No subscription history found" />}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SubscriptionHistory;
