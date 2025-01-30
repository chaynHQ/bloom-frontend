'use client';

import { SignUpBanner } from '@/components/banner/SignUpBanner';
import PageSection from '@/components/common/PageSection';
import ProgressStatus from '@/components/common/ProgressStatus';
import ResourceFeedbackForm from '@/components/forms/ResourceFeedbackForm';
import { ResourceCompleteButton } from '@/components/resources/ResourceCompleteButton';
import { ResourceShortVideo } from '@/components/resources/ResourceShortVideo';
import {
  COURSE_CATEGORIES,
  PROGRESS_STATUS,
  RESOURCE_CATEGORIES,
  STORYBLOK_COLORS,
} from '@/constants/enums';
import {
  RESOURCE_SHORT_VIDEO_VIEWED,
  RESOURCE_SHORT_VIDEO_VISIT_SESSION,
} from '@/constants/events';
import { useTypedSelector } from '@/hooks/store';
import { Link as i18nLink, useRouter } from '@/i18n/routing';
import { Resource } from '@/lib/store/resourcesSlice';
import { columnStyle, rowStyle } from '@/styles/common';
import theme from '@/styles/theme';
import logEvent from '@/utils/logEvent';
import userHasAccessToPartnerContent from '@/utils/userHasAccessToPartnerContent';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { Box, Button, Container, IconButton, Typography } from '@mui/material';
import { ISbRichtext, ISbStoryData, storyblokEditable } from '@storyblok/react/rsc';
import Cookies from 'js-cookie';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import { StoryblokPageSectionProps } from './StoryblokPageSection';
import { StoryblokRelatedContent, StoryblokRelatedContentStory } from './StoryblokRelatedContent';

const headerStyle = { ...rowStyle, flexWrap: { xs: 'wrap', md: 'no-wrap' }, gap: 5 } as const;
const headerRightStyle = {
  ...columnStyle,
  justifyContent: 'flex-end',
  flex: { md: 1 },
  width: { md: '100%' },
  height: { md: 290 },
} as const;

const headerLeftStyles = {
  width: 514, // >515px enables the "watch on youtube" button
  maxWidth: '100%',
} as const;

const progressStyle = {
  ...rowStyle,
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: 3,
  mt: 2,
  '.MuiBox-root': {
    mt: 0,
  },
} as const;

const backButtonStyle = {
  display: { md: 'none' },
  width: '2.5rem',
  marginLeft: '-0.675rem',
  mb: 2,
  mt: 0,
  padding: 0,
} as const;

const backIconStyle = {
  height: '1.75rem',
  width: '1.75rem',
  color: 'primary.dark',
} as const;

export interface StoryblokResourceShortPageProps {
  storyId: number;
  _uid: string;
  _editable: string;
  name: string;
  seo_description: string;
  description: ISbRichtext;
  duration: string;
  video: { url: string };
  video_transcript: ISbRichtext;
  page_sections: StoryblokPageSectionProps[];
  related_session: ISbStoryData[];
  related_course: ISbStoryData | undefined;
  related_content: StoryblokRelatedContentStory[];
  related_exercises: string[];
  languages: string[];
  component: 'resource_short_video';
  included_for_partners: string[];
}

