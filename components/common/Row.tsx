import { Box } from '@mui/system';
import { richtextContentStyle, rowStyle } from '../../styles/common';

interface RowProps {
  children: any;
  numberOfColumns: number;
  horizontalAlignment: string;
  verticalAlignment: string;
}

const Row = (props: RowProps) => {
  const { children, horizontalAlignment, verticalAlignment, numberOfColumns } = props;

  const rowStyles = {
    width: '100%',
    gap: { xs: 3, sm: 8 / numberOfColumns, md: 10 / numberOfColumns, lg: 16 / numberOfColumns },
    ...rowStyle,
    textAlign:
      horizontalAlignment === 'center'
        ? 'center'
        : horizontalAlignment === 'right'
        ? 'right'
        : 'left',
    ...(horizontalAlignment && {
      justifyContent:
        horizontalAlignment === 'center'
          ? 'center'
          : horizontalAlignment === 'right'
          ? 'flex-end'
          : 'flex-start',
    }),
    ...(verticalAlignment && {
      alignItems:
        verticalAlignment === 'center'
          ? 'center'
          : verticalAlignment === 'bottom'
          ? 'flex-end'
          : 'flex-start',
    }),
    ...richtextContentStyle,
  } as const;

  return <Box sx={rowStyles}>{children}</Box>;
};

export default Row;
