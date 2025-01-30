'use client';

import { SignUpBanner } from '@/components/banner/SignUpBanner';
import SessionCard from '@/components/cards/SessionCard';
import { ContentUnavailable } from '@/components/common/ContentUnavailable';
import CourseHeader from '@/components/course/CourseHeader';
import CourseIntroduction from '@/components/course/CourseIntroduction';
import { Link as i18nLink } from '@/i18n/routing';
import { PROGRESS_STATUS } from '@/lib/constants/enums';
import { COURSE_OVERVIEW_VIEWED } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { determineCourseProgress } from '@/lib/utils/courseProgress';
import hasAccessToPage from '@/lib/utils/hasAccessToPage';
import logEvent from '@/lib/utils/logEvent';
import { rowStyle } from '@/styles/common';
import { Box, Container, Link, Typography } from '@mui/material';
import { ISbRichtext, storyblokEditable } from '@storyblok/react/rsc';
import Cookies from 'js-cookie';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

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
  }, [partnerAccesses, partnerAdmin, included_for_partners, entryPartnerReferral, isLoggedIn]);

  useEffect(() => {
    setCourseProgress(determineCourseProgress(courses, storyId));
  }, [courses, storyId]);

  useEffect(() => {
    logEvent(COURSE_OVERVIEW_VIEWED, eventData);
  }, []);

  const eventData = {
    course_name: name,
    course_storyblok_id: storyId,
    course_progress: courseProgress,
  };

  if (incorrectAccess) {
    return (
      <ContentUnavailable
        title={t('accessGuard.title')}
        message={t.rich('accessGuard.introduction', {
          contactLink: (children) => (
            <Link component={i18nLink} href="/courses">
              {children}
            </Link>
          ),
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
