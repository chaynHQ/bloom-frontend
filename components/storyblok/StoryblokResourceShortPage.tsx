'use client';

import { ContentUnavailable } from '@/components/common/ContentUnavailable';
import DirectionalIcon from '@/components/common/DirectionalIcon';
import LoadingContainer from '@/components/common/LoadingContainer';
import { ResourcePageLayout } from '@/components/resources/ResourcePageLayout';
import Video from '@/components/video/Video';
import { Link as i18nLink } from '@/i18n/routing';
import { LANGUAGES, PROGRESS_STATUS, RESOURCE_CATEGORIES } from '@/lib/constants/enums';
import {
  RESOURCE_SHORT_VIDEO_TRANSCRIPT_CLOSED,
  RESOURCE_SHORT_VIDEO_TRANSCRIPT_OPENED,
  RESOURCE_SHORT_VIDEO_VIEWED,
  RESOURCE_SHORT_VIDEO_VISIT_SESSION,
} from '@/lib/constants/events';
import { useCookieReferralPartner } from '@/lib/hooks/useCookieReferralPartner';
import { useIsUserLoading } from '@/lib/hooks/useIsUserLoading';
import { useResourceProgress } from '@/lib/hooks/useResourceProgress';
import { useTypedSelector } from '@/lib/hooks/store';
import { Resource } from '@/lib/store/resourcesSlice';
import { getDefaultFullSlug } from '@/lib/utils/getDefaultFullSlug';
import hasAccessToPage from '@/lib/utils/hasAccessToPage';
import logEvent from '@/lib/utils/logEvent';
import { toResourceContributors } from '@/lib/utils/resourceContributors';
import userHasAccessToPartnerContent from '@/lib/utils/userHasAccessToPartnerContent';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import { Box, Button } from '@mui/material';
import { useStoryblokState } from '@storyblok/react';
import { ISbStoryData, SbBlokData, storyblokEditable } from '@storyblok/react/rsc';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo } from 'react';
import { StoryblokRichtext } from 'storyblok-rich-text-react-renderer';
import { StoryblokRelatedContentStory } from './StoryblokRelatedContent';
import { StoryblokTeamMembersSectionProps } from './StoryblokTeamMembersSection';

export interface StoryblokResourceShortPageProps {
  _uid: string;
  _editable: string;
  name: string;
  description: StoryblokRichtext;
  duration: string;
  video: { url: string };
  video_transcript: StoryblokRichtext;
  contributor_images?: { filename: string; alt: string }[];
  contributors_description?: string;
  team_members_section?: StoryblokTeamMembersSectionProps[];
  page_sections: SbBlokData[];
  related_content: StoryblokRelatedContentStory[];
  related_exercises: string[];
  languages: string[];
  component: 'resource_short_video';
  included_for_partners: string[];
}

interface Props {
  story: ISbStoryData;
  related_course?: ISbStoryData;
  related_session?: ISbStoryData;
}

const EVENT_PREFIX = 'RESOURCE_SHORT_VIDEO' as const;

