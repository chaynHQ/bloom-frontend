import { Event, PendingOutlined } from '@mui/icons-material';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { useTranslations } from 'next-intl';
import { iconTextRowStyle } from '../../styles/common';

interface CourseStatusHeaderProps {
  status: 'liveNow' | 'liveSoon' | 'comingSoon';
}

const CourseStatusHeader = (props: CourseStatusHeaderProps) => {
  const { status } = props;

  const t = useTranslations('Courses');

  const icon =
    status === 'comingSoon' ? <PendingOutlined color="error" /> : <Event color="error" />;

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
