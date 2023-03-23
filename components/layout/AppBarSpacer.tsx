import { useMediaQuery } from '@mui/material';
import Box from '@mui/material/Box';
import { RootState } from '../../app/store';
import { useTypedSelector } from '../../hooks/store';
import theme from '../../styles/theme';

const singleNavSpacing = { xs: '3rem', sm: '4rem', md: '3.75rem' };
const doubleNavSpacing = { md: '8rem' };
export const AppBarSpacer = () => {
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const { user } = useTypedSelector((state: RootState) => state);
  const spacing = user.token && !isSmallScreen ? doubleNavSpacing : singleNavSpacing;
  return <Box height={spacing} marginTop={0}></Box>;
};
