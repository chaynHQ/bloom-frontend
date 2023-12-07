import { Box } from '@mui/system';

interface ColumnProps {
  children: any;
  width?: string;
}

const Column = (props: ColumnProps) => {
  const { width, children } = props;

  const columnStyles = {
    width:
      width === 'extra-small'
        ? {
            xs: `20%`,
            md: '5%',
          }
        : width === 'small'
        ? { xs: '100%', md: '20%' }
        : width === 'medium'
        ? { xs: '100%', md: '40%' }
        : width === 'large'
        ? { xs: '100%', md: '60%' }
        : width === 'extra-large'
        ? { xs: '100%', md: '80%' }
        : width === 'full-width'
        ? { xs: `100%`, md: '100%' }
        : { xs: `100%`, md: 'auto' },
    ...(!width ? { flex: { md: 1 } } : {}),
  };
  return <Box sx={columnStyles}>{children}</Box>;
};

export default Column;
