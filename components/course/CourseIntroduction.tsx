import { Box, Link as MuiLink, Typography } from '@mui/material';
import { ISbRichtext } from '@storyblok/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { render } from 'storyblok-rich-text-react-renderer';
import {
  COURSE_INTRO_VIDEO_TRANSCRIPT_CLOSED,
  COURSE_INTRO_VIDEO_TRANSCRIPT_OPENED,
} from '../../constants/events';
import { rowStyle } from '../../styles/common';
import { EventUserData, logEvent } from '../../utils/logEvent';
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
  video: { url: string };
  name: string;
  video_transcript: ISbRichtext;
  live_soon_content: ISbRichtext;
  live_now_content: ISbRichtext;
  courseLiveSoon?: boolean;
  courseLiveNow?: boolean;
  liveCourseAccess?: boolean;
  eventData: EventUserData;
}

const CourseIntroduction = (props: CourseIntroductionProps) => {
  const {
    video,
    name,
    video_transcript,
    live_soon_content,
    live_now_content,
    courseLiveSoon = false,
    courseLiveNow = false,
    liveCourseAccess = false,
    eventData,
  } = props;
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
        {/* Video position switches column depending on if live content shown */}
        {liveCourseAccess && (courseLiveSoon || courseLiveNow) && <IntroductionVideo />}
      </Box>
      {liveCourseAccess && courseLiveSoon ? (
        <Box flex={1}>
          <CourseStatusHeader status="liveSoon" />
          {render(live_soon_content, RichTextOptions)}
        </Box>
      ) : liveCourseAccess && courseLiveNow ? (
        <Box flex={1}>
          <CourseStatusHeader status="liveNow" />
          {render(live_now_content, RichTextOptions)}
        </Box>
      ) : (
        <IntroductionVideo />
      )}
    </Box>
  );
};

export default CourseIntroduction;
