import { CircularProgress, Container } from '@mui/material';
import { centeredContainerStyle } from '../styles/common';

const LoadingContainer = () => {
  return (
    <Container sx={centeredContainerStyle}>
      <CircularProgress color="error" />
    </Container>
  );
};

export default LoadingContainer;
