import { Link as MuiLink, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { StoryData } from 'storyblok-js-client';
import { render } from 'storyblok-rich-text-react-renderer';
import {
  COURSE_INTRO_VIDEO_TRANSCRIPT_CLOSED,
  COURSE_INTRO_VIDEO_TRANSCRIPT_OPENED,
} from '../../constants/events';
import { rowStyle } from '../../styles/common';
import { logEvent } from '../../utils/logEvent';
import { RichTextOptions } from '../../utils/richText';
import Video from '../video/Video';
import VideoTranscriptModal from '../video/VideoTranscriptModal';
import CourseStatusHeader from './CourseStatusHeader';

const containerStyle = {
  ...rowStyle,
  gap: 5,
} as const;

const introductionContainerStyle = {
  maxWidth: '50%',
  flex: 1,
} as const;

interface CourseIntroductionProps {
  course: StoryData;
  courseLiveSoon: boolean;
  courseLiveNow: boolean;
  eventData: {};
}

const CourseIntroduction = (props: CourseIntroductionProps) => {
  const { course, courseLiveSoon, courseLiveNow, eventData } = props;
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
  }, [openTranscriptModal, course, eventData]);

  const IntroductionVideo = () => (
    <Video
      url={course.content.video.url}
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
          videoName={course.content.name}
          content={course.content.video_transcript}
          setOpenTranscriptModal={setOpenTranscriptModal}
          openTranscriptModal={openTranscriptModal}
        />
        {/* Video position switches column depending on if live content shown */}
        {(courseLiveSoon || courseLiveNow) && <IntroductionVideo />}
      </Box>
      {courseLiveSoon ? (
        <Box flex={1}>
          <CourseStatusHeader status="liveSoon" />
          {render(course.content.live_soon_content, RichTextOptions)}
        </Box>
      ) : courseLiveNow ? (
        <Box flex={1}>
          <CourseStatusHeader status="liveNow" />
          {render(course.content.live_now_content, RichTextOptions)}
        </Box>
      ) : (
        <IntroductionVideo />
      )}
    </Box>
  );
};

export default CourseIntroduction;
