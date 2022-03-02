import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
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
import { useState } from 'react';
import { StoryData } from 'storyblok-js-client';
import { PROGRESS_STATUS } from '../constants/enums';
import { rowStyle } from '../styles/common';

interface CourseCardProps {
  course: StoryData;
  courseProgress: PROGRESS_STATUS | null;
}

const cardStyle = {
  alignSelf: 'flex-start',
  width: '100%',
  backgroundColor: 'background.default',
} as const;

const cardContentStyle = {
  ...rowStyle,
  gap: 2,
  padding: { xs: 2, md: 3 },
  paddingBottom: { xs: 1, md: 1 },
  minHeight: { xs: 124, md: 136 },
} as const;

const collapseContentStyle = {
  padding: { xs: 2, md: 3 },
  paddingTop: { xs: 0, md: 0 },
  paddingBottom: { xs: 1, md: 1 },
} as const;

const cardActionsStyle = {
  paddingTop: 0,
  alignItems: 'end',
} as const;

const rowStyles = {
  ...rowStyle,
  gap: 1.5,
} as const;

const CourseCard = (props: CourseCardProps) => {
  const { course, courseProgress } = props;
  const [expanded, setExpanded] = useState<boolean>(false);
  const t = useTranslations('Courses');

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card sx={cardStyle} key={course.id}>
      <CardActionArea
        href={`/${course.full_slug}`}
        aria-label={`${t('navigateToCourse')} ${course.content.name}`}
      >
        <CardContent sx={cardContentStyle}>
          <Image
            alt={course.content.image.alt}
            src={course.content.image.filename}
            width={100}
            height={100}
            objectFit="contain"
          />
          <Box flex={1}>
            <Typography key={course.slug} component="h3" variant="h3">
              {course.content.name}
            </Typography>
            {courseProgress !== PROGRESS_STATUS.NOT_STARTED && (
              <Box sx={rowStyles}>
                {courseProgress === PROGRESS_STATUS.STARTED && (
                  <DonutLargeIcon color="error"></DonutLargeIcon>
                )}
                {courseProgress === PROGRESS_STATUS.COMPLETED && (
                  <CheckCircleIcon color="error"></CheckCircleIcon>
                )}
                <Typography>{courseProgress}</Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
      <CardActions sx={cardActionsStyle}>
        <IconButton
          sx={{ marginLeft: 'auto' }}
          aria-label={`${t('expandSummary')} ${course.content.name}`}
          onClick={handleExpandClick}
          size="small"
        >
          <KeyboardArrowDownIcon color="error"></KeyboardArrowDownIcon>
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
