import { Typography } from '@mui/material';
import { Box } from '@mui/system';

interface PlaceholderProps {
  componentName: string;
}

const Placeholder = (props: PlaceholderProps) => {
  const { componentName } = props;

  return (
    <Box>
      <Typography>
        The component <strong>{componentName}</strong> does not exist created yet.
      </Typography>
    </Box>
  );
};

export default Placeholder;
