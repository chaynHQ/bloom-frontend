import { Box, Container, Typography } from '@mui/material';
import { ISbRichtext, storyblokEditable } from '@storyblok/react';
import Cookies from 'js-cookie';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import SessionCard from '../../components/cards/SessionCard';
import { ContentUnavailable } from '../../components/common/ContentUnavailable';
import Link from '../../components/common/Link';
import CourseHeader from '../../components/course/CourseHeader';
import CourseIntroduction from '../../components/course/CourseIntroduction';
import { PROGRESS_STATUS } from '../../constants/enums';
import { COURSE_OVERVIEW_VIEWED } from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import { rowStyle } from '../../styles/common';
import { determineCourseProgress } from '../../utils/courseProgress';
import hasAccessToPage from '../../utils/hasAccessToPage';
import { getEventUserData, logEvent } from '../../utils/logEvent';
import { SignUpBanner } from '../banner/SignUpBanner';

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

export interface StoryblokCoursePageProps {
  storyId: number;
  _uid: string;
  _editable: string;
  name: string;
  seo_description: string;
  description: ISbRichtext;
  image: { filename: string; alt: string };
  image_with_background: { filename: string; alt: string };
  video: { url: string };
  video_transcript: ISbRichtext;
  weeks: { name: string; sessions: any }[]; // TODO: replace type with StoryblokSessionPageProps
  included_for_partners: string[];
  languages: string[]; // TODO: implement this field - currently uses FF_DISABLED_COURSES env var
  component: 'Course';
}

const StoryblokCoursePage = (props: StoryblokCoursePageProps) => {
  const {
    storyId,
    _uid,
    _editable,
    name,
    seo_description,
    description,
    image,
    image_with_background,
    video,
    video_transcript,
    weeks,
    included_for_partners,
  } = props;

  const t = useTranslations('Courses');
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const entryPartnerReferral = useTypedSelector((state) => state.user.entryPartnerReferral);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const courses = useTypedSelector((state) => state.courses);
  const isLoggedIn = useTypedSelector((state) => Boolean(state.user.id));
  const [incorrectAccess, setIncorrectAccess] = useState<boolean>(true);
  const [courseProgress, setCourseProgress] = useState<PROGRESS_STATUS>(
    PROGRESS_STATUS.NOT_STARTED,
  );

  useEffect(() => {
    const storyPartners = included_for_partners;
    const referralPartner = Cookies.get('referralPartner') || entryPartnerReferral;

    setIncorrectAccess(
      !hasAccessToPage(
        isLoggedIn,
        true,
        storyPartners,
        partnerAccesses,
        partnerAdmin,
        referralPartner,
      ),
    );
  }, [partnerAccesses, partnerAdmin, included_for_partners]);

  useEffect(() => {
    setCourseProgress(determineCourseProgress(courses, storyId));
  }, [courses, storyId]);

  useEffect(() => {
    logEvent(COURSE_OVERVIEW_VIEWED, eventData);
  }, []);

  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);

  const eventData = {
    ...eventUserData,
    course_name: name,
    course_storyblok_id: storyId,
    course_progress: courseProgress,
  };

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
    <Box
      {...storyblokEditable({
        _uid,
        _editable,
        name,
        seo_description,
        description,
        image,
        image_with_background,
        video,
        video_transcript,
        weeks,
        included_for_partners,
      })}
    >
      <Head>
        <title>{`${t('course')} • ${name} • Bloom`}</title>
        <meta property="og:title" content={name} key="og-title" />
        {seo_description && (
          <>
            <meta name="description" content={seo_description} key="description" />
            <meta property="og:description" content={seo_description} key="og-description" />
          </>
        )}
      </Head>
      <CourseHeader
        name={name}
        description={description}
        image_with_background={image_with_background}
        eventData={eventData}
        courseProgress={courseProgress}
      />
      <Container sx={containerStyle}>
        <>
          {video && (
            <CourseIntroduction
              video={video}
              name={name}
              video_transcript={video_transcript}
              eventData={eventData}
            />
          )}
          <Box sx={sessionsContainerStyle}>
            {weeks.map((week: any) => {
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
                          storyblokCourseId={storyId}
                          isLoggedIn={isLoggedIn}
                        />
                      );
                    })}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </>
      </Container>
      {!isLoggedIn && <SignUpBanner />}
    </Box>
  );
};

export default StoryblokCoursePage;
