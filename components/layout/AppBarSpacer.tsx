import { Box, useMediaQuery } from '@mui/material';
import { RootState } from '../../app/store';
import { useTypedSelector } from '../../hooks/store';
import theme from '../../styles/theme';

export const AppBarSpacer = () => {
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const { user } = useTypedSelector((state: RootState) => state);
  return <Box height={{ xs: '3rem', sm: '4rem', md: '8rem' }} marginTop={0}></Box>;
};
