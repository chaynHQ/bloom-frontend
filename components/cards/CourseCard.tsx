'use client';

import ProgressStatus from '@/components/common/ProgressStatus';
import { Link as i18nLink } from '@/i18n/routing';
import { PROGRESS_STATUS } from '@/lib/constants/enums';
import { getDefaultFullSlug } from '@/lib/utils/getDefaultFullSlug';
import { getImageSizes } from '@/lib/utils/imageSizes';
import { iconTextRowStyle, rowStyle } from '@/styles/common';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import {
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Collapse,
  IconButton,
  Typography,
} from '@mui/material';
import { ISbStoryData } from '@storyblok/react/rsc';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';

const cardStyle = {
  alignSelf: 'flex-start',
  width: '100%',
  backgroundColor: 'background.default',
  display: 'flex',
  flexDirection: 'column',
} as const;

const cardContentStyle = {
  ...rowStyle,
  gap: 2,
  padding: { xs: 2, md: 3 },
  paddingBottom: '0rem !important',
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
  width: '100%',
  maxHeight: '110px',
  minHeight: '72px',
} as const;

const titleContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
} as const;

const titleStyle = {
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
} as const;

const collapseContentStyle = {
  padding: { xs: 2, md: 3 },
  paddingTop: { xs: 0, md: 0 },
} as const;

const cardActionsStyle = {
  paddingLeft: 4,
  paddingTop: 0,
  justifyContent: 'flex-end',
  alignItems: 'center',
} as const;

const statusRowStyle = {
  ...iconTextRowStyle,
  marginTop: 0,
  marginLeft: 1,
};

interface CourseCardProps {
  course: ISbStoryData;
  courseProgress: PROGRESS_STATUS | null;
  clickable?: boolean;
}

const CourseCard = (props: CourseCardProps) => {
  const { course, courseProgress, clickable = true } = props;
  const [expanded, setExpanded] = useState<boolean>(false);
  const t = useTranslations('Courses');
  const locale = useLocale();

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card sx={cardStyle}>
      {clickable ? (
        <CardActionArea
          sx={cardActionStyle}
          component={i18nLink}
          href={getDefaultFullSlug(course.full_slug, locale)}
          aria-label={`${t('navigateToCourse')} ${course.content.name}`}
        >
          <CardContent sx={cardContentStyle}>
            <Box flex={[2, 1]} sx={imageContainerStyle}>
              <Image
                alt={course.content.image_with_background.alt}
                src={course.content.image_with_background.filename}
                fill
                sizes={getImageSizes(imageContainerStyle.width)}
                style={{
                  objectFit: 'contain',
                }}
              />
            </Box>
            <Box flex={[3, 2]} sx={titleContainerStyle}>
              <Typography component="h3" variant="h3" sx={expanded ? {} : titleStyle}>
                {course.content.name}
              </Typography>
            </Box>
          </CardContent>
        </CardActionArea>
      ) : (
        <CardContent sx={cardContentStyle}>
          <Box sx={imageContainerStyle}>
            <Image
              alt={course.content.image.alt}
              src={course.content.image.filename}
              fill
              sizes={getImageSizes(imageContainerStyle.width)}
              style={{
                objectFit: 'contain',
              }}
            />
          </Box>
          <Box flex={1} sx={titleContainerStyle}>
            <Typography component="h3" variant="h3" sx={expanded ? {} : titleStyle}>
              {course.content.name}
            </Typography>
            {!!courseProgress && courseProgress !== PROGRESS_STATUS.NOT_STARTED && (
              <ProgressStatus status={courseProgress} />
            )}
          </Box>
        </CardContent>
      )}
      <CardActions sx={cardActionsStyle}>
        {!!courseProgress && courseProgress !== PROGRESS_STATUS.NOT_STARTED && (
          <ProgressStatus status={courseProgress} />
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
