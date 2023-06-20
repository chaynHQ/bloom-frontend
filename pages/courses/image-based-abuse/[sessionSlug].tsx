import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CircleIcon from '@mui/icons-material/Circle';
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
import { useStartSessionMutation } from '../../../app/api';
import { Course, Session } from '../../../app/coursesSlice';
import { RootState } from '../../../app/store';
import SessionContentCard from '../../../components/cards/SessionContentCard';
import { Dots } from '../../../components/common/Dots';
import Link from '../../../components/common/Link';
import CrispButton from '../../../components/crisp/CrispButton';
import Header from '../../../components/layout/Header';
import MultipleBonusContent from '../../../components/session/MultipleBonusContent';
import { SessionCompleteButton } from '../../../components/session/SessionCompleteButton';
import Video from '../../../components/video/Video';
import VideoTranscriptModal from '../../../components/video/VideoTranscriptModal';
import rollbar from '../../../config/rollbar';
import Storyblok, { useStoryblok } from '../../../config/storyblok';
import { LANGUAGES, PROGRESS_STATUS } from '../../../constants/enums';
import {
  SESSION_STARTED_ERROR,
  SESSION_STARTED_REQUEST,
  SESSION_STARTED_SUCCESS,
  SESSION_VIDEO_TRANSCRIPT_CLOSED,
  SESSION_VIDEO_TRANSCRIPT_OPENED,
  SESSION_VIEWED,
} from '../../../constants/events';
import { useTypedSelector } from '../../../hooks/store';
import illustrationPerson4Peach from '../../../public/illustration_person4_peach.svg';
import { columnStyle } from '../../../styles/common';
import hasAccessToPage from '../../../utils/hasAccessToPage';
import logEvent, { getEventUserData } from '../../../utils/logEvent';
import { RichTextOptions } from '../../../utils/richText';

const containerStyle = {
  backgroundColor: 'secondary.light',
  paddingLeft: { xs: 4, sm: 6 },
  paddingRight: { xs: 4, sm: 6 },
  paddingTop: { xs: 6, sm: 8, lg: 10 },
  paddingBottom: { xs: 6, sm: 8, lg: 10 },
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

const crispButtonContainerStyle = {
  paddingTop: 4,
  paddingBottom: 1,
  display: 'flex',
} as const;

const chatDetailIntroStyle = { marginTop: 3, marginBottom: 1.5 } as const;

interface Props {
  story: StoryData;
  preview: boolean;
  sbParams: StoriesParams;
  locale: LANGUAGES;
}

const SessionDetail: NextPage<Props> = ({ story, preview, sbParams, locale }) => {
  const t = useTranslations('Courses');
  story = useStoryblok(story, preview, sbParams, locale);
  const course = story.content.course.content;

  const { user, partnerAccesses, partnerAdmin, courses } = useTypedSelector(
    (state: RootState) => state,
  );
  const [incorrectAccess, setIncorrectAccess] = useState<boolean>(true);
  const [liveChatAccess, setLiveChatAccess] = useState<boolean>(false);
  const [sessionProgress, setSessionProgress] = useState<PROGRESS_STATUS>(
    PROGRESS_STATUS.NOT_STARTED,
  );
  const [openTranscriptModal, setOpenTranscriptModal] = useState<boolean | null>(null);
  const [videoStarted, setVideoStarted] = useState<boolean>(false);
  const [weekString, setWeekString] = useState<string>('');
  const [startSession] = useStartSessionMutation();

  const eventUserData = getEventUserData({ user, partnerAccesses, partnerAdmin });

  const eventData = {
    ...eventUserData,
    session_name: story.content.name,
    session_storyblok_id: story.id,
    session_progress: sessionProgress,
    course_name: story.content.course.content.name,
    course_storyblok_id: story.content.course.id,
  };

  const headerProps = {
    title: story.content.name,
    introduction: story.content.description,
    imageSrc: illustrationPerson4Peach,
    imageAlt: 'alt.personTea',
  };

  // TODO refactor chat access logic
  useEffect(() => {
    const coursePartners = course.included_for_partners;
    setIncorrectAccess(!hasAccessToPage(coursePartners, partnerAccesses, partnerAdmin));

    const liveAccess = partnerAccesses.find(
      (partnerAccess) => partnerAccess.featureLiveChat === true,
    );

    if (liveAccess) setLiveChatAccess(true);
  }, [partnerAccesses, course.included_for_partners, partnerAdmin]);

  // TODO refactor session completion logic
  useEffect(() => {
    course.weeks.map((week: any) => {
      week.sessions.map((session: any) => {
        session === story.uuid && setWeekString(week.name);
      });
    });

    const userCourse = courses.find(
      (course: Course) => Number(course.storyblokId) === story.content.course.id,
    );

    if (userCourse) {
      const userSession = userCourse.sessions.find(
        (session: Session) => Number(session.storyblokId) === story.id,
      );

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
      rollbar.error('Session started error', error);

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
            <Button variant="outlined" href="/courses" size="small" component={Link}>
              Courses
            </Button>

            <CircleIcon color="error" sx={{ ...dotStyle, marginX: 1 }} />

            <Button
              variant="outlined"
              href={`/${story.content.course.full_slug}`}
              size="small"
              component={Link}
            >
              {course.name}
            </Button>
            <Typography sx={sessionSubtitleStyle} variant="body2">
              {weekString} - {story.content.subtitle}
            </Typography>
          </Header>
          <Box sx={containerStyle}>
            <Box sx={cardColumnStyle}>
              {story.content.video && (
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
                      url={story.content.video.url}
                      setVideoStarted={setVideoStarted}
                      eventData={eventData}
                      eventPrefix="SESSION"
                      containerStyles={{ mx: 'auto', my: 2 }}
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
              {story.content.bonus && <MultipleBonusContent story={story} eventData={eventData} />}
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
                    <Box sx={crispButtonContainerStyle}>
                      <CrispButton
                        email={user.email}
                        eventData={eventData}
                        buttonText={t('sessionDetail.chat.startButton')}
                      />
                    </Box>
                  </SessionContentCard>
                </>
              )}
              {sessionProgress !== PROGRESS_STATUS.COMPLETED && (
                <SessionCompleteButton story={story} eventData={eventData} />
              )}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export async function getStaticProps({ locale, preview = false, params }: GetStaticPropsContext) {
  let sessionSlug =
    params?.sessionSlug instanceof Array ? params.sessionSlug.join('/') : params?.sessionSlug;

  const sbParams = {
    resolve_relations: 'session_iba.course',
    version: preview ? 'draft' : 'published',
    language: locale,
    ...(preview && { cv: Date.now() }),
  };

  let { data } = await Storyblok.get(
    `cdn/stories/courses/image-based-abuse/${sessionSlug}/`,
    sbParams,
  );

  return {
    props: {
      story: data ? data.story : null,
      preview,
      sbParams: JSON.stringify(sbParams),
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
  let { data } = await Storyblok.get('cdn/links/?starts_with=courses/image-based-abuse');

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
