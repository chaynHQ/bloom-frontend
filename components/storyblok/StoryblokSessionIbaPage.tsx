import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CircleIcon from '@mui/icons-material/Circle';
import SlowMotionVideoIcon from '@mui/icons-material/SlowMotionVideo';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { Box, Button, Container, Link as MuiLink, Typography } from '@mui/material';
import { ISbRichtext, ISbStoryData, storyblokEditable } from '@storyblok/react';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { render } from 'storyblok-rich-text-react-renderer';
import { PROGRESS_STATUS } from '../../constants/enums';
import {
  SESSION_STARTED_ERROR,
  SESSION_STARTED_REQUEST,
  SESSION_STARTED_SUCCESS,
  SESSION_VIDEO_TRANSCRIPT_CLOSED,
  SESSION_VIDEO_TRANSCRIPT_OPENED,
  SESSION_VIEWED,
} from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import illustrationPerson4Peach from '../../public/illustration_person4_peach.svg';
import { useStartSessionMutation } from '../../store/api';
import { Course, Session } from '../../store/coursesSlice';
import { columnStyle } from '../../styles/common';
import theme from '../../styles/theme';
import hasAccessToPage from '../../utils/hasAccessToPage';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import { RichTextOptions } from '../../utils/richText';
import SessionContentCard from '../cards/SessionContentCard';
import { Dots } from '../common/Dots';
import Link from '../common/Link';
import Header from '../layout/Header';
import MultipleBonusContent, { BonusContent } from '../session/MultipleBonusContent';
import { SessionCompleteButton } from '../session/SessionCompleteButton';
import Video from '../video/Video';
import VideoTranscriptModal from '../video/VideoTranscriptModal';

const containerStyle = {
  backgroundColor: 'secondary.light',
} as const;

const cardColumnStyle = {
  ...columnStyle,
  alignItems: 'center',
  gap: { xs: 2, md: 3 },
} as const;

const dotsStyle = {
  ...columnStyle,
  color: 'primary.dark',
  gap: { xs: 1, md: 1.25 },
} as const;

const dotStyle = {
  width: { xs: 8, md: 10 },
  height: { xs: 8, md: 10 },
} as const;

const sessionSubtitleStyle = {
  marginTop: '0.75rem !important',
} as const;

const chatDetailIntroStyle = { marginTop: 3, marginBottom: 1.5 } as const;

export interface StoryblokSessionIbaPageProps {
  storyId: number;
  storyUuid: string;
  storyPosition: number;
  _uid: string;
  _editable: string;
  course: ISbStoryData;
  name: string;
  subtitle: string;
  seo_description: string;
  description: string;
  video: { url: string };
  video_transcript: ISbRichtext;
  video_outro: ISbRichtext;
  activity: ISbRichtext;
  bonus: BonusContent[];
}

