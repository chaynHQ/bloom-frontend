import { Box, Container, Grid, Typography } from '@mui/material';
import { ISbStoriesParams, ISbStoryData, getStoryblokApi } from '@storyblok/react';
import Cookies from 'js-cookie';
import { GetStaticPropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { EmailRemindersSettingsBanner } from '../../components/banner/EmailRemindersSettingsBanner';
import { SignUpBanner } from '../../components/banner/SignUpBanner';
import CourseCard from '../../components/cards/CourseCard';
import { RelatedContentCard } from '../../components/cards/RelatedContentCard';
import Carousel from '../../components/common/Carousel';
import Column from '../../components/common/Column';
import LoadingContainer from '../../components/common/LoadingContainer';
import PageSection from '../../components/common/PageSection';
import Row from '../../components/common/Row';
import Header from '../../components/layout/Header';
import { FeatureFlag } from '../../config/featureFlag';
import {
  EMAIL_REMINDERS_FREQUENCY,
  PROGRESS_STATUS,
  RESOURCE_CATEGORIES,
  STORYBLOK_COLORS,
} from '../../constants/enums';
import { COURSE_LIST_VIEWED } from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import illustrationCourses from '../../public/illustration_courses.svg';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import { capitaliseFirstLetter } from '../../utils/strings';

const containerStyle = {
  backgroundColor: 'secondary.light',
  paddingTop: { xs: 2, sm: 2, md: 2 },
  paddingBottom: { xs: 6, sm: 6, md: 8 },
} as const;

interface Props {
  stories: ISbStoryData[];
  conversations: ISbStoryData[];
  shorts: ISbStoryData[];
}

const CourseList: NextPage<Props> = ({ stories, conversations, shorts }) => {
  const [loadedCourses, setLoadedCourses] = useState<ISbStoryData[] | null>(null);
  const [coursesStarted, setCoursesStarted] = useState<Array<number>>([]);
  const [coursesCompleted, setCoursesCompleted] = useState<Array<number>>([]);
  const [showEmailRemindersBanner, setShowEmailRemindersBanner] = useState<boolean>(false);

  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const userId = useTypedSelector((state) => state.user.id);
  const userEmailRemindersFrequency = useTypedSelector(
    (state) => state.user.emailRemindersFrequency,
  );
  const entryPartnerReferral = useTypedSelector((state) => state.user.entryPartnerReferral);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const courses = useTypedSelector((state) => state.courses);

  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);
  const t = useTranslations('Courses');

  const headerProps = {
    title: t('title'),
    introduction: t('introduction'),
    imageSrc: illustrationCourses,
    imageAlt: 'alt.personSitting',
  };

  useEffect(() => {
    logEvent(COURSE_LIST_VIEWED, eventUserData);
  }, []);

  useEffect(() => {
    if (
      userEmailRemindersFrequency &&
      userEmailRemindersFrequency === EMAIL_REMINDERS_FREQUENCY.NEVER
    ) {
      setShowEmailRemindersBanner(true);
    }
  }, [userEmailRemindersFrequency]);

  useEffect(() => {
    const referralPartner = Cookies.get('referralPartner') || entryPartnerReferral;

    if (partnerAdmin && partnerAdmin.partner) {
      const partnerName = partnerAdmin.partner.name;
      const coursesWithAccess = stories.filter((course) =>
        course.content.included_for_partners.includes(partnerName),
      );
      setLoadedCourses(coursesWithAccess);
    } else if (partnerAccesses && partnerAccesses.length > 0) {
      let userPartners: Array<string> = [];

      partnerAccesses.map((partnerAccess) => {
        if (partnerAccess.partner.name) {
          userPartners.push(partnerAccess.partner.name);
        }
      });

      const coursesWithAccess = stories.filter((story) =>
        userPartners.some((partner) => story.content.included_for_partners.includes(partner)),
      );
      setLoadedCourses(coursesWithAccess);
    } else if (referralPartner && !userId) {
      const coursesWithAccess = stories.filter((story) =>
        story.content.included_for_partners.includes(capitaliseFirstLetter(referralPartner)),
      );
      setLoadedCourses(coursesWithAccess);
    } else {
      const coursesWithAccess = stories.filter((story) =>
        story.content.included_for_partners.includes('Public'),
      );
      setLoadedCourses(coursesWithAccess);
    }

    if (courses) {
      let courseCoursesStarted: Array<number> = [];
      let courseCoursesCompleted: Array<number> = [];
      courses.map((course) => {
        if (course.completed) {
          courseCoursesCompleted.push(course.storyblokId);
        } else {
          courseCoursesStarted.push(course.storyblokId);
        }
      });
      setCoursesStarted(courseCoursesStarted);
      setCoursesCompleted(courseCoursesCompleted);
    }
  }, [partnerAccesses, partnerAdmin, stories, courses]);

  const getCourseProgress = (courseId: number) => {
    return coursesStarted.includes(courseId)
      ? PROGRESS_STATUS.STARTED
      : coursesCompleted.includes(courseId)
        ? PROGRESS_STATUS.COMPLETED
        : null;
  };

  return (
    <Box>
      <Head>
        <title>{`${t('title')} • Bloom`}</title>
        <meta property="og:title" content={t('courses')} key="og-title" />
        <meta property="og:description" content={t('introduction')} key="og-description" />
      </Head>
      <Header
        title={headerProps.title}
        introduction={headerProps.introduction}
        imageSrc={headerProps.imageSrc}
        imageAlt={headerProps.imageAlt}
      />
      <Container sx={containerStyle}>
        {loadedCourses === null ? (
          <LoadingContainer />
        ) : loadedCourses.length === 0 ? (
          <Box>
            <Typography>{t('noCourses')}</Typography>
          </Box>
        ) : (
          <Grid
            container
            columnSpacing={2}
            rowSpacing={[0, 2]}
            justifyContent={['center', 'flex-start']}
          >
            {loadedCourses?.map((course) => {
              const courseProgress = userId ? getCourseProgress(course.id) : null;
              return (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={6}
                  lg={4}
                  height="100%"
                  maxWidth="400px"
                  key={course.id}
                >
                  <CourseCard key={course.id} course={course} courseProgress={courseProgress} />
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
      {conversations.length > 0 && (
        <PageSection color={STORYBLOK_COLORS.SECONDARY_MAIN} alignment="left">
          <Row numberOfColumns={1} horizontalAlignment="left" verticalAlignment="center">
            <Column width="full-width">
              <Typography variant="h2" fontWeight={500}>
                {t('conversationsHeading')}
              </Typography>
              <Carousel
                theme="primary"
                numberMobileSlides={1}
                numberDesktopSlides={3}
                items={conversations.map((conversation) => {
                  return (
                    <RelatedContentCard
                      title={conversation.name}
                      href={conversation.full_slug}
                      category={RESOURCE_CATEGORIES.CONVERSATION}
                    />
                  );
                })}
              />
            </Column>
          </Row>
        </PageSection>
      )}
      {shorts.length > 0 && (
        <PageSection color={STORYBLOK_COLORS.SECONDARY_LIGHT} alignment="left">
          <Row numberOfColumns={1} horizontalAlignment="left" verticalAlignment="center">
            <Column width="full-width">
              <Typography variant="h2" fontWeight={500}>
                {t('shortsHeading')}
              </Typography>
              <Carousel
                theme="primary"
                numberMobileSlides={1}
                numberDesktopSlides={3}
                items={shorts.map((short) => {
                  return <Box> {short.name} </Box>;
                })}
              />
            </Column>
          </Row>
        </PageSection>
      )}

      {!userId && <SignUpBanner />}
      {!!userId && !!showEmailRemindersBanner && <EmailRemindersSettingsBanner />}
    </Box>
  );
};

export async function getStaticProps({ locale, preview = false }: GetStaticPropsContext) {
  const baseProps: Partial<ISbStoriesParams> = {
    language: locale || 'en',
    version: preview ? 'draft' : 'published',
    sort_by: 'position:description',
  };
  let sbParams: ISbStoriesParams = {
    ...baseProps,
    starts_with: 'courses/',
    filter_query: {
      component: {
        in: 'Course',
      },
    },
  };

  const storyblokApi = getStoryblokApi();

  let { data } = await storyblokApi.get('cdn/stories/', sbParams);

  let sbConversationsParams: ISbStoriesParams = {
    ...baseProps,
    starts_with: 'conversations/',
  };

  let { data: conversationsData } = await storyblokApi.get('cdn/stories/', sbConversationsParams);

  let sbShortsParams: ISbStoriesParams = {
    ...baseProps,
    starts_with: 'shorts/',
  };

  let { data: shortsData } = await storyblokApi.get('cdn/stories/', sbShortsParams);

  return {
    props: {
      stories: data ? getEnabledCourses(data.stories) : null,
      conversations: conversationsData ? getEnabledConversations(conversationsData.stories) : null,
      shorts: shortsData ? getEnabledShorts(shortsData.stories) : null,
      messages: {
        ...require(`../../messages/shared/${locale}.json`),
        ...require(`../../messages/navigation/${locale}.json`),
        ...require(`../../messages/courses/${locale}.json`),
        ...require(`../../messages/account/${locale}.json`),
      },
    },
    revalidate: 3600, // revalidate every hour
  };
}

// TODO remove this when hindi and french courses are fixed
const getEnabledCourses = (courseStories: ISbStoryData[]): ISbStoryData[] => {
  // Note that this filter only removes the course from the courses page for the user.
  // If the user navigates to the URL, they may still be able to access the course.
  return courseStories.filter((course) => !FeatureFlag.getDisabledCourses().has(course.full_slug));
};

const getEnabledConversations = (conversationStories: ISbStoryData[]): ISbStoryData[] => {
  const enabledConversations = [
    'conversations/stories-around-tech-abuse-with-francesca-and-carolina',
  ];

  return conversationStories.filter(
    (conversation) => enabledConversations.indexOf(conversation.full_slug) > -1,
  );
};

const getEnabledShorts = (shortsStories: ISbStoryData[]): ISbStoryData[] => {
  const enabledShorts = ['conversations/stories-around-tech-abuse-with-francesca-and-carolina'];

  return shortsStories.filter((short) => enabledShorts.indexOf(short.full_slug) > -1);
};

export default CourseList;
