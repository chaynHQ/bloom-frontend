import StarBorderIcon from '@mui/icons-material/StarBorder';
import { Box, Container } from '@mui/material';
import { ISbRichtext, ISbStoryData, storyblokEditable } from '@storyblok/react';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { render } from 'storyblok-rich-text-react-renderer';
import { PROGRESS_STATUS } from '../../constants/enums';
import { useTypedSelector } from '../../hooks/store';
import { columnStyle } from '../../styles/common';
import { getEventUserData } from '../../utils/logEvent';
import { RichTextOptions } from '../../utils/richText';
import SessionContentCard from '../cards/SessionContentCard';
import { Dots } from '../common/Dots';
import MultipleBonusContent, { BonusContent } from '../session/MultipleBonusContent';
import { SessionCompleteButton } from '../session/SessionCompleteButton';
import { getSessionCompletion } from '../../utils/getSessionCompletion';
import { SessionHeader } from '../session/SessionHeader';
import { SessionVideo } from '../session/SessionVideo';
import { SessionChat } from '../session/SessionChat';
import hasAccessToPage from '../../utils/hasAccessToPage';

const containerStyle = {
  backgroundColor: 'secondary.light',
} as const;

const cardColumnStyle = {
  ...columnStyle,
  alignItems: 'center',
  gap: { xs: 2, md: 3 },
} as const;

export interface StoryblokSessionIbaPageProps {
  storyId: number;
  storyUuid: string;
  storyPosition: number;
  _uid: string;
  _editable: string;
  course: ISbStoryData;
  name: string;
  subtitle: string;
  seo_description: string;
  description: string;
  video: { url: string };
  video_transcript: ISbRichtext;
  video_outro: ISbRichtext;
  activity: ISbRichtext;
  bonus: BonusContent[];
}

const StoryblokSessionIbaPage = (props: StoryblokSessionIbaPageProps) => {
  const {
    storyId,
    storyUuid,
    storyPosition,
    _uid,
    _editable,
    course,
    name,
    subtitle,
    seo_description,
    description,
    video,
    video_transcript,
    video_outro,
    activity,
    bonus,
  } = props;

  const t = useTranslations('Courses');

  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const isLoggedIn = useTypedSelector((state) => Boolean(state.user.id));
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const courses = useTypedSelector((state) => state.courses);

  const [incorrectAccess, setIncorrectAccess] = useState<boolean>(true);
  const [sessionProgress, setSessionProgress] = useState<PROGRESS_STATUS>(
    PROGRESS_STATUS.NOT_STARTED,
  );
  const [weekString, setWeekString] = useState<string>('');

  useEffect(() => {
    const coursePartners = course.content.included_for_partners;
    setIncorrectAccess(
      !hasAccessToPage(isLoggedIn, false, coursePartners, partnerAccesses, partnerAdmin),
    );
  }, [partnerAccesses, course.content.included_for_partners, partnerAdmin]);

  useEffect(() => {
    getSessionCompletion(course, courses, storyUuid, storyId, setWeekString, setSessionProgress);
  }, [courses, course.content.weeks, storyId, course.id, storyUuid]);

  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);
  const eventData = {
    ...eventUserData,
    session_name: name,
    session_storyblok_id: storyId,
    session_progress: sessionProgress,
    course_name: course.content.name,
    course_storyblok_id: course.id,
  };

  return (
    <Box
      {...storyblokEditable({
        _uid,
        _editable,
        course,
        name,
        subtitle,
        description,
        video,
        video_transcript,
        video_outro,
        activity,
        bonus,
      })}
    >
      <Head>
        <title>{`${t('session')} • ${name} • Bloom`}</title>
        <meta property="og:title" content={name} key="og-title" />
        {seo_description && (
          <meta property="og:description" content={seo_description} key="og-description" />
        )}
      </Head>

      {incorrectAccess ? (
        <Container sx={containerStyle}></Container>
      ) : (
        <Box>
          <SessionHeader
            description={description}
            name={name}
            sessionProgress={sessionProgress}
            course={course}
            weekString={weekString}
            subtitle={subtitle}
          />
          <Container sx={containerStyle}>
            <Box sx={cardColumnStyle}>
              <SessionVideo
                eventData={eventData}
                name={name}
                video={video}
                storyId={storyId}
                sessionProgress={sessionProgress}
                video_transcript={video_transcript}
              />
              {activity.content &&
                (activity.content?.length > 1 || activity.content[0].content) && (
                  <>
                    <Dots />
                    <SessionContentCard
                      title={t('sessionDetail.activityTitle')}
                      titleIcon={StarBorderIcon}
                      richtextContent
                      eventPrefix="SESSION_ACTIVITY"
                      eventData={eventData}
                    >
                      <>{render(activity, RichTextOptions)}</>
                    </SessionContentCard>
                  </>
                )}
              {bonus && <MultipleBonusContent bonus={bonus} eventData={eventData} />}
              <SessionChat
                eventData={eventData}
                partnerAccesses={partnerAccesses}
                partnerAdmin={partnerAdmin}
              />
              {sessionProgress !== PROGRESS_STATUS.COMPLETED && (
                <SessionCompleteButton storyId={storyId} eventData={eventData} />
              )}
            </Box>
          </Container>
        </Box>
      )}
    </Box>
  );
};

export default StoryblokSessionIbaPage;
