import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { Box, Button, Container, IconButton, Typography } from '@mui/material';
import { ISbRichtext, ISbStoryData, storyblokEditable } from '@storyblok/react';
import Cookies from 'js-cookie';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import {
  PROGRESS_STATUS,
  RESOURCE_CATEGORIES,
  STORYBLOK_COLORS,
  STORYBLOK_COMPONENTS,
} from '../../constants/enums';
import {
  RESOURCE_SHORT_VIDEO_VIEWED,
  RESOURCE_SHORT_VIDEO_VISIT_SESSION,
} from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import { Resource } from '../../store/resourcesSlice';
import { columnStyle, rowStyle } from '../../styles/common';
import theme from '../../styles/theme';
import { getStoryblokPagesByUuids } from '../../utils/getStoryblokPageProps';
import { userHasAccessToPartnerContent } from '../../utils/hasAccessToPartnerContent';
import { getEventUserData, logEvent } from '../../utils/logEvent';
import { SignUpBanner } from '../banner/SignUpBanner';
import Link from '../common/Link';
import PageSection from '../common/PageSection';
import ProgressStatus from '../common/ProgressStatus';
import ResourceFeedbackForm from '../forms/ResourceFeedbackForm';
import { ResourceCompleteButton } from '../resources/ResourceCompleteButton';
import { ResourceShortVideo } from '../resources/ResourceShortVideo';
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
  // related_course?: ISbStoryData | null;
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
    // related_course,
    related_content,
    related_exercises,
  } = props;
  const router = useRouter();
  const t = useTranslations('Resources');
  const tS = useTranslations('Shared');
  const entryPartnerReferral = useTypedSelector((state) => state.user.entryPartnerReferral);
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const resources = useTypedSelector((state) => state.resources);
  const userId = useTypedSelector((state) => state.user.id);
  const isLoggedIn = useTypedSelector((state) => Boolean(state.user.id));
  const [linkedCourse, setLinkedCourse] = useState<ISbStoryData>();

  const [resourceProgress, setResourceProgress] = useState<PROGRESS_STATUS>(
    PROGRESS_STATUS.NOT_STARTED,
  );
  const [resourceId, setResourceId] = useState<string>();
  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);

  const eventData = useMemo(() => {
    return {
      ...eventUserData,
      resource_category: RESOURCE_CATEGORIES.SHORT_VIDEO,
      resource_name: name,
      resource_storyblok_id: storyId,
      resource_progress: resourceProgress,
    };
  }, [eventUserData, name, storyId, resourceProgress]);

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
  useEffect(() => {
    async function fetchCourse() {
      let linkedStoryData: ISbStoryData[] | null = null;

      // ensure we have the correct story data for the linked story rather than a uuid
      if (typeof related_session === 'string') {
        try {
          const storyblokStory = await getStoryblokPagesByUuids(
            related_session, // get course by course uuid
            router.locale,
            false,
            {},
          );
          if (storyblokStory?.stories.length && !!storyblokStory.stories[0]) {
            linkedStoryData = storyblokStory.stories || null;
          }
        } catch (error) {
          console.error('Error fetching related course:', error);
        }
      } else {
        linkedStoryData = related_session[0]?.content.related_session;
      }
      // depending on the type of linked story, we need to fetch the course
      if (linkedStoryData?.length) {
        // if we already have the course data, use it
        if (linkedStoryData[0]?.content.component === STORYBLOK_COMPONENTS.COURSE) {
          setLinkedCourse(linkedStoryData[0]);
        } else {
          // if we don't have the course data, we need to get it from the linked story
          try {
            const storyblokCourseProps = await getStoryblokPagesByUuids(
              linkedStoryData[0].content.related_session[0].content.course, // get course by course uuid
              router.locale,
              false,
              {},
            );

            if (storyblokCourseProps?.stories.length && !!storyblokCourseProps.stories[0]) {
              setLinkedCourse(storyblokCourseProps.stories[0]);
            }
            // Your data fetching logic here
          } catch (error) {
            console.error('Error fetching related courses:', error);
          }
        }
      }
    }

    fetchCourse();
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
                    resourceName={name}
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
                  related_session[0]?.content.component === STORYBLOK_COMPONENTS.COURSE
                    ? 0
                    : related_session[0]?.position / 10 - 1,
                sessionName: related_session[0]?.name,
                courseName: linkedCourse?.content.name,
              })}
            </Typography>
            <Button
              component={Link}
              href={related_session[0] && `/${related_session[0]?.full_slug}`}
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
        <Typography variant="h2" fontWeight={600}>
          Related content
        </Typography>
        <StoryblokRelatedContent
          relatedContent={related_content}
          relatedExercises={related_exercises}
          userContentPartners={userHasAccessToPartnerContent(
            partnerAdmin?.partner,
            partnerAccesses,
            Cookies.get('referralPartner') || entryPartnerReferral,
            userId,
          )}
        />
      </PageSection>

      {!isLoggedIn && <SignUpBanner />}
    </Box>
  );
};

export default StoryblokResourceShortPage;
