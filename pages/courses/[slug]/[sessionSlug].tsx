import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import LinkIcon from '@mui/icons-material/Link';
import SlowMotionVideoIcon from '@mui/icons-material/SlowMotionVideo';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { Link as MuiLink, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { GetStaticPathsContext, GetStaticPropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { StoryData } from 'storyblok-js-client';
import { render } from 'storyblok-rich-text-react-renderer';
import { RootState } from '../../../app/store';
import Header from '../../../components/Header';
import SessionContentCard from '../../../components/SessionContentCard';
import Video from '../../../components/Video';
import VideoTranscriptModal from '../../../components/VideoTranscriptModal';
import { LANGUAGES } from '../../../constants/enums';
import {
  SESSION_VIDEO_TRANSCRIPT_CLOSED,
  SESSION_VIDEO_TRANSCRIPT_OPENED,
  SESSION_VIEWED,
} from '../../../constants/events';
import { useTypedSelector } from '../../../hooks/store';
import illustrationTeaPeach from '../../../public/illustration_tea_peach.png';
import logEvent, { getEventUserData } from '../../../utils/logEvent';
import Storyblok from '../../../utils/storyblok';

interface Props {
  story: StoryData;
  preview: boolean;
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
  gap: { xs: 2, md: 4 },
} as const;

const Session: NextPage<Props> = ({ story, preview, messages, locale }) => {
  const t = useTranslations('Courses');
  const tS = useTranslations('Shared');
  const { user, partnerAccesses, courses } = useTypedSelector((state: RootState) => state);
  const [incorrectAccess, setIncorrectAccess] = useState<boolean>(true);
  const [openTranscriptModal, setOpenTranscriptModal] = useState<boolean | null>(null);
  const eventUserData = getEventUserData({ user, partnerAccesses });
  const eventData = {
    ...eventUserData,
    session_name: story.content.name,
    session_storyblok_id: story.id,
  };
  const headerProps = {
    title: story.content.name,
    introduction: story.content.description,
    imageSrc: illustrationTeaPeach,
    imageAlt: 'alt.personTea',
  };

  useEffect(() => {
    const coursePartners = story.content.course.content.included_for_partners;

    if (!partnerAccesses && coursePartners.includes('Public')) {
      setIncorrectAccess(false);
    }

    partnerAccesses.map((partnerAccess) => {
      if (coursePartners.includes(partnerAccess.partner.name)) {
        setIncorrectAccess(false);
      }
    });
  }, [partnerAccesses, story.content.course.content.included_for_partners]);

  useEffect(() => {
    if (openTranscriptModal === null) {
      return;
    }

    logEvent(
      openTranscriptModal ? SESSION_VIDEO_TRANSCRIPT_OPENED : SESSION_VIDEO_TRANSCRIPT_CLOSED,
      {
        ...eventData,
        session_name: story.content.name,
        course_name: story.content.name,
      },
    );
  }, [openTranscriptModal]);

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
          />
          <Container sx={containerStyle}>
            <Box sx={cardColumnStyle}>
              <SessionContentCard
                title={t('sessionDetail.videoTitle')}
                titleIcon={SlowMotionVideoIcon}
              >
                <Typography component="p" variant="body1" mb={3}>
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
                <Video url={story.content.video.url} eventData={eventData} eventPrefix="SESSION" />
                <VideoTranscriptModal
                  videoName={story.content.name}
                  content={story.content.video_transcript}
                  setOpenTranscriptModal={setOpenTranscriptModal}
                  openTranscriptModal={openTranscriptModal}
                />
              </SessionContentCard>

              <SessionContentCard
                title={t('sessionDetail.activityTitle')}
                titleIcon={StarBorderIcon}
                richtextContent
              >
                <div>{render(story.content.activity)}</div>
              </SessionContentCard>

              <SessionContentCard
                title={t('sessionDetail.bonusTitle')}
                titleIcon={LinkIcon}
                richtextContent
              >
                <div>{render(story.content.bonus)}</div>
              </SessionContentCard>

              <SessionContentCard
                title={t('sessionDetail.chatTitle')}
                titleIcon={ChatBubbleOutlineIcon}
                titleIconSize={24}
              >
                <Typography component="p" variant="body1">
                  {t('sessionDetail.chatDescription')}
                </Typography>
              </SessionContentCard>
            </Box>
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

  let sbParams = {
    resolve_relations: 'Session.course',
    version: preview ? 'draft' : 'published',
    cv: preview ? Date.now() : 0,
  };

  let { data } = await Storyblok.get(`cdn/stories/courses/${slug}/${sessionSlug}/`, sbParams);

  return {
    props: {
      story: data ? data.story : null,
      preview,
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

export default Session;
