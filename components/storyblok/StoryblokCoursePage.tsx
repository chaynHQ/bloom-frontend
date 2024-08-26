import { Box, Container, Typography } from '@mui/material';
import { ISbRichtext, storyblokEditable } from '@storyblok/react';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { render } from 'storyblok-rich-text-react-renderer';
import SessionCard from '../../components/cards/SessionCard';
import { ContentUnavailable } from '../../components/common/ContentUnavailable';
import Link from '../../components/common/Link';
import CourseHeader from '../../components/course/CourseHeader';
import CourseIntroduction from '../../components/course/CourseIntroduction';
import CourseStatusHeader from '../../components/course/CourseStatusHeader';
import { PROGRESS_STATUS } from '../../constants/enums';
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

export interface StoryblokCoursePageProps {
  storyId: number;
  _uid: string;
  _editable: string;
  name: string;
  description: ISbRichtext;
  image: { filename: string; alt: string };
  image_with_background: { filename: string; alt: string };
  video: { url: string };
  video_transcript: ISbRichtext;
  weeks: { name: string; sessions: any }[]; // TODO: replace type with StoryblokSessionPageProps
  included_for_partners: string[];
  coming_soon: boolean;
  coming_soon_content: ISbRichtext;
  live_start_date: string;
  live_end_date: string;
  live_soon_content: ISbRichtext;
  live_now_content: ISbRichtext;
}

const StoryblokCoursePage = (props: StoryblokCoursePageProps) => {
  const {
    storyId,
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
    coming_soon,
    coming_soon_content,
    live_start_date,
    live_end_date,
    live_soon_content,
    live_now_content,
  } = props;

  const t = useTranslations('Courses');
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
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

    setIncorrectAccess(!hasAccessToPage(storyPartners, partnerAccesses, partnerAdmin));
  }, [partnerAccesses, partnerAdmin, included_for_partners]);

  useEffect(() => {
    setCourseProgress(determineCourseProgress(courses, storyId));
  }, [courses, storyId]);

  useEffect(() => {
    logEvent(COURSE_OVERVIEW_VIEWED, eventData);
  }, []);

  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);

  const courseComingSoon: boolean = coming_soon;
  const courseLiveSoon: boolean = courseIsLiveSoon({
    live_start_date,
    live_end_date,
    coming_soon,
    live_soon_content,
  });
  const courseLiveNow: boolean = courseIsLiveNow({
    live_start_date,
    live_end_date,
    coming_soon,
    live_now_content,
  });
  // only show live content to public users
  const liveCourseAccess = partnerAccesses.length === 0 && !partnerAdmin.id;

  const eventData = {
    ...eventUserData,
    course_name: name,
    course_storyblok_id: storyId,
    course_coming_soon: courseComingSoon,
    course_live_soon: courseLiveSoon,
    course_live_now: courseLiveNow,
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
        description,
        image,
        image_with_background,
        video,
        video_transcript,
        weeks,
        included_for_partners,
        coming_soon,
        coming_soon_content,
        live_start_date,
        live_end_date,
        live_soon_content,
        live_now_content,
      })}
    >
      <Head>
        <title>{name}</title>
      </Head>
      <CourseHeader
        name={name}
        description={description}
        image_with_background={image_with_background}
        eventData={eventData}
        courseProgress={courseProgress}
      />
      <Container sx={containerStyle}>
        {courseComingSoon ? (
          <>
            {liveCourseAccess && courseLiveSoon ? (
              <Box maxWidth={700}>
                <CourseStatusHeader status="liveSoon" />
                {render(live_soon_content, RichTextOptions)}
              </Box>
            ) : (
              <Box maxWidth={700}>
                <CourseStatusHeader status="comingSoon" />
                {render(coming_soon_content, RichTextOptions)}
              </Box>
            )}
          </>
        ) : (
          <>
            {video && (
              <CourseIntroduction
                video={video}
                name={name}
                video_transcript={video_transcript}
                live_soon_content={live_soon_content}
                live_now_content={live_now_content}
                eventData={eventData}
                courseLiveSoon={courseLiveSoon}
                courseLiveNow={courseLiveNow}
                liveCourseAccess={liveCourseAccess}
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
                            clickable={isLoggedIn}
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

export default StoryblokCoursePage;
