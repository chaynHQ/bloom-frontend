import { Box, Container, Typography } from '@mui/material';
import { GetStaticPathsContext, GetStaticPropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { StoriesParams, StoryData } from 'storyblok-js-client';
import { render } from 'storyblok-rich-text-react-renderer';
import SessionCard from '../../components/cards/SessionCard';
import { ContentUnavailable } from '../../components/common/ContentUnavailable';
import Link from '../../components/common/Link';
import CourseHeader from '../../components/course/CourseHeader';
import CourseIntroduction from '../../components/course/CourseIntroduction';
import CourseStatusHeader from '../../components/course/CourseStatusHeader';
import Storyblok, { useStoryblok } from '../../config/storyblok';
import { LANGUAGES, PROGRESS_STATUS } from '../../constants/enums';
import { COURSE_OVERVIEW_VIEWED } from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import { rowStyle } from '../../styles/common';
import { courseIsLiveNow, courseIsLiveSoon } from '../../utils/courseLiveStatus';
import { determineCourseProgress } from '../../utils/courseProgress';
import hasAccessToPage from '../../utils/hasAccessToPage';
import { getEventUserData, logEvent } from '../../utils/logEvent';
import { RichTextOptions } from '../../utils/richText';

const containerStyle = {
  backgroundColor: 'secondary.light',
} as const;

const sessionsContainerStyle = {
  marginTop: 6,
} as const;

const cardsContainerStyle = {
  ...rowStyle,
  flexDirection: { xs: 'column', md: 'row' },
  gap: 4,
} as const;

interface Props {
  story: StoryData;
  preview: boolean;
  sbParams: StoriesParams;
  locale: LANGUAGES;
}

const CourseOverview: NextPage<Props> = ({ story, preview, sbParams, locale }) => {
  const t = useTranslations('Courses');

  story = useStoryblok(story, preview, sbParams, locale);

  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const courses = useTypedSelector((state) => state.courses);

  const [incorrectAccess, setIncorrectAccess] = useState<boolean>(true);
  const [courseProgress, setCourseProgress] = useState<PROGRESS_STATUS>(
    PROGRESS_STATUS.NOT_STARTED,
  );

  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);

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
  }, [partnerAccesses, story.content.included_for_partners, partnerAdmin]);

  useEffect(() => {
    setCourseProgress(determineCourseProgress(courses, story.id));
  }, [courses, story.id]);

  useEffect(() => {
    logEvent(COURSE_OVERVIEW_VIEWED, eventData);
  });

  if (incorrectAccess) {
    return (
      <ContentUnavailable
        title={t('accessGuard.title')}
        message={t.rich('accessGuard.introduction', {
          contactLink: (children) => <Link href="/courses">{children}</Link>,
        })}
      />
    );
  }

  return (
    <Box>
      <Head>
        <title>{story.content.name}</title>
      </Head>
      <CourseHeader story={story} eventData={eventData} courseProgress={courseProgress} />
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
                        const position = `${t('session')} ${session.position / 10 - 1}`;

                        return (
                          <SessionCard
                            key={session.id}
                            session={session}
                            sessionSubtitle={position}
                            storyblokCourseId={story.id}
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
  return slug.includes('/image-based-abuse-and-rebuilding-ourselves/');
};

export default CourseOverview;
