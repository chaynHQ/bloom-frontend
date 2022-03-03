import { Link as MuiLink, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { StoryData } from 'storyblok-js-client';
import {
  COURSE_INTRO_VIDEO_TRANSCRIPT_CLOSED,
  COURSE_INTRO_VIDEO_TRANSCRIPT_OPENED,
} from '../../constants/events';
import { rowStyle } from '../../styles/common';
import { logEvent } from '../../utils/logEvent';
import Video from './Video';
import VideoTranscriptModal from './VideoTranscriptModal';

const introductionContainerStyle = {
  ...rowStyle,
  gap: 4,
} as const;

interface CourseIntroductionProps {
  course: StoryData;
  eventData: {};
}

const CourseIntroduction = (props: CourseIntroductionProps) => {
  const { course, eventData } = props;
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
        course_name: course.content.name,
      },
    );
  }, [openTranscriptModal]);

  return (
    <Box sx={introductionContainerStyle}>
      <Box maxWidth={400}>
        <Typography component="h2" variant="h2">
          {t('courseDetail.introductionTitle')}
        </Typography>
        <Typography>
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
          videoName={course.content.name}
          content={course.content.video_transcript}
          setOpenTranscriptModal={setOpenTranscriptModal}
          openTranscriptModal={openTranscriptModal}
        />
      </Box>
      <Video
        url={course.content.video.url}
        eventData={eventData}
        eventPrefix="COURSE_INTRO"
        containerStyles={{ width: { xs: '100%', sm: '70%', md: '55%' } }}
      />
    </Box>
  );
};

export default CourseIntroduction;
