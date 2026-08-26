import { TableRow, TableCell, Typography } from '@mui/material';

const EmptyState = ({ colSpan = 5, message = 'No data found' }) => (
  <TableRow>
    <TableCell colSpan={colSpan} align="center" sx={{ py: 6 }}>
      <Typography sx={{ color: '#8a7e82', fontSize: '0.9rem' }}>
        {message}
      </Typography>
    </TableCell>
  </TableRow>
);

export default EmptyState;