const StoryblokResourceShortPage = (props: StoryblokResourceShortPageProps) => {
  const {
    storyId,
    _uid,
    _editable,
    name,
    seo_description,
    description,
    video,
    video_transcript,
    page_sections,
    related_session,
    related_course,
    related_content,
    related_exercises,
  } = props;

  const router = useRouter();
  const t = useTranslations('Resources');
  const tS = useTranslations('Shared');
  const entryPartnerReferral = useTypedSelector((state) => state.user.entryPartnerReferral);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const resources = useTypedSelector((state) => state.resources);
  const userId = useTypedSelector((state) => state.user.id);
  const isLoggedIn = useTypedSelector((state) => Boolean(state.user.id));

  const [resourceProgress, setResourceProgress] = useState<PROGRESS_STATUS>(
    PROGRESS_STATUS.NOT_STARTED,
  );
  const [resourceId, setResourceId] = useState<string>();

  const getContentPartners = useMemo(() => {
    const referralPartner = Cookies.get('referralPartner') || entryPartnerReferral;

    return userHasAccessToPartnerContent(
      partnerAdmin?.partner,
      partnerAccesses,
      referralPartner,
      userId,
    );
  }, [entryPartnerReferral, partnerAccesses, partnerAdmin, userId]);

  const eventData = useMemo(() => {
    return {
      resource_category: RESOURCE_CATEGORIES.SHORT_VIDEO,
      resource_name: name,
      resource_storyblok_id: storyId,
      resource_progress: resourceProgress,
    };
  }, [name, storyId, resourceProgress]);

  useEffect(() => {
    const userResource = resources.find((resource: Resource) => resource.storyblokId === storyId);

    if (userResource) {
      userResource.completed
        ? setResourceProgress(PROGRESS_STATUS.COMPLETED)
        : setResourceProgress(PROGRESS_STATUS.STARTED);
      setResourceId(userResource.id);
    } else {
      setResourceProgress(PROGRESS_STATUS.NOT_STARTED);
    }
  }, [resources, storyId]);

  useEffect(() => {
    logEvent(RESOURCE_SHORT_VIDEO_VIEWED, eventData);
  }, []);

  const redirectToSession = () => {
    logEvent(RESOURCE_SHORT_VIDEO_VISIT_SESSION, {
      ...eventData,
      shorts_name: name,
      session_name: related_session.length && related_session[0]?.name,
    });
  };

  return (
    <Box
      {...storyblokEditable({
        _uid,
        _editable,
        name,
        seo_description,
        description,
        video,
        video_transcript,
        page_sections,
        related_session,
        related_content,
        related_exercises,
      })}
    >
      <Head>
        <title>{`${t('shorts')} • ${name} • Bloom`}</title>
        <meta property="og:title" content={name} key="og-title" />
        {seo_description && (
          <>
            <meta name="description" content={seo_description} key="description" />
            <meta property="og:description" content={seo_description} key="og-description" />
          </>
        )}
      </Head>

      <Container sx={{ background: theme.palette.bloomGradient, paddingTop: ['20px', '60px'] }}>
        <IconButton
          sx={backButtonStyle}
          onClick={() => router.back()}
          aria-label={tS('navigateBack')}
        >
          <KeyboardArrowLeftIcon sx={backIconStyle} />
        </IconButton>
        <Typography variant="h1" maxWidth={600}>
          {name}
        </Typography>
        <Box sx={headerStyle}>
          <Box sx={headerLeftStyles}>
            <ResourceShortVideo
              eventData={eventData}
              resourceProgress={resourceProgress}
              name={name}
              storyId={storyId}
              video={video}
              video_transcript={video_transcript}
            />
            {resourceId && (
              <Box sx={progressStyle}>
                {resourceProgress && <ProgressStatus status={resourceProgress} />}

                {resourceProgress !== PROGRESS_STATUS.COMPLETED && (
                  <ResourceCompleteButton
                    category={RESOURCE_CATEGORIES.SHORT_VIDEO}
                    storyId={storyId}
                    eventData={eventData}
                  />
                )}
              </Box>
            )}
          </Box>
          <Box sx={headerRightStyle}>
            {/* Description field is not currently displayed */}
            {/* {render(description, RichTextOptions)} */}

            <Typography component="h2" mb={2}>
              {t('sessionDetail', {
                sessionNumber:
                  related_session[0]?.content.component === COURSE_CATEGORIES.COURSE
                    ? 0
                    : related_session[0]?.position / 10 - 1,
                sessionName: related_session[0]?.content.name,
                courseName: related_course?.content.name,
              })}
            </Typography>
            <Button
              href={related_session[0] && `/${related_session[0]?.full_slug}`}
              component={i18nLink}
              onClick={redirectToSession}
              variant="contained"
              color="secondary"
              sx={{ mr: 'auto' }}
            >
              {t('sessionButtonLabel')}
            </Button>
          </Box>
        </Box>
      </Container>

      {resourceId && (
        <Container sx={{ bgcolor: 'background.paper' }}>
          <ResourceFeedbackForm
            resourceId={resourceId}
            category={RESOURCE_CATEGORIES.SHORT_VIDEO}
          />
        </Container>
      )}

      <PageSection alignment="flex-start" color={STORYBLOK_COLORS.SECONDARY_MAIN}>
        <Typography variant="h2" fontWeight={500}>
          {tS('relatedContent.title')}
        </Typography>
        <StoryblokRelatedContent
          relatedContent={related_content}
          relatedExercises={related_exercises}
          userContentPartners={getContentPartners}
        />
      </PageSection>

      {!isLoggedIn && <SignUpBanner />}
    </Box>
  );
};

export default StoryblokResourceShortPage;
