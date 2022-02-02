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

const imageContainerStyle = {
  position: 'relative',
  width: { xs: 100, md: 100 },
  height: { xs: 100, md: 100 },
} as const;

const CourseCard = (props: CourseCardProps) => {
  const { course, courseProgress } = props;
  const [expanded, setExpanded] = useState<boolean>(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card sx={cardStyle} key={course.id}>
      <CardActionArea href={`/${course.full_slug}`}>
        <CardContent sx={cardContentStyle}>
          <Box sx={imageContainerStyle}>
            <Image
              alt="test"
              src={course.content.image.filename}
              layout="fill"
              objectFit="contain"
            />
          </Box>
          <Box>
            <Typography key={course.slug} component="h3" variant="h3">
              {course.content.name}
            </Typography>
            {courseProgress !== PROGRESS_STATUS.NOT_STARTED && (
              <Box sx={{ ...rowStyles }}>
                {courseProgress === PROGRESS_STATUS.STARTED && (
                  <DonutLargeIcon color="error"></DonutLargeIcon>
                )}
                {courseProgress === PROGRESS_STATUS.COMPLETED && (
                  <CheckCircleIcon color="error"></CheckCircleIcon>
                )}
                <Typography component="p" variant="body1">
                  {courseProgress}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
      <CardActions sx={cardActionsStyle}>
        <IconButton
          sx={{ marginLeft: 'auto' }}
          aria-label="Expand summary"
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
