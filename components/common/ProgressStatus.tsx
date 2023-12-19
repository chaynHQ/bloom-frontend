import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { PROGRESS_STATUS } from '../../constants/enums';
import { iconTextRowStyle } from '../../styles/common';

interface ProgressStatusProps {
  status: PROGRESS_STATUS;
}

const ProgressStatus = (props: ProgressStatusProps) => {
  const { status } = props;
  const tS = useTranslations('Shared.progressStatus');

  if (status === PROGRESS_STATUS.STARTED) {
    return (
      <Box sx={iconTextRowStyle}>
        <DonutLargeIcon color="error" />
        <Typography>{tS('started')}</Typography>
      </Box>
    );
  }
  if (status === PROGRESS_STATUS.COMPLETED) {
    return (
      <Box sx={iconTextRowStyle}>
        <CheckCircleIcon color="error" />
        <Typography>{tS('completed')}</Typography>
      </Box>
    );
  }
  return <></>;
};

export default ProgressStatus;
