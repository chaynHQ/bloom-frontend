import { Event, KeyboardArrowDown, PendingOutlined } from '@mui/icons-material';
import {
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Collapse,
  IconButton,
  Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { StoryData } from 'storyblok-js-client';
import { PROGRESS_STATUS } from '../../constants/enums';
import { iconTextRowStyle, rowStyle } from '../../styles/common';
import { courseIsLiveNow, courseIsLiveSoon } from '../../utils/courseLiveStatus';
import { formatDateToString } from '../../utils/dateTime';
import Link from '../common/Link';
import ProgressStatus from '../common/ProgressStatus';

const cardStyle = {
  alignSelf: 'flex-start',
  width: '100%',
  backgroundColor: 'background.default',
} as const;

const cardContentStyle = {
  ...rowStyle,
  gap: 2,
  padding: { xs: 2, md: 3 },
  paddingBottom: '0.5rem !important',
  minHeight: { xs: 124, md: 136 },
} as const;

const cardActionStyle = {
  '&:hover': {
    borderBottom: '2px solid grey',
    borderBottomColor: 'primary.main',
    marginBottom: '-2px',
  },
} as const;

const imageContainerStyle = {
  position: 'relative',
  width: { xs: 80, md: 120 },
  height: { xs: 80, md: 120 },
} as const;

const collapseContentStyle = {
  padding: { xs: 2, md: 3 },
  paddingTop: { xs: 0, md: 0 },
  paddingBottom: '0.5rem !important',
} as const;

const cardActionsStyle = {
  paddingTop: 0,
  alignItems: 'end',
} as const;

const statusRowStyle = {
  ...iconTextRowStyle,
  marginTop: 0,
  marginLeft: 1,
};

interface CourseCardProps {
  course: StoryData;
  courseProgress: PROGRESS_STATUS | null;
  liveCourseAccess: boolean;
}

const CourseCard = (props: CourseCardProps) => {
  const { course, courseProgress, liveCourseAccess } = props;
  const [expanded, setExpanded] = useState<boolean>(false);
  const t = useTranslations('Courses');
  const router = useRouter();
  const locale = router.locale || 'en';

  const courseComingSoon: boolean = course.content.coming_soon;
  const courseLiveSoon: boolean = courseIsLiveSoon(course.content);
  const courseLiveNow: boolean = courseIsLiveNow(course.content);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card sx={cardStyle}>
      <CardActionArea
        sx={cardActionStyle}
        component={Link}
        href={`/${course.full_slug}`}
        aria-label={`${t('navigateToCourse')} ${course.content.name}`}
      >
        <CardContent sx={cardContentStyle}>
          <Box sx={imageContainerStyle}>
            <Image
              alt={course.content.image.alt}
              src={course.content.image.filename}
              layout="fill"
              objectFit="contain"
            />
          </Box>
          <Box flex={1}>
            <Typography component="h3" variant="h3">
              {course.content.name}
            </Typography>
            {!!courseProgress && courseProgress !== PROGRESS_STATUS.NOT_STARTED && (
              <ProgressStatus status={courseProgress} />
            )}
          </Box>
        </CardContent>
      </CardActionArea>
      <CardActions sx={cardActionsStyle}>
        {courseComingSoon && (!courseLiveSoon || !liveCourseAccess) && (
          <Box sx={statusRowStyle}>
            <PendingOutlined color="error" />
            <Typography>{t('comingSoon')}</Typography>
          </Box>
        )}
        {courseLiveSoon && liveCourseAccess && (
          <Box sx={statusRowStyle}>
            <Event color="error" />
            <Typography>
              {t.rich('liveFrom', {
                date: formatDateToString(course.content.live_start_date, locale),
              })}
            </Typography>
          </Box>
        )}
        {courseLiveNow && liveCourseAccess && (
          <Box sx={statusRowStyle}>
            <Event color="error" />
            <Typography>
              {t.rich('liveUntil', {
                date: formatDateToString(course.content.live_end_date, locale),
              })}
            </Typography>
          </Box>
        )}

        <IconButton
          sx={{ marginLeft: 'auto' }}
          aria-label={`${t('expandSummary')} ${course.content.name}`}
          onClick={handleExpandClick}
          size="small"
        >
          <KeyboardArrowDown color="error"></KeyboardArrowDown>
        </IconButton>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={collapseContentStyle}>
          <Typography paragraph>{course.content.description}</Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default CourseCard;
