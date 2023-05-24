import { Box, Button, Container, Typography } from '@mui/material';
import { GetStaticPathsContext, GetStaticPropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { StoriesParams, StoryData } from 'storyblok-js-client';
import { render } from 'storyblok-rich-text-react-renderer';
import { Course } from '../../app/coursesSlice';
import { RootState } from '../../app/store';
import SessionCard from '../../components/cards/SessionCard';
import Link from '../../components/common/Link';
import CourseIntroduction from '../../components/course/CourseIntroduction';
import CourseStatusHeader from '../../components/course/CourseStatusHeader';
import Header from '../../components/layout/Header';
import Storyblok, { useStoryblok } from '../../config/storyblok';
import { LANGUAGES, PROGRESS_STATUS } from '../../constants/enums';
import { COURSE_OVERVIEW_VIEWED } from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import illustrationPerson4Peach from '../../public/illustration_person4_peach.svg';
import { columnStyle, rowStyle } from '../../styles/common';
import { courseIsLiveNow, courseIsLiveSoon } from '../../utils/courseLiveStatus';
import hasAccessToPage from '../../utils/hasAccessToPage';
import { getEventUserData, logEvent } from '../../utils/logEvent';
import { RichTextOptions } from '../../utils/richText';

const containerStyle = {
  backgroundColor: 'secondary.light',
} as const;

const accessContainerStyle = {
  ...columnStyle,
  height: '100vh',
} as const;

const sessionsContainerStyle = {
  marginTop: 6,
} as const;

const cardsContainerStyle = {
  ...rowStyle,
  flexDirection: { xs: 'column', md: 'row' },
  gap: 4,
} as const;

const imageContainerStyle = {
  position: 'relative',
  width: { xs: 150, md: 210 },
  height: { xs: 150, md: 210 },
  marginBottom: 4,
} as const;

interface Props {
  story: StoryData;
  preview: boolean;
  sbParams: StoriesParams;
  locale: LANGUAGES;
}

const CourseOverview: NextPage<Props> = ({ story, preview, sbParams, locale }) => {
  const t = useTranslations('Courses');
  const tS = useTranslations('Shared');

  story = useStoryblok(story, preview, sbParams, locale);

  const { user, partnerAccesses, partnerAdmin, courses } = useTypedSelector(
    (state: RootState) => state,
  );
  const [incorrectAccess, setIncorrectAccess] = useState<boolean>(true);
  const [courseProgress, setCourseProgress] = useState<PROGRESS_STATUS>(
    PROGRESS_STATUS.NOT_STARTED,
  );
  const [sessionsStarted, setSessionsStarted] = useState<Array<number>>([]);
  const [sessionsCompleted, setSessionsCompleted] = useState<Array<number>>([]);
  const eventUserData = getEventUserData({ user, partnerAccesses, partnerAdmin });

  const courseComingSoon: boolean = story.content.coming_soon;
  const courseLiveSoon: boolean = courseIsLiveSoon(story.content);
  const courseLiveNow: boolean = courseIsLiveNow(story.content);
  // only show live content to public users
  const liveCourseAccess = partnerAccesses.length === 0 && !partnerAdmin.id;

  const eventData = {
    ...eventUserData,
    course_name: story.content.name,
    course_storyblok_id: story.id,
    course_coming_soon: courseComingSoon,
    course_live_soon: courseLiveSoon,
    course_live_now: courseLiveNow,
    course_progress: courseProgress,
  };

  useEffect(() => {
    const storyPartners = story.content.included_for_partners;
    setIncorrectAccess(!hasAccessToPage(storyPartners, partnerAccesses, partnerAdmin));

    const userCourse = courses.find((course: Course) => course.storyblokId === story.id);

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
      : PROGRESS_STATUS.NOT_STARTED;
  };

  if (incorrectAccess) {
    return (
      // TODO (170322-1604) Use new content unavailable component here
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
        <Typography mb={2}>
          {t.rich('accessGuard.introduction', {
            contactLink: (children) => <Link href="/courses">{children}</Link>,
          })}
        </Typography>
      </Container>
    );
  }

  return (
    <Box>
      <Head>
        <title>{story.content.name}</title>
      </Head>
      <Header
        title={headerProps.title}
        introduction={headerProps.introduction}
        imageSrc={headerProps.imageSrc}
        translatedImageAlt={headerProps.translatedImageAlt}
        progressStatus={courseProgress!}
      >
        <Button variant="outlined" href="/courses" size="small" component={Link}>
          {t('backToCourses')}
        </Button>
      </Header>
      <Container sx={containerStyle}>
        {courseComingSoon ? (
          <>
            {liveCourseAccess && courseLiveSoon ? (
              <Box maxWidth={700}>
                <CourseStatusHeader status="liveSoon" />
                {render(story.content.live_soon_content, RichTextOptions)}
              </Box>
            ) : (
              <Box maxWidth={700}>
                <CourseStatusHeader status="comingSoon" />
                {render(story.content.coming_soon_content, RichTextOptions)}
              </Box>
            )}
          </>
        ) : (
          <>
            {story.content.video && (
              <CourseIntroduction
                course={story}
                eventData={eventData}
                courseLiveSoon={courseLiveSoon}
                courseLiveNow={courseLiveNow}
                liveCourseAccess={liveCourseAccess}
              />
            )}
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
          </>
        )}
      </Container>
    </Box>
  );
};

export async function getStaticProps({ locale, preview = false, params }: GetStaticPropsContext) {
  const slug = params?.slug instanceof Array ? params.slug.join('/') : params?.slug;

  const sbParams = {
    resolve_relations: 'week.sessions',
    version: preview ? 'draft' : 'published',
    language: locale,
    ...(preview && { cv: Date.now() }),
  };

  let { data } = await Storyblok.get(`cdn/stories/courses/${slug}`, sbParams);

  return {
    props: {
      story: data ? data.story : null,
      preview,
      sbParams: JSON.stringify(sbParams),
      messages: {
        ...require(`../../messages/shared/${locale}.json`),
        ...require(`../../messages/navigation/${locale}.json`),
        ...require(`../../messages/courses/${locale}.json`),
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
    if (
      !data.links[linkKey].is_startpage ||
      isAlternativelyHandledCourse(data.links[linkKey].slug)
    ) {
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

const isAlternativelyHandledCourse = (slug: string) => {
  return slug.includes('/image-based-abuse/');
};

export default CourseOverview;
