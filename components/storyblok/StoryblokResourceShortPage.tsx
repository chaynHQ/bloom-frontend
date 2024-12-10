import { Box, Container, Typography } from '@mui/material';
import { ISbRichtext, storyblokEditable } from '@storyblok/react';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { PROGRESS_STATUS } from '../../constants/enums';
import { RESOURCE_SHORT_VIEWED } from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import { Resource } from '../../store/resourcesSlice';
import { getEventUserData, logEvent } from '../../utils/logEvent';
import { SignUpBanner } from '../banner/SignUpBanner';
import { StoryblokCoursePageProps } from './StoryblokCoursePage';
import { StoryblokPageSectionProps } from './StoryblokPageSection';
import { StoryblokSessionPageProps } from './StoryblokSessionPage';

export interface StoryblokResourceShortPageProps {
  storyId: number;
  _uid: string;
  _editable: string;
  title: string;
  seo_description: string;
  description: ISbRichtext;
  video: { url: string };
  video_transcript: ISbRichtext;
  page_sections: StoryblokPageSectionProps[];
  related_session: StoryblokSessionPageProps;
  related_content: (
    | StoryblokCoursePageProps
    | StoryblokSessionPageProps
    | StoryblokResourceShortPageProps
  )[];
  related_exercises: { name: string; value: string }[];
}

const StoryblokResourceShortPage = (props: StoryblokResourceShortPageProps) => {
  const {
    storyId,
    _uid,
    _editable,
    title,
    seo_description,
    description,
    video,
    video_transcript,
    page_sections,
    related_session,
    related_content,
    related_exercises,
  } = props;

  console.log(props);

  const t = useTranslations('Resources');
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const resources = useTypedSelector((state) => state.resources);
  const isLoggedIn = useTypedSelector((state) => Boolean(state.user.id));
  const [resourceProgress, setResourceProgress] = useState<PROGRESS_STATUS>(
    PROGRESS_STATUS.NOT_STARTED,
  );

  useEffect(() => {
    const userResource = resources.find((resource: Resource) => resource.storyblokId === storyId);

    if (userResource) {
      !!userResource.completedAt
        ? setResourceProgress(PROGRESS_STATUS.COMPLETED)
        : setResourceProgress(PROGRESS_STATUS.STARTED);
    } else {
      setResourceProgress(PROGRESS_STATUS.NOT_STARTED);
    }
  }, [resources, storyId]);

  useEffect(() => {
    logEvent(RESOURCE_SHORT_VIEWED, eventData);
  }, []);

  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);

  const eventData = {
    ...eventUserData,
    resource_name: title,
    resource_storyblok_id: storyId,
    resource_progress: resourceProgress,
  };

  return (
    <Box
      {...storyblokEditable({
        _uid,
        _editable,
        title,
        seo_description,
        description,
        video,
        video_transcript,
        page_sections,
        related_content,
        related_exercises,
      })}
    >
      <Head>
        <title>{`${t('course')} • ${title} • Bloom`}</title>
        <meta property="og:title" content={title} key="og-title" />
        {seo_description && (
          <>
            <meta name="description" content={seo_description} key="description" />
            <meta property="og:description" content={seo_description} key="og-description" />
          </>
        )}
      </Head>
      <Container>
        <Typography variant="h1">{title}</Typography>
      </Container>
      {!isLoggedIn && <SignUpBanner />}
    </Box>
  );
};

export default StoryblokResourceShortPage;
