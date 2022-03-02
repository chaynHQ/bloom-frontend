import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircleIcon from '@mui/icons-material/Circle';
import LinkIcon from '@mui/icons-material/Link';
import SlowMotionVideoIcon from '@mui/icons-material/SlowMotionVideo';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { Button, Link as MuiLink, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { GetStaticPathsContext, GetStaticPropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { StoriesParams, StoryData } from 'storyblok-js-client';
import { render } from 'storyblok-rich-text-react-renderer';
import { useCompleteSessionMutation, useStartSessionMutation } from '../../../app/api';
import { Course, Session } from '../../../app/coursesSlice';
import { RootState } from '../../../app/store';
import CrispButton from '../../../components/CrispButton';
import Header from '../../../components/Header';
import Link from '../../../components/Link';
import SessionContentCard from '../../../components/SessionContentCard';
import Video from '../../../components/Video';
import VideoTranscriptModal from '../../../components/VideoTranscriptModal';
import rollbar from '../../../config/rollbar';
import Storyblok, { useStoryblok } from '../../../config/storyblok';
import { LANGUAGES, PROGRESS_STATUS } from '../../../constants/enums';
import {
  SESSION_COMPLETE_ERROR,
  SESSION_COMPLETE_REQUEST,
  SESSION_COMPLETE_SUCCESS,
  SESSION_STARTED_ERROR,
  SESSION_STARTED_REQUEST,
  SESSION_STARTED_SUCCESS,
  SESSION_VIDEO_TRANSCRIPT_CLOSED,
  SESSION_VIDEO_TRANSCRIPT_OPENED,
  SESSION_VIEWED,
} from '../../../constants/events';
import { useTypedSelector } from '../../../hooks/store';
import illustrationPerson4Peach from '../../../public/illustration_person4_peach.svg';
import logEvent, { getEventUserData } from '../../../utils/logEvent';
import { RichTextOptions } from '../../../utils/richText';

interface Props {
  story: StoryData;
  preview: boolean;
  sbParams: StoriesParams;
  messages: any;
  locale: LANGUAGES;
}

const containerStyle = {
  backgroundColor: 'secondary.light',
} as const;

const cardColumnStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: { xs: 2, md: 3 },
} as const;

const dotsStyle = {
  color: 'primary.dark',
  display: 'flex',
  flexDirection: 'column',
  gap: { xs: 1, md: 1.25 },
} as const;

const dotStyle = {
  width: { xs: 8, md: 10 },
  height: { xs: 8, md: 10 },
} as const;

const crispButtonContainerStyle = {
  paddingTop: 2.5,
  paddingBottom: 1,
} as const;

const errorStyle = {
  color: 'primary.dark',
  marginTop: 2,
  fontWeight: 600,
} as const;

const SessionDetail: NextPage<Props> = ({ story, preview, sbParams, messages, locale }) => {
  const t = useTranslations('Courses');
  story = useStoryblok(story, preview, sbParams, messages);

  const { user, partnerAccesses, courses } = useTypedSelector((state: RootState) => state);
  const [incorrectAccess, setIncorrectAccess] = useState<boolean>(true);
  const [liveChatAccess, setLiveChatAccess] = useState<boolean>(false);
  const [sessionProgress, setSessionProgress] = useState<PROGRESS_STATUS>(
    PROGRESS_STATUS.NOT_STARTED,
  );
  const [error, setError] = useState<string | null>(null);
  const [openTranscriptModal, setOpenTranscriptModal] = useState<boolean | null>(null);
  const [videoStarted, setVideoStarted] = useState<boolean>(false);
  const [weekString, setWeekString] = useState<string>('');
  const [completeSession, { isLoading: completeSessionIsLoading }] = useCompleteSessionMutation();
  const [startSession, { isLoading: startSessionIsLoading }] = useStartSessionMutation();

  const eventUserData = getEventUserData({ user, partnerAccesses });
  const eventData = {
    ...eventUserData,
    session_name: story.content.name,
    session_storyblok_id: story.id,
    course_name: story.content.course.content.name,
    course_storyblok_id: story.content.course.id,
  };
  const headerProps = {
    title: story.content.name,
    introduction: story.content.description,
    imageSrc: illustrationPerson4Peach,
    imageAlt: 'alt.personTea',
  };

  useEffect(() => {
    const coursePartners = story.content.course.content.included_for_partners;

    if (partnerAccesses.length === 0 && coursePartners.includes('Public')) {
      setIncorrectAccess(false);
    }

    partnerAccesses.map((partnerAccess) => {
      if (coursePartners.includes(partnerAccess.partner.name)) {
        setIncorrectAccess(false);
      }
    });

    const liveAccess = partnerAccesses.find(function (partnerAccess) {
      return partnerAccess.featureLiveChat === true;
    });
    if (liveAccess) setLiveChatAccess(true);
  }, [partnerAccesses, story.content.course.content.included_for_partners]);

  useEffect(() => {
    story.content.course.content.weeks.map((week: any) => {
      week.sessions.map((session: any) => {
        session === story.uuid && setWeekString(week.name);
      });
    });

    const userCourse = courses.find(function (course: Course) {
      return Number(course.storyblokId) === story.content.course.id;
    });

    if (userCourse) {
      const userSession = userCourse.sessions.find(function (session: Session) {
        return Number(session.storyblokId) === story.id;
      });

      if (userSession) {
        userSession.completed
          ? setSessionProgress(PROGRESS_STATUS.COMPLETED)
          : setSessionProgress(PROGRESS_STATUS.STARTED);
      }
    }
  }, [courses, story]);

  useEffect(() => {
    if (openTranscriptModal === null) return;

    logEvent(
      openTranscriptModal ? SESSION_VIDEO_TRANSCRIPT_OPENED : SESSION_VIDEO_TRANSCRIPT_CLOSED,
      {
        ...eventData,
        session_name: story.content.name,
        course_name: story.content.name,
      },
    );
    if (openTranscriptModal && sessionProgress === PROGRESS_STATUS.NOT_STARTED) {
      callStartSession();
    }
  }, [openTranscriptModal]);

  async function callStartSession() {
    logEvent(SESSION_STARTED_REQUEST, {
      ...eventData,
      session_name: story.content.name,
      course_name: story.content.name,
    });

    const startSessionResponse = await startSession({
      storyblokId: story.id,
    });

    if ('data' in startSessionResponse) {
      logEvent(SESSION_STARTED_SUCCESS, eventData);
    }

    if ('error' in startSessionResponse) {
      const error = startSessionResponse.error;

      logEvent(SESSION_STARTED_ERROR, eventData);
      rollbar.error('Session complete error', error);

      throw error;
    }
  }

  useEffect(() => {
    if (!videoStarted || sessionProgress !== PROGRESS_STATUS.NOT_STARTED) return;

    if (videoStarted) {
      callStartSession();
    }
  }, [videoStarted]);

  useEffect(() => {
    logEvent(SESSION_VIEWED, eventData);
  }, []);

  const Dots = () => {
    return (
      <Box sx={dotsStyle}>
        <CircleIcon sx={dotStyle} />
        <CircleIcon sx={dotStyle} />
      </Box>
    );
  };

  const completeSessionAction = async () => {
    logEvent(SESSION_COMPLETE_REQUEST, eventData);

    const completeSessionResponse = await completeSession({
      storyblokId: story.id,
    });

    if ('data' in completeSessionResponse) {
      logEvent(SESSION_COMPLETE_SUCCESS, eventData);
      window.scrollTo(0, 0);
    }

    if ('error' in completeSessionResponse) {
      const error = completeSessionResponse.error;

      logEvent(SESSION_COMPLETE_ERROR, eventData);
      rollbar.error('Session complete error', error);

      setError(t('errors.completeSessionError'));
      throw error;
    }
  };

  return (
    <Box>
      <Head>
        <title>{story.content.name}</title>
      </Head>
      {incorrectAccess ? (
        <Container sx={containerStyle}></Container>
      ) : (
        <Box>
          <Header
            title={headerProps.title}
            introduction={headerProps.introduction}
            imageSrc={headerProps.imageSrc}
            imageAlt={headerProps.imageAlt}
            progressStatus={sessionProgress}
          >
            <Typography>
              <Link href={`/courses`}>{t('courses')}</Link> /{' '}
              <Link href={`/${story.content.course.full_slug}`}>
                {story.content.course.content.name}
              </Link>
            </Typography>

            <Typography mt={0.5}>
              {weekString} - {t('session')} {story.position / 10 - 1}
            </Typography>
          </Header>
          <Container sx={containerStyle}>
            {story.content.coming_soon && (
              <Box maxWidth={700}>{render(story.content.coming_soon_content, RichTextOptions)}</Box>
            )}
            {!story.content.coming_soon && (
              <Box sx={cardColumnStyle}>
                {story.content.video && (
                  <>
                    <SessionContentCard
                      title={t('sessionDetail.videoTitle')}
                      titleIcon={SlowMotionVideoIcon}
                      eventPrefix="SESSION_VIDEO"
                      eventData={eventData}
                    >
                      <Typography mb={3}>
                        {t.rich('sessionDetail.videoDescription', {
                          transcriptLink: (children) => (
                            <MuiLink
                              component="button"
                              onClick={() => setOpenTranscriptModal(true)}
                            >
                              {children}
                            </MuiLink>
                          ),
                        })}
                      </Typography>
                      <Video
                        url={story.content.video.url}
                        setVideoStarted={setVideoStarted}
                        eventData={eventData}
                        eventPrefix="SESSION"
                        containerStyles={{ mx: 'auto', mb: 2 }}
                      />
                      <VideoTranscriptModal
                        videoName={story.content.name}
                        content={story.content.video_transcript}
                        setOpenTranscriptModal={setOpenTranscriptModal}
                        openTranscriptModal={openTranscriptModal}
                      />
                    </SessionContentCard>
                  </>
                )}
                {story.content.activity.content &&
                  (story.content.activity.content?.length > 1 ||
                    story.content.activity.content[0].content) && (
                    <>
                      <Dots />
                      <SessionContentCard
                        title={t('sessionDetail.activityTitle')}
                        titleIcon={StarBorderIcon}
                        richtextContent
                        eventPrefix="SESSION_ACTIVITY"
                        eventData={eventData}
                      >
                        <>{render(story.content.activity, RichTextOptions)}</>
                      </SessionContentCard>
                    </>
                  )}
                {story.content.bonus.content &&
                  (story.content.bonus.content?.length > 1 ||
                    story.content.bonus.content[0].content) && (
                    <>
                      <Dots />
                      <SessionContentCard
                        title={t('sessionDetail.bonusTitle')}
                        titleIcon={LinkIcon}
                        richtextContent
                        eventPrefix="SESSION_BONUS_CONTENT"
                        eventData={eventData}
                      >
                        <>{render(story.content.bonus, RichTextOptions)}</>
                      </SessionContentCard>
                    </>
                  )}
                {liveChatAccess && (
                  <>
                    <Dots />
                    <SessionContentCard
                      title={t('sessionDetail.chatTitle')}
                      titleIcon={ChatBubbleOutlineIcon}
                      titleIconSize={24}
                      eventPrefix="SESSION_CHAT"
                      eventData={eventData}
                    >
                      <Typography>{t('sessionDetail.chatDescription')}</Typography>
                      <Box sx={crispButtonContainerStyle}>
                        <CrispButton
                          email={user.email}
                          eventData={eventData}
                          buttonText={t('sessionDetail.startChatButton')}
                        />
                      </Box>
                    </SessionContentCard>
                  </>
                )}
                {sessionProgress !== PROGRESS_STATUS.COMPLETED && (
                  <>
                    <Dots />
                    <Button
                      color="secondary"
                      size="large"
                      variant="contained"
                      onClick={completeSessionAction}
                      startIcon={<CheckCircleIcon color="error" />}
                    >
                      {t('sessionDetail.sessionComplete')}
                    </Button>
                  </>
                )}

                {error && <Typography sx={errorStyle}>{error}</Typography>}
              </Box>
            )}
          </Container>
        </Box>
      )}
    </Box>
  );
};

export async function getStaticProps({ locale, preview = false, params }: GetStaticPropsContext) {
  let slug = params?.slug instanceof Array ? params.slug.join('/') : params?.slug;
  let sessionSlug =
    params?.sessionSlug instanceof Array ? params.sessionSlug.join('/') : params?.sessionSlug;

  const extraSbParams = {
    resolve_relations: 'Session.course',
  };

  const sbParams = {
    ...extraSbParams,
    version: preview ? 'draft' : 'published',
    cv: preview ? Date.now() : 0,
  };

  let { data } = await Storyblok.get(`cdn/stories/courses/${slug}/${sessionSlug}/`, sbParams);

  return {
    props: {
      story: data ? data.story : null,
      preview,
      sbParams: extraSbParams,
      messages: {
        ...require(`../../../messages/shared/${locale}.json`),
        ...require(`../../../messages/navigation/${locale}.json`),
        ...require(`../../../messages/courses/${locale}.json`),
      },
      locale,
    },

    revalidate: 3600, // revalidate every hour
  };
}

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  let { data } = await Storyblok.get('cdn/links/?starts_with=courses/');

  let paths: any = [];
  Object.keys(data.links).forEach((linkKey) => {
    if (data.links[linkKey].is_startpage || data.links[linkKey].is_folder) {
      return;
    }

    // get array for slug because of catch all
    const slug = data.links[linkKey].slug;
    let splittedSlug = slug.split('/');

    if (locales) {
      // create additional languages
      for (const locale of locales) {
        paths.push({ params: { slug: splittedSlug[1], sessionSlug: splittedSlug[2] }, locale });
      }
    }
  });

  return {
    paths: paths,
    fallback: false,
  };
}

export default SessionDetail;
