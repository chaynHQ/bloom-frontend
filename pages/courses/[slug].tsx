import { Box, Container, Typography } from '@mui/material';
import { GetStaticPathsContext, GetStaticPropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { StoryData } from 'storyblok-js-client';
import { Course } from '../../app/coursesSlice';
import { RootState } from '../../app/store';
import CourseIntroduction from '../../components/CourseIntroduction';
import Header from '../../components/Header';
import Link from '../../components/Link';
import SessionCard from '../../components/SessionCard';
import Storyblok from '../../config/storyblok';
import { PROGRESS_STATUS } from '../../constants/enums';
import { COURSE_OVERVIEW_VIEWED } from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import illustrationPerson4Peach from '../../public/illustration_person4_peach.svg';
import { getEventUserData, logEvent } from '../../utils/logEvent';

interface Props {
  story: StoryData;
  preview: boolean;
  messages: any;
}

const containerStyle = {
  backgroundColor: 'secondary.light',
} as const;

const accessContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  justifyContent: 'center',
} as const;

const sessionsContainerStyle = {
  marginTop: 6,
} as const;

const cardsContainerStyle = {
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  gap: 4,
} as const;

const imageContainerStyle = {
  position: 'relative',
  width: { xs: 150, md: 210 },
  height: { xs: 150, md: 210 },
  marginBottom: 4,
} as const;

const CourseOverview: NextPage<Props> = ({ story, preview, messages }) => {
  const t = useTranslations('Courses');
  const tS = useTranslations('Shared');

  const { user, partnerAccesses, courses } = useTypedSelector((state: RootState) => state);
  const [incorrectAccess, setIncorrectAccess] = useState<boolean>(true);
  const [courseProgress, setCourseProgress] = useState<PROGRESS_STATUS>(
    PROGRESS_STATUS.NOT_STARTED,
  );
  const [sessionsStarted, setSessionsStarted] = useState<Array<number>>([]);
  const [sessionsCompleted, setSessionsCompleted] = useState<Array<number>>([]);
  const eventUserData = getEventUserData({ user, partnerAccesses });
  const eventData = {
    ...eventUserData,
    course_name: story.content.name,
    course_storyblok_id: story.id,
  };

  useEffect(() => {
    const storyPartners = story.content.included_for_partners;

    if (!partnerAccesses && storyPartners.includes('Public')) {
      setIncorrectAccess(false);
    }

    partnerAccesses.map((partnerAccess) => {
      if (storyPartners.includes(partnerAccess.partner.name)) {
        setIncorrectAccess(false);
      }
    });

    const userCourse = courses.find(function (course: Course) {
      return Number(course.storyblokId) === story.id;
    });

    if (userCourse) {
      let courseSessionsStarted: Array<number> = [];
      let courseSessionsCompleted: Array<number> = [];
      userCourse.sessions?.map((session) => {
        if (session.completed) {
          courseSessionsCompleted.push(Number(session.storyblokId));
        } else {
          courseSessionsStarted.push(Number(session.storyblokId));
        }
      });
      setCourseProgress(userCourse.completed ? PROGRESS_STATUS.COMPLETED : PROGRESS_STATUS.STARTED);
      setSessionsStarted(courseSessionsStarted);
      setSessionsCompleted(courseSessionsCompleted);
    }
  }, [partnerAccesses, story, courses, courseProgress]);

  useEffect(() => {
    logEvent(COURSE_OVERVIEW_VIEWED, eventData);
  }, []);

  const headerProps = {
    title: story.content.name,
    introduction: story.content.description,
    imageSrc: story.content.image_with_background?.filename,
    translatedImageAlt: story.content.image_with_background?.alt,
  };

  const getSessionProgress = (sessionId: number) => {
    return sessionsStarted.includes(sessionId)
      ? PROGRESS_STATUS.STARTED
      : sessionsCompleted.includes(sessionId)
      ? PROGRESS_STATUS.COMPLETED
      : null;
  };

  const IncorrectAccess = () => {
    return (
      <Container sx={accessContainerStyle}>
        <Box sx={imageContainerStyle}>
          <Image
            alt={tS('alt.personTea')}
            src={illustrationPerson4Peach}
            layout="fill"
            objectFit="contain"
          />
        </Box>
        <Typography variant="h2" component="h2" mb={2}>
          {t('accessGuard.title')}
        </Typography>
        <Typography variant="body1" component="p" mb={2}>
          {t.rich('accessGuard.introduction', {
            contactLink: (children) => <Link href="/courses">{children}</Link>,
          })}
        </Typography>
      </Container>
    );
  };

  return (
    <Box>
      <Head>
        <title>{story.content.name}</title>
      </Head>
      {incorrectAccess ? (
        <IncorrectAccess />
      ) : (
        <Box>
          <Header
            title={headerProps.title}
            introduction={headerProps.introduction}
            imageSrc={headerProps.imageSrc}
            translatedImageAlt={headerProps.translatedImageAlt}
            progressStatus={courseProgress!}
          />
          <Container sx={containerStyle}>
            {story.content.video && <CourseIntroduction course={story} eventData={eventData} />}

            <Box sx={sessionsContainerStyle}>
              {story.content.weeks.map((week: any) => {
                return (
                  <Box mb={6} key={week.name.split(':')[0]}>
                    <Typography mb={{ xs: 0, md: 3.5 }} key={week.name} component="h2" variant="h2">
                      {week.name}
                    </Typography>
                    <Box sx={cardsContainerStyle}>
                      {week.sessions.map((session: any) => {
                        const sessionProgress = getSessionProgress(session.id);
                        return (
                          <SessionCard
                            key={session.id}
                            session={session}
                            sessionProgress={sessionProgress}
                          />
                        );
                      })}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Container>
        </Box>
      )}
    </Box>
  );
};

export async function getStaticProps({ locale, preview = false, params }: GetStaticPropsContext) {
  let slug = params?.slug instanceof Array ? params.slug.join('/') : params?.slug;

  let sbParams = {
    resolve_relations: 'week.sessions',
    version: preview ? 'draft' : 'published',
    cv: preview ? Date.now() : 0,
  };

  let { data } = await Storyblok.get(`cdn/stories/courses/${slug}`, sbParams);

  return {
    props: {
      story: data ? data.story : null,
      preview,
      messages: {
        ...require(`../../messages/shared/${locale}.json`),
        ...require(`../../messages/navigation/${locale}.json`),
        ...require(`../../messages/courses/${locale}.json`),
      },
    },
    revalidate: 3600, // revalidate every hour
  };
}

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  let { data } = await Storyblok.get('cdn/links/?starts_with=courses/');

  let paths: any = [];
  Object.keys(data.links).forEach((linkKey) => {
    if (!data.links[linkKey].is_startpage) {
      return;
    }

    // get array for slug because of catch all
    const slug = data.links[linkKey].slug;
    let splittedSlug = slug.split('/');

    if (locales) {
      // create additional languages
      for (const locale of locales) {
        paths.push({ params: { slug: splittedSlug[1] }, locale });
      }
    }
  });

  return {
    paths: paths,
    fallback: false,
  };
}

export default CourseOverview;
