'use client';

import ProgressStatus from '@/components/common/ProgressStatus';
import { Link as i18nLink } from '@/i18n/routing';
import { PROGRESS_STATUS } from '@/lib/constants/enums';
import { getDefaultFullSlug } from '@/lib/utils/getDefaultFullSlug';
import { getImageSizes } from '@/lib/utils/imageSizes';
import { rowStyle } from '@/styles/common';
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
  mt: 0,
  '&:hover': {
    backgroundColor: 'background.default',
  },
} as const;

const cardHeaderStyle = {
  ...rowStyle,
  gap: 3,
  alignItems: 'center',
  padding: { xs: 2, sm: 3 },
  paddingBottom: '0.5rem !important',
  minHeight: { xs: 124, md: 136 },
} as const;

const cardActionStyle = {
  borderRadius: 0,
  borderBottom: '2px solid background.default',
  '&:hover': {
    borderBottomColor: 'primary.main',
  },
} as const;

const collapseContentStyle = {
  background: 'white',
  padding: { xs: 2, md: 3 },
  paddingTop: { xs: 0, md: 0 },
} as const;

const cardActionsStyle = {
  paddingLeft: 4,
  paddingTop: 1,
  gap: 1,
  justifyContent: 'flex-end',
  alignItems: 'center',
  borderTop: '2px solid background.default',
  color: 'text.secondary',
  fontFamily: 'merriweather',

  '&:hover': {
    backgroundColor: 'white',
    borderTopColor: 'primary.main',
  },
} as const;

const imageContainerStyle = {
  position: 'relative',
  width: { xs: 100, md: 100, lg: 120 },
  height: { xs: 100, md: 100, lg: 120 },
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

  const cardHeader = (
    <CardContent sx={cardHeaderStyle}>
      <Box sx={imageContainerStyle}>
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
      <Typography component="h3" variant="h3" flex={1} mb={0}>
        {course.content.name}
      </Typography>
    </CardContent>
  );

  return (
    <Card sx={cardStyle}>
      {clickable ? (
        <CardActionArea
          sx={cardActionStyle}
          component={i18nLink}
          href={getDefaultFullSlug(course.full_slug, locale)}
          aria-label={`${t('navigateToCourse')} ${course.content.name}`}
        >
          {cardHeader}
        </CardActionArea>
      ) : (
        <>{cardHeader}</>
      )}
      <CardActions
        sx={{ ...cardActionsStyle, backgroundColor: expanded ? 'white' : 'background.default' }}
      >
        {!!courseProgress && courseProgress !== PROGRESS_STATUS.NOT_STARTED && (
          <ProgressStatus status={courseProgress} />
        )}
        <IconButton
          sx={{ marginLeft: 'auto', transform: expanded ? 'rotate(180deg)' : 'none' }}
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
