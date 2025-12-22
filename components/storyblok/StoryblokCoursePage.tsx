'use client';

import { SignUpBanner } from '@/components/banner/SignUpBanner';
import SessionCard from '@/components/cards/SessionCard';
import { ContentUnavailable } from '@/components/common/ContentUnavailable';
import CourseHeader from '@/components/course/CourseHeader';
import CourseIntroduction from '@/components/course/CourseIntroduction';
import { useGetUserCoursesQuery } from '@/lib/api';
import { COURSE_OVERVIEW_VIEWED } from '@/lib/constants/events';
import { useCookieReferralPartner } from '@/lib/hooks/useCookieReferralPartner';
import { useTypedSelector } from '@/lib/hooks/store';
import { determineCourseProgress } from '@/lib/utils/courseProgress';
import hasAccessToPage from '@/lib/utils/hasAccessToPage';
import logEvent from '@/lib/utils/logEvent';
import { rowStyle } from '@/styles/common';
import { Box, Container, Typography } from '@mui/material';
import { storyblokEditable } from '@storyblok/react/rsc';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo } from 'react';
import { StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

const containerStyle = {
  backgroundColor: 'secondary.light',
} as const;

const sessionsContainerStyle = {
  marginTop: 6,
} as const;

const cardsContainerStyle = {
  ...rowStyle,
  flexDirection: { xs: 'column', md: 'row' },
  gap: { xs: 0, md: 4 },
} as const;

export interface StoryblokCoursePageProps {
  storyUuid: string;
  _uid: string;
  _editable: string;
  name: string;
  description: StoryblokRichtext;
  image: { filename: string; alt: string };
  image_with_background: { filename: string; alt: string };
  video: { url: string };
  video_transcript: StoryblokRichtext;
  weeks: { name: string; sessions: any }[]; // TODO: replace type with StoryblokSessionPageProps
  included_for_partners: string[];
  languages: string[]; // TODO: implement this field - currently uses FF_DISABLED_COURSES env var
  component: 'Course';
}

const StoryblokCoursePage = (props: StoryblokCoursePageProps) => {
  const {
    storyUuid,
    _uid,
    _editable,
    name,
    description,
    image,
    image_with_background,
    video,
    video_transcript,
    weeks,
    included_for_partners,
  } = props;

  const t = useTranslations('Courses');
  const referralPartner = useCookieReferralPartner();
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const userId = useTypedSelector((state) => state.user.id);
  const authStateLoading = useTypedSelector((state) => state.user.authStateLoading);
  const isLoggedIn = !authStateLoading && Boolean(userId);
  const courses = useTypedSelector((state) => state.courses);

  useGetUserCoursesQuery(undefined, {
    skip: !isLoggedIn,
  });

  // Derive user access from partner settings
  const userAccess = useMemo(() => {
    const storyPartners = included_for_partners;
    return hasAccessToPage(
      isLoggedIn,
      true,
      storyPartners,
      partnerAccesses,
      partnerAdmin,
      referralPartner,
    );
  }, [partnerAccesses, partnerAdmin, included_for_partners, referralPartner, isLoggedIn]);

  // Derive course progress from courses state
  const courseProgress = useMemo(
    () => determineCourseProgress(courses || [], storyUuid),
    [courses, storyUuid],
  );

  const eventData = {
    course_name: name,
    course_storyblok_uuid: storyUuid,
    course_progress: courseProgress,
  };

  useEffect(() => {
    logEvent(COURSE_OVERVIEW_VIEWED, eventData);
  });

  if (!userAccess) {
    return <ContentUnavailable />;
  }

  return (
    <Box
      {...storyblokEditable({
        _uid,
        _editable,
        name,
        description,
        image,
        image_with_background,
        video,
        video_transcript,
        weeks,
        included_for_partners,
      })}
    >
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
                          storyblokCourseUuid={storyUuid}
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
