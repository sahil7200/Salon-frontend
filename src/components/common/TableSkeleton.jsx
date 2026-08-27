import { TableRow, TableCell, Skeleton } from '@mui/material';

const TableSkeleton = ({ rows = 5, columns = 5 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              <Skeleton animation="wave" height={24} width={colIndex === 0 ? '70%' : '50%'} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
};

export default TableSkeleton;
