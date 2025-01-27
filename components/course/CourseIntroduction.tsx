'use client';

import { Box, Link as MuiLink, Typography } from '@mui/material';
import { ISbRichtext } from '@storyblok/react/rsc';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import {
  COURSE_INTRO_VIDEO_TRANSCRIPT_CLOSED,
  COURSE_INTRO_VIDEO_TRANSCRIPT_OPENED,
} from '../../constants/events';
import { rowStyle } from '../../styles/common';
import { logEvent } from '../../utils/logEvent';
import Video from '../video/Video';
import VideoTranscriptModal from '../video/VideoTranscriptModal';

const containerStyle = {
  ...rowStyle,
  gap: 5,
} as const;

const introductionContainerStyle = {
  maxWidth: '50%',
  flex: 1,
} as const;

interface CourseIntroductionProps {
  video: { url: string };
  name: string;
  video_transcript: ISbRichtext;
  eventData: { [key: string]: any };
}

const CourseIntroduction = (props: CourseIntroductionProps) => {
  const { video, name, video_transcript, eventData } = props;
  const [openTranscriptModal, setOpenTranscriptModal] = useState<boolean | null>(null);

  const t = useTranslations('Courses');

  useEffect(() => {
    if (openTranscriptModal === null) {
      return;
    }

    logEvent(
      openTranscriptModal
        ? COURSE_INTRO_VIDEO_TRANSCRIPT_OPENED
        : COURSE_INTRO_VIDEO_TRANSCRIPT_CLOSED,
      {
        ...eventData,
        course_name: name,
      },
    );
  }, [openTranscriptModal, name, eventData]);

  const IntroductionVideo = () => (
    <Video
      url={video.url}
      eventData={eventData}
      eventPrefix="COURSE_INTRO"
      containerStyles={{ width: { xs: '100%' }, flex: 1 }}
    />
  );

  return (
    <Box sx={containerStyle}>
      <Box sx={introductionContainerStyle}>
        <Typography component="h2" variant="h2">
          {t('courseDetail.introductionTitle')}
        </Typography>
        <Typography mb={4}>
          {t.rich('courseDetail.introductionDescription', {
            transcriptLink: (children) => (
              <MuiLink
                component="button"
                variant="body1"
                onClick={() => setOpenTranscriptModal(true)}
              >
                {children}
              </MuiLink>
            ),
          })}
        </Typography>
        <VideoTranscriptModal
          videoName={name}
          content={video_transcript}
          setOpenTranscriptModal={setOpenTranscriptModal}
          openTranscriptModal={openTranscriptModal}
        />
      </Box>
      <IntroductionVideo />
    </Box>
  );
};

export default CourseIntroduction;
