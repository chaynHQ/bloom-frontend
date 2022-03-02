import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { useTranslations } from 'next-intl';
import { PROGRESS_STATUS } from '../constants/enums';
import { rowStyle } from '../styles/common';

const rowStyles = {
  ...rowStyle,
  gap: 1.5,
  marginTop: 2,
  alignItems: 'center',
} as const;

interface ProgressStatusProps {
  status: PROGRESS_STATUS;
}

const ProgressStatus = (props: ProgressStatusProps) => {
  const { status } = props;
  const tS = useTranslations('Shared.progressStatus');

  if (status === PROGRESS_STATUS.STARTED) {
    return (
      <Box sx={rowStyles}>
        <DonutLargeIcon color="error" />
        <Typography>{tS('started')}</Typography>
      </Box>
    );
  }
  if (status === PROGRESS_STATUS.COMPLETED) {
    return (
      <Box sx={rowStyles}>
        <CheckCircleIcon color="error" />
        <Typography>{tS('completed')}</Typography>
      </Box>
    );
  }
  return <></>;
};

export default ProgressStatus;
