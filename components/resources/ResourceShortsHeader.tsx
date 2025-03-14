'use client';

import ProgressStatus from '@/components/common/ProgressStatus';
import { ResourceShortVideo } from '@/components/resources/ResourceShortVideo';
import { Link as i18nLink } from '@/i18n/routing';
import { PROGRESS_STATUS } from '@/lib/constants/enums';
import { RESOURCE_SHORT_VIDEO_VISIT_SESSION } from '@/lib/constants/events';
import { getDefaultFullSlug } from '@/lib/utils/getDefaultFullSlug';
import logEvent from '@/lib/utils/logEvent';
import { breadcrumbButtonStyle, columnStyle, rowStyle } from '@/styles/common';
import theme from '@/styles/theme';
import { Box, Button, Container, Typography } from '@mui/material';
import { ISbRichtext, ISbStoryData } from '@storyblok/react/rsc';
import { useLocale, useTranslations } from 'next-intl';

const headerStyle = { ...rowStyle, flexWrap: { xs: 'wrap', md: 'no-wrap' }, gap: 5 } as const;
const headerRightStyle = {
  ...columnStyle,
  justifyContent: 'flex-end',
  flex: { md: 1 },
  width: { md: '100%' },
  height: { md: 290 },
} as const;

const headerLeftStyles = {
  width: 514, // >515px enables the "watch on youtube" button
  maxWidth: '100%',
} as const;

interface ResourceShortHeaderProps {
  storyId: number;
  name: string;
  resourceProgress: PROGRESS_STATUS;
  relatedSession?: ISbStoryData;
  relatedCourse?: ISbStoryData;
  video: { url: string };
  video_transcript: ISbRichtext;
  eventData: { [key: string]: any };
}

export const ResourceShortHeader = (props: ResourceShortHeaderProps) => {
  const {
    storyId,
    name,
    relatedSession,
    relatedCourse,
    resourceProgress,
    video,
    video_transcript,
    eventData,
  } = props;
  const t = useTranslations('Resources');
  const locale = useLocale();

  const redirectToSession = () => {
    logEvent(RESOURCE_SHORT_VIDEO_VISIT_SESSION, {
      ...eventData,
      shorts_name: name,
      session_name: relatedSession?.name,
    });
  };

  return (
    <Container sx={{ background: theme.palette.bloomGradient }}>
      <Button
        variant="contained"
        sx={{ ...breadcrumbButtonStyle, mb: 4 }}
        href="/courses?section=shorts"
        component={i18nLink}
        size="small"
      >
        {t('backToShorts')}
      </Button>
      <Typography variant="h1" maxWidth={600}>
        {name}
      </Typography>
      <Box sx={headerStyle}>
        <Box sx={headerLeftStyles}>
          <ResourceShortVideo
            eventData={eventData}
            resourceProgress={resourceProgress}
            name={name}
            storyId={storyId}
            video={video}
            video_transcript={video_transcript}
          />
          {resourceProgress && <ProgressStatus status={resourceProgress} />}
        </Box>
        {relatedSession && (
          <Box sx={headerRightStyle}>
            {/* Description field is not currently displayed */}
            {/* {render(description, RichTextOptions)} */}

            <Typography component="h2" mb={2}>
              {t('sessionDetail', {
                sessionNumber: relatedSession.position / 10 - 1,
                sessionName: relatedSession.content.name,
                courseName: relatedCourse?.content.name,
              })}
            </Typography>
            <Button
              href={getDefaultFullSlug(relatedSession.full_slug, locale)}
              component={i18nLink}
              onClick={redirectToSession}
              variant="contained"
              color="secondary"
              sx={{ mr: 'auto' }}
            >
              {t('sessionButtonLabel')}
            </Button>
          </Box>
        )}
        {relatedCourse && !relatedSession && (
          <Box sx={headerRightStyle}>
            <Typography component="h2" mb={2}>
              {t('sessionDetail', {
                sessionNumber: 0,
                sessionName: relatedCourse.content.name,
                courseName: relatedCourse.content.name,
              })}
            </Typography>
            <Button
              href={getDefaultFullSlug(relatedCourse.full_slug, locale)}
              component={i18nLink}
              onClick={redirectToSession}
              variant="contained"
              color="secondary"
              sx={{ mr: 'auto' }}
            >
              {t('sessionButtonLabel')}
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};