const StoryblokResourceShortPage = ({
  story: initialStory,
  related_course,
  related_session,
}: Props) => {
  const story = useStoryblokState(initialStory) ?? initialStory;
  const {
    _uid,
    _editable,
    name,
    description,
    video,
    video_transcript,
    contributor_images,
    contributors_description,
    team_members_section,
    page_sections,
    related_content,
    related_exercises,
    languages,
    included_for_partners,
  } = story.content as StoryblokResourceShortPageProps;
  const storyUuid = story.uuid;

  const t = useTranslations('Resources');
  const locale = useLocale();
  const referralPartner = useCookieReferralPartner();
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const resources = useTypedSelector((state) => state.resources);
  const userId = useTypedSelector((state) => state.user.id);
  const authStateLoading = useTypedSelector((state) => state.user.authStateLoading);
  const isLoggedIn = !authStateLoading && Boolean(userId);
  const isUserLoading = useIsUserLoading();

  const contentPartners = useMemo(
    () =>
      userHasAccessToPartnerContent(
        partnerAdmin?.partner,
        partnerAccesses,
        referralPartner,
        userId,
      ),
    [referralPartner, partnerAccesses, partnerAdmin, userId],
  );

  const userAccess = useMemo(() => {
    return (
      hasAccessToPage(isLoggedIn, true, included_for_partners, partnerAccesses, partnerAdmin) &&
      (locale === LANGUAGES.en || languages.includes(locale))
    );
  }, [partnerAccesses, included_for_partners, isLoggedIn, partnerAdmin, locale, languages]);

  const { resourceProgress, resourceId } = useMemo(() => {
    const userResource = resources.find((r: Resource) => r.storyblokUuid === storyUuid);
    if (userResource) {
      return {
        resourceProgress: userResource.completed
          ? PROGRESS_STATUS.COMPLETED
          : PROGRESS_STATUS.STARTED,
        resourceId: userResource.id,
      };
    }
    return { resourceProgress: PROGRESS_STATUS.NOT_STARTED, resourceId: undefined };
  }, [resources, storyUuid]);

  const eventData = useMemo(
    () => ({
      resource_category: RESOURCE_CATEGORIES.SHORT_VIDEO,
      resource_name: name,
      resource_storyblok_uuid: storyUuid,
      resource_progress: resourceProgress,
    }),
    [name, storyUuid, resourceProgress],
  );

  useEffect(() => {
    logEvent(RESOURCE_SHORT_VIDEO_VIEWED, eventData);
  });

  const { start, complete } = useResourceProgress({
    storyUuid,
    eventPrefix: EVENT_PREFIX,
    resourceProgress,
    eventData,
  });

  const contributors = useMemo(
    () => toResourceContributors(contributor_images, contributors_description),
    [contributor_images, contributors_description],
  );

  const parentStory = related_session ?? related_course;
  const parentHref = parentStory ? getDefaultFullSlug(parentStory.full_slug, locale) : undefined;

  if (!userAccess) {
    if (isUserLoading) return <LoadingContainer />;
    return <ContentUnavailable />;
  }

  return (
    <Box
      {...storyblokEditable({
        _uid,
        _editable,
        name,
        description,
        video,
        video_transcript,
        team_members_section,
        page_sections,
        related_session,
        related_content,
        related_exercises,
      })}
    >
      <ResourcePageLayout
        format="video"
        name={name}
        storyUuid={storyUuid}
        category={RESOURCE_CATEGORIES.SHORT_VIDEO}
        eventPrefix={EVENT_PREFIX}
        resourceProgress={resourceProgress}
        resourceId={resourceId}
        isLoggedIn={isLoggedIn}
        eventData={eventData}
        description={description}
        transcript={video_transcript}
        transcriptEvents={{
          opened: RESOURCE_SHORT_VIDEO_TRANSCRIPT_OPENED,
          closed: RESOURCE_SHORT_VIDEO_TRANSCRIPT_CLOSED,
        }}
        hero={{
          eyebrow: parentStory ? t('partOf', { name: parentStory.content.name }) : undefined,
        }}
        contributors={contributors}
        teamMembersSection={team_members_section?.[0]}
        pageSections={page_sections}
        relatedExercises={related_exercises}
        relatedContent={related_content}
        userContentPartners={contentPartners}
        beforeSections={
          parentHref && (
            <Button
              qa-id="resource-short-related-session-button"
              variant="contained"
              color="secondary"
              component={i18nLink}
              href={parentHref}
              onClick={() =>
                logEvent(RESOURCE_SHORT_VIDEO_VISIT_SESSION, {
                  ...eventData,
                  session_name: parentStory?.content.name,
                })
              }
              endIcon={
                <DirectionalIcon>
                  <ArrowForwardRounded />
                </DirectionalIcon>
              }
              sx={{ alignSelf: 'flex-start' }}
            >
              {t('sessionButtonLabel')}
            </Button>
          )
        }
        media={
          <Video
            url={video.url}
            eventPrefix="RESOURCE_SHORT"
            eventData={eventData}
            setVideoStarted={() => start()}
            setVideoFinished={() => complete()}
            containerStyles={{ maxWidth: '100%', mt: 0 }}
          />
        }
      />
    </Box>
  );
};

export default StoryblokResourceShortPage;
