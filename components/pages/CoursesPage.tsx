'use client';

import { EmailRemindersSettingsBanner } from '@/components/banner/EmailRemindersSettingsBanner';
import { SignUpBanner } from '@/components/banner/SignUpBanner';
import CourseCard from '@/components/cards/CourseCard';
import { RelatedContentCard } from '@/components/cards/RelatedContentCard';
import { ShortsCard } from '@/components/cards/ShortsCard';
import Carousel, { getSlideWidth } from '@/components/common/Carousel';
import Column from '@/components/common/Column';
import LoadingContainer from '@/components/common/LoadingContainer';
import Row from '@/components/common/Row';
import Header from '@/components/layout/Header';
import {
  EMAIL_REMINDERS_FREQUENCY,
  PROGRESS_STATUS,
  RESOURCE_CATEGORIES,
} from '@/lib/constants/enums';
import { COURSE_LIST_VIEWED } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { getDefaultFullSlug } from '@/lib/utils/getDefaultFullSlug';
import logEvent from '@/lib/utils/logEvent';
import userHasAccessToPartnerContent from '@/lib/utils/userHasAccessToPartnerContent';
import illustrationCourses from '@/public/illustration_courses.svg';
import theme from '@/styles/theme';
import { Box, Container, Grid, Typography, useMediaQuery } from '@mui/material';
import { ISbStoryData } from '@storyblok/react/rsc';
import Cookies from 'js-cookie';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

const containerStyle = {
  backgroundColor: 'secondary.light',
  paddingTop: { xs: 2, sm: 2, md: 2 },
  paddingBottom: { xs: 6, sm: 6, md: 8 },
} as const;

interface Props {
  courseStories: ISbStoryData[];
  conversations: ISbStoryData[];
  shorts: ISbStoryData[];
}
export default function CoursesPage({ courseStories, conversations, shorts }: Props) {
  const locale = useLocale();

  const [loadedCourses, setLoadedCourses] = useState<ISbStoryData[] | null>(null);
  const [loadedShorts, setLoadedShorts] = useState<ISbStoryData[] | null>(null);
  const [coursesStarted, setCoursesStarted] = useState<Array<number>>([]);
  const [coursesCompleted, setCoursesCompleted] = useState<Array<number>>([]);
  const [showEmailRemindersBanner, setShowEmailRemindersBanner] = useState<boolean>(false);

  const userId = useTypedSelector((state) => state.user.id);
  const userEmailRemindersFrequency = useTypedSelector(
    (state) => state.user.emailRemindersFrequency,
  );
  const entryPartnerReferral = useTypedSelector((state) => state.user.entryPartnerReferral);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const courses = useTypedSelector((state) => state.courses);
  const searchParams = useSearchParams();
  const sectionQueryParam = searchParams.get('section');
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const headerOffset = isSmallScreen ? 48 : 136;

  const t = useTranslations('Courses');

  const headerProps = {
    title: t('title'),
    introduction: t('introduction'),
    imageSrc: illustrationCourses,
    imageAlt: 'alt.personSitting',
  };

  useEffect(() => {
    logEvent(COURSE_LIST_VIEWED);
  }, []);

  const setShortsSectionRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;
      if (sectionQueryParam === 'shorts' && node && loadedCourses) {
        const scrollToY = node.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top: scrollToY, behavior: 'smooth' });
      }
    },
    [sectionQueryParam, headerOffset, loadedCourses],
  );

  const setConversationsSectionRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (sectionQueryParam === 'conversations' && node && loadedCourses) {
        const scrollToY = node.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top: scrollToY, behavior: 'smooth' });
      }
    },
    [sectionQueryParam, headerOffset, loadedCourses],
  );

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

    const coursesWithAccess = courseStories.filter((story) =>
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
  }, [partnerAccesses, partnerAdmin, courseStories, courses, shorts, entryPartnerReferral, userId]);

  const getCourseProgress = (courseId: number) => {
    return coursesStarted.includes(courseId)
      ? PROGRESS_STATUS.STARTED
      : coursesCompleted.includes(courseId)
        ? PROGRESS_STATUS.COMPLETED
        : null;
  };

  return (
    <Box>
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
        <Container sx={{ backgroundColor: 'secondary.main' }} ref={setConversationsSectionRef}>
          <Row numberOfColumns={1} horizontalAlignment="left" verticalAlignment="center">
            <Column width="full-width">
              <Typography variant="h2" fontWeight={500}>
                {t('conversationsHeading')}
              </Typography>
              <Carousel
                title="conversations"
                theme="primary"
                showArrows={true}
                slidesPerView={{
                  xs: 1,
                  sm: 2,
                  md: 3,
                  lg: 3,
                  xl: 3,
                }}
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
                        href={getDefaultFullSlug(conversation.full_slug, locale)}
                        category={RESOURCE_CATEGORIES.CONVERSATION}
                        duration={conversation.content.duration}
                      />
                    </Box>
                  );
                })}
              />
            </Column>
          </Row>
        </Container>
      )}
      {loadedShorts && loadedShorts?.length > 0 && (
        <Container sx={{ backgroundColor: 'secondary.light' }} ref={setShortsSectionRef}>
          <Row numberOfColumns={1} horizontalAlignment="left" verticalAlignment="center">
            <Column width="full-width">
              <Typography variant="h2" fontWeight={500}>
                {t('shortsHeading')}
              </Typography>
              <Carousel
                title="shorts"
                theme="primary"
                showArrows={true}
                slidesPerView={{
                  xs: 1,
                  sm: 2,
                  md: 3,
                  lg: 3,
                  xl: 3,
                }}
                items={loadedShorts.map((short) => {
                  return (
                    <Box p={0.25} minWidth="260px" width="260px" key={short.name}>
                      <ShortsCard
                        title={short.content.name}
                        category={RESOURCE_CATEGORIES.SHORT_VIDEO}
                        href={getDefaultFullSlug(short.full_slug, locale)}
                        duration={short.content.duration}
                        image={short.content.preview_image}
                      />
                    </Box>
                  );
                })}
              />
            </Column>
          </Row>
        </Container>
      )}

      {!userId && <SignUpBanner />}
      {!!userId && !!showEmailRemindersBanner && <EmailRemindersSettingsBanner />}
    </Box>
  );
}