const StoryblokSessionIbaPage = (props: StoryblokSessionIbaPageProps) => {
  const {
    storyId,
    storyUuid,
    storyPosition,
    _uid,
    _editable,
    course,
    name,
    subtitle,
    seo_description,
    description,
    video,
    video_transcript,
    video_outro,
    activity,
    bonus,
  } = props;

  const t = useTranslations('Courses');

  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const userEmail = useTypedSelector((state) => state.user.email);
  const isLoggedIn = useTypedSelector((state) => Boolean(state.user.id));
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const courses = useTypedSelector((state) => state.courses);

  const [incorrectAccess, setIncorrectAccess] = useState<boolean>(true);
  const [liveChatAccess, setLiveChatAccess] = useState<boolean>(false);
  const [sessionProgress, setSessionProgress] = useState<PROGRESS_STATUS>(
    PROGRESS_STATUS.NOT_STARTED,
  );
  const [openTranscriptModal, setOpenTranscriptModal] = useState<boolean | null>(null);
  const [videoStarted, setVideoStarted] = useState<boolean>(false);
  const [weekString, setWeekString] = useState<string>('');
  const [startSession] = useStartSessionMutation();

  const liveCourseAccess = partnerAccesses.length === 0 && !partnerAdmin.id;

  useEffect(() => {
    const coursePartners = course.content.included_for_partners;
    setIncorrectAccess(
      !hasAccessToPage(isLoggedIn, false, coursePartners, partnerAccesses, partnerAdmin),
    );

    const liveAccess = partnerAccesses.find(
      (partnerAccess) => partnerAccess.featureLiveChat === true,
    );

    if (liveAccess || liveCourseAccess) setLiveChatAccess(true);
  }, [partnerAccesses, liveCourseAccess, course.content.included_for_partners, partnerAdmin]);

  // TODO refactor session completion logic
  useEffect(() => {
    course.content.weeks.map((week: any) => {
      week.sessions.map((session: any) => {
        session === storyUuid && setWeekString(week.name);
      });
    });

    const userCourse = courses.find((c: Course) => Number(c.storyblokId) === course.id);

    if (userCourse) {
      const userSession = userCourse.sessions.find(
        (session: Session) => Number(session.storyblokId) === storyId,
      );

      if (userSession) {
        userSession.completed
          ? setSessionProgress(PROGRESS_STATUS.COMPLETED)
          : setSessionProgress(PROGRESS_STATUS.STARTED);
      }
    }
  }, [courses, course.content.weeks, storyId, course.id, storyUuid]);

  useEffect(() => {
    if (openTranscriptModal === null) return;

    logEvent(
      openTranscriptModal ? SESSION_VIDEO_TRANSCRIPT_OPENED : SESSION_VIDEO_TRANSCRIPT_CLOSED,
      {
        ...eventData,
        session_name: name,
        course_name: name,
      },
    );
    if (openTranscriptModal && sessionProgress === PROGRESS_STATUS.NOT_STARTED) {
      callStartSession();
    }
  }, [openTranscriptModal]);

  useEffect(() => {
    if (!videoStarted || sessionProgress !== PROGRESS_STATUS.NOT_STARTED) return;

    if (videoStarted) {
      callStartSession();
    }
  }, [videoStarted]);

  useEffect(() => {
    logEvent(SESSION_VIEWED, eventData);
  }, []);

  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);

  const eventData = {
    ...eventUserData,
    session_name: name,
    session_storyblok_id: storyId,
    session_progress: sessionProgress,
    course_name: course.content.name,
    course_storyblok_id: course.id,
  };

  async function callStartSession() {
    logEvent(SESSION_STARTED_REQUEST, {
      ...eventData,
      session_name: name,
      course_name: name,
    });

    const startSessionResponse = await startSession({
      storyblokId: storyId,
    });

    if (startSessionResponse.data) {
      logEvent(SESSION_STARTED_SUCCESS, eventData);
    }

    if (startSessionResponse.error) {
      const error = startSessionResponse.error;

      logEvent(SESSION_STARTED_ERROR, eventData);
      (window as any).Rollbar?.error('Session started error', error);

      throw error;
    }
  }

  return (
    <Box
      {...storyblokEditable({
        _uid,
        _editable,
        course,
        name,
        subtitle,
        description,
        video,
        video_transcript,
        video_outro,
        activity,
        bonus,
      })}
    >
      <Head>
        <title>{`${t('session')} • ${name} • Bloom`}</title>
        <meta property="og:title" content={name} key="og-title" />
        {seo_description && (
          <meta property="og:description" content={seo_description} key="og-description" />
        )}
      </Head>

      {incorrectAccess ? (
        <Container sx={containerStyle}></Container>
      ) : (
        <Box>
          <Header
            title={name}
            introduction={description}
            imageSrc={illustrationPerson4Peach}
            imageAlt={'alt.personTea'}
            progressStatus={sessionProgress}
          >
            <Button
              variant="outlined"
              href="/courses"
              sx={{ background: theme.palette.background.default }}
              size="small"
              component={Link}
            >
              Courses
            </Button>

            <CircleIcon color="error" sx={{ ...dotStyle, marginX: 1 }} />

            <Button
              variant="outlined"
              sx={{ background: theme.palette.background.default }}
              href={`/${course.full_slug}`}
              size="small"
              component={Link}
            >
              {course.name}
            </Button>
            <Typography sx={sessionSubtitleStyle} variant="body2">
              {weekString} - {subtitle}
            </Typography>
          </Header>
          <Container sx={containerStyle}>
            <Box sx={cardColumnStyle}>
              {video && (
                <>
                  <SessionContentCard
                    title={t('sessionDetail.videoTitle')}
                    titleIcon={SlowMotionVideoIcon}
                    eventPrefix="SESSION_VIDEO"
                    eventData={eventData}
                    initialExpanded={true}
                  >
                    <Typography mb={3}>
                      {t.rich('sessionDetail.videoDescription', {
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
                    <Video
                      url={video.url}
                      setVideoStarted={setVideoStarted}
                      eventData={eventData}
                      eventPrefix="SESSION"
                      containerStyles={{ mx: 'auto', my: 2 }}
                    />
                    <VideoTranscriptModal
                      videoName={name}
                      content={video_transcript}
                      setOpenTranscriptModal={setOpenTranscriptModal}
                      openTranscriptModal={openTranscriptModal}
                    />
                  </SessionContentCard>
                </>
              )}
              {activity.content &&
                (activity.content?.length > 1 || activity.content[0].content) && (
                  <>
                    <Dots />
                    <SessionContentCard
                      title={t('sessionDetail.activityTitle')}
                      titleIcon={StarBorderIcon}
                      richtextContent
                      eventPrefix="SESSION_ACTIVITY"
                      eventData={eventData}
                    >
                      <>{render(activity, RichTextOptions)}</>
                    </SessionContentCard>
                  </>
                )}
              {bonus && <MultipleBonusContent bonus={bonus} eventData={eventData} />}
              {liveChatAccess && (
                <>
                  <Dots />
                  <SessionContentCard
                    title={t('sessionDetail.chat.title')}
                    titleIcon={ChatBubbleOutlineIcon}
                    titleIconSize={24}
                    eventPrefix="SESSION_CHAT"
                    eventData={eventData}
                  >
                    <Typography paragraph>{t('sessionDetail.chat.description')}</Typography>
                    <Typography paragraph>{t('sessionDetail.chat.videoIntro')}</Typography>
                    <Video
                      eventPrefix="SESSION_CHAT_VIDEO"
                      eventData={eventData}
                      url={t('sessionDetail.chat.videoLink')}
                      containerStyles={{ mx: 'auto', my: 2 }}
                    ></Video>
                    <Box sx={chatDetailIntroStyle}>
                      <Typography>{t('sessionDetail.chat.detailIntro')}</Typography>
                    </Box>
                    <Box>
                      <ul>
                        <li>{t('sessionDetail.chat.detailPrivacy')}</li>
                        <li>{t('sessionDetail.chat.detailTimezone')}</li>
                        <li>{t('sessionDetail.chat.detailLanguage')}</li>
                        <li>{t('sessionDetail.chat.detailLegal')}</li>
                        <li>{t('sessionDetail.chat.detailImmediateHelp')}</li>
                      </ul>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                      <Button
                        variant="contained"
                        href="/messaging"
                        component={Link}
                        startIcon={<ChatBubbleOutlineIcon color="error" />}
                      >
                        {t('sessionDetail.chat.startButton')}
                      </Button>
                    </Box>
                  </SessionContentCard>
                </>
              )}
              {sessionProgress !== PROGRESS_STATUS.COMPLETED && (
                <SessionCompleteButton storyId={storyId} eventData={eventData} />
              )}
            </Box>
          </Container>
        </Box>
      )}
    </Box>
  );
};

export default StoryblokSessionIbaPage;
