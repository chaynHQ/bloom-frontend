import Circle from '@mui/icons-material/Circle';
import Event from '@mui/icons-material/Event';
import PendingOutlined from '@mui/icons-material/PendingOutlined';
import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { iconTextRowStyle } from '../../styles/common';

interface CourseStatusHeaderProps {
  status: 'liveNow' | 'liveSoon' | 'comingSoon';
}

const CourseStatusHeader = (props: CourseStatusHeaderProps) => {
  const { status } = props;

  const t = useTranslations('Courses');

  const icon =
    status === 'comingSoon' ? (
      <PendingOutlined color="error" />
    ) : status === 'liveSoon' ? (
      <Event color="error" />
    ) : (
      <Circle color="error" />
    );

  return (
    <Box sx={iconTextRowStyle} mb={2}>
      {icon}
      <Typography variant="h3" component="h3" mb={0}>
        {t.rich(status)}
      </Typography>
    </Box>
  );
};

export default CourseStatusHeader;
