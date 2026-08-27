import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { getSubscriptionHistory } from '../services/api';
import PageHeader from '../components/common/PageHeader';
import StatusChip from '../components/common/StatusChip';
import EmptyState from '../components/common/EmptyState';
import TableSkeleton from '../components/common/TableSkeleton';
import DetailModal from '../components/common/DetailModal';

const SubscriptionHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailData, setDetailData] = useState(null);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getSubscriptionHistory();
      const historyList = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setHistory(historyList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  return (
    <Box>
      <PageHeader title="Subscription History" subtitle="Track all plan assignments, renewals, and upgrades" />

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
              <TableCell>Performed By</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableSkeleton rows={5} columns={7} />
            ) : (
              history.map((h) => (
                <TableRow
                  key={h._id}
                  hover
                  onClick={() => setDetailData(h)}
                  sx={{ cursor: 'pointer' }}
                >
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
                  <TableCell>{h.performedBy?.name || 'System'}</TableCell>
                </TableRow>
              ))
            )}
            {!loading && history.length === 0 && <EmptyState colSpan={7} message="No subscription history found" />}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Row Detail Modal */}
      <DetailModal
        open={Boolean(detailData)}
        onClose={() => setDetailData(null)}
        title="Subscription History Record"
        data={detailData}
      />
    </Box>
  );
};

export default SubscriptionHistory;
