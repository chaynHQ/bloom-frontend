'use client';

import { topBarSpacerStyle } from '@/styles/common';
import { CircularProgress, Container } from '@mui/material';

const centeredContainerStyle = {
  display: 'flex',
  minHeight: {
    xs: `calc(100vh - ${topBarSpacerStyle.height.xs})`,
    md: `calc(100vh - ${topBarSpacerStyle.height.md})`,
  },
  justifyContent: 'center',
  alignItems: 'center',
} as const;

const LoadingContainer = () => {
  return (
    <Container sx={centeredContainerStyle}>
      <CircularProgress color="error" />
    </Container>
  );
};

export default LoadingContainer;
