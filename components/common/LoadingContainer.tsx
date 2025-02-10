'use client';

import { CircularProgress, Container } from '@mui/material';

const centeredContainerStyle = {
  display: 'flex',
  height: '100vh',
  justifyContent: 'center',
  alignItems: 'center',
} as const;

const LoadingContainer = () => {
  return (
    <Container sx={centeredContainerStyle} data-testid="LoadingContainer">
      <CircularProgress color="error" />
    </Container>
  );
};

export default LoadingContainer;
