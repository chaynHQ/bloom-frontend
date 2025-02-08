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
import { ShortsCard } from '../../components/cards/ShortsCard';
import Carousel, { getSlideWidth } from '../../components/common/Carousel';
import Column from '../../components/common/Column';
import LoadingContainer from '../../components/common/LoadingContainer';
import PageSection from '../../components/common/PageSection';
import Row from '../../components/common/Row';
import Header from '../../components/layout/Header';
import { FeatureFlag } from '../../config/featureFlag';
import {
  EMAIL_REMINDERS_FREQUENCY,
  LANGUAGES,
  PROGRESS_STATUS,
  RESOURCE_CATEGORIES,
  STORYBLOK_COLORS,
} from '../../constants/enums';
import { COURSE_LIST_VIEWED } from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import illustrationCourses from '../../public/illustration_courses.svg';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import userHasAccessToPartnerContent from '../../utils/userHasAccessToPartnerContent';
import { useWidth } from '../../utils/useWidth';

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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadedCourses, setLoadedCourses] = useState<ISbStoryData[] | null>(null);
  const [loadedShorts, setLoadedShorts] = useState<ISbStoryData[] | null>(null);

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
  const width = useWidth();
  const numberTheCardToShow = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 3,
    xl: 3,
  };
  const cardsPerPage = numberTheCardToShow[width];

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
    const userPartners = userHasAccessToPartnerContent(
      partnerAdmin?.partner,
      partnerAccesses,
      referralPartner,
      userId,
    );

    const coursesWithAccess = stories.filter((story) =>
      userPartners.some((partner) => {
        return story.content.included_for_partners
          .map((p: string) => p.toLowerCase())
          .includes(partner);
      }),
    );
    const shortsWithAccess = shorts.filter((short) =>
      userPartners.some((partner) => {
        return short.content.included_for_partners
          .map((p: string) => p.toLowerCase())
          .includes(partner);
      }),
    );

    setLoadedCourses(coursesWithAccess);
    setLoadedShorts(shortsWithAccess);

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
  }, [partnerAccesses, partnerAdmin, stories, courses, shorts]);

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
                  lg={6}
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
                title="conversations"
                theme="primary"
                showArrows={true}
                slidesPerView={numberTheCardToShow}
                items={conversations.map((conversation) => {
                  return (
                    <Box
                      sx={{
                        ...getSlideWidth(1, 2, 3),
                      }}
                      padding={1}
                      key={conversation.name}
                    >
                      <RelatedContentCard
                        title={conversation.name}
                        href={conversation.full_slug}
                        category={RESOURCE_CATEGORIES.CONVERSATION}
                        duration={conversation.content.duration}
                      />
                    </Box>
                  );
                })}
              />
            </Column>
          </Row>
        </PageSection>
      )}
      {loadedShorts && loadedShorts?.length > 0 && (
        <PageSection color={STORYBLOK_COLORS.SECONDARY_LIGHT} alignment="left">
          <Row numberOfColumns={1} horizontalAlignment="left" verticalAlignment="center">
            <Column width="full-width">
              <Typography variant="h2" fontWeight={500}>
                {t('shortsHeading')}
              </Typography>
              <Carousel
                title="shorts"
                theme="primary"
                showArrows={true}
                afterSlideHandle={(newSlideIndex) => {
                  console.log(newSlideIndex);
                  setCurrentSlide(newSlideIndex);
                }}
                slidesPerView={numberTheCardToShow}
                items={loadedShorts.map((short, index) => {
                  let opacity: number = 0.5;
                  if (
                    index >= currentSlide * cardsPerPage &&
                    index < (currentSlide + 0.7) * cardsPerPage
                  ) {
                    opacity = 1;
                  }

                  return (
                    <Box
                      p={0.65}
                      minWidth="260px"
                      width="260px"
                      key={short.name}
                      style={{ opacity: currentSlide % 2 === 0 ? opacity : 1 }}
                    >
                      <ShortsCard
                        title={short.content.name}
                        category={RESOURCE_CATEGORIES.SHORT_VIDEO}
                        href={short.full_slug}
                        duration={short.content.duration}
                        image={short.content.preview_image}
                      />
                    </Box>
                  );
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
  const language = (locale || 'en') as LANGUAGES;
  const baseProps: Partial<ISbStoriesParams> = {
    language: language,
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
      conversations: conversationsData
        ? getEnabledConversations(conversationsData.stories, language)
        : null,
      shorts: shortsData ? getEnabledShorts(shortsData.stories, language) : null,
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

const getEnabledConversations = (
  conversationStories: ISbStoryData[],
  locale: LANGUAGES,
): ISbStoryData[] => {
  return conversationStories.filter((conversation) => {
    return conversation.content.languages.indexOf(locale === 'en' ? 'default' : locale) > -1;
  });
};

const getEnabledShorts = (shortsStories: ISbStoryData[], locale: LANGUAGES): ISbStoryData[] => {
  return shortsStories.filter((short) => {
    return short.content.languages.indexOf(locale === 'en' ? 'default' : locale) > -1;
  });
};

export default CourseList;
