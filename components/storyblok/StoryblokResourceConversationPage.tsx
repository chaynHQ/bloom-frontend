'use client';

import { ContentUnavailable } from '@/components/common/ContentUnavailable';
import { ResourceAudioPlayer } from '@/components/resources/ResourceAudioPlayer';
import { ResourcePageLayout } from '@/components/resources/ResourcePageLayout';
import { LANGUAGES, PROGRESS_STATUS, RESOURCE_CATEGORIES } from '@/lib/constants/enums';
import {
  RESOURCE_CONVERSATION_TRANSCRIPT_CLOSED,
  RESOURCE_CONVERSATION_TRANSCRIPT_OPENED,
  RESOURCE_CONVERSATION_VIEWED,
} from '@/lib/constants/events';
import { useResourceProgress } from '@/lib/hooks/useResourceProgress';
import { useTypedSelector } from '@/lib/hooks/store';
import { Resource } from '@/lib/store/resourcesSlice';
import hasAccessToPage from '@/lib/utils/hasAccessToPage';
import logEvent from '@/lib/utils/logEvent';
import { toResourceContributors } from '@/lib/utils/resourceContributors';
import userHasAccessToPartnerContent from '@/lib/utils/userHasAccessToPartnerContent';
import { Box } from '@mui/material';
import { useStoryblokState } from '@storyblok/react';
import { ISbStoryData, SbBlokData, storyblokEditable } from '@storyblok/react/rsc';
import { useLocale } from 'next-intl';
import { useEffect, useMemo } from 'react';
import { StoryblokRichtext } from 'storyblok-rich-text-react-renderer';
import { StoryblokRelatedContentStory } from './StoryblokRelatedContent';
import { StoryblokTeamMembersSectionProps } from './StoryblokTeamMembersSection';

export interface StoryblokResourceConversationPageProps {
  _uid: string;
  _editable: string;
  name: string;
  description: StoryblokRichtext;
  header_image: { filename: string; alt: string };
  duration: string;
  audio: { filename: string };
  audio_transcript: StoryblokRichtext;
  contributor_images?: { filename: string; alt: string }[];
  contributors_description?: string;
  team_members_section?: StoryblokTeamMembersSectionProps[];
  page_sections: SbBlokData[];
  related_content: StoryblokRelatedContentStory[];
  related_exercises: string[];
  languages: string[];
  component: 'resource_conversation';
  included_for_partners: string[];
}

const EVENT_PREFIX = 'RESOURCE_CONVERSATION' as const;

const StoryblokResourceConversationPage = ({ story: initialStory }: { story: ISbStoryData }) => {
  const story = useStoryblokState(initialStory) ?? initialStory;
  const {
    _uid,
    _editable,
    name,
    description,
    header_image,
    audio,
    audio_transcript,
    contributor_images,
    contributors_description,
    team_members_section,
    page_sections,
    related_content,
    related_exercises,
    languages,
    included_for_partners,
  } = story.content as StoryblokResourceConversationPageProps;
  const storyUuid = story.uuid;

  const locale = useLocale();
  const userId = useTypedSelector((state) => state.user.id);
  const authStateLoading = useTypedSelector((state) => state.user.authStateLoading);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const resources = useTypedSelector((state) => state.resources);
  const isLoggedIn = !authStateLoading && Boolean(userId);

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
      resource_category: RESOURCE_CATEGORIES.CONVERSATION,
      resource_name: name,
      resource_storyblok_uuid: storyUuid,
      resource_progress: resourceProgress,
    }),
    [name, storyUuid, resourceProgress],
  );

  useEffect(() => {
    logEvent(RESOURCE_CONVERSATION_VIEWED, eventData);
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

  if (!userAccess) return <ContentUnavailable />;

  return (
    <Box
      {...storyblokEditable({
        _uid,
        _editable,
        name,
        description,
        audio,
        audio_transcript,
        team_members_section,
        page_sections,
        related_content,
        related_exercises,
      })}
    >
      <ResourcePageLayout
        format="audio"
        name={name}
        storyUuid={storyUuid}
        category={RESOURCE_CATEGORIES.CONVERSATION}
        eventPrefix={EVENT_PREFIX}
        resourceProgress={resourceProgress}
        resourceId={resourceId}
        isLoggedIn={isLoggedIn}
        eventData={eventData}
        description={description}
        transcript={audio_transcript}
        transcriptEvents={{
          opened: RESOURCE_CONVERSATION_TRANSCRIPT_OPENED,
          closed: RESOURCE_CONVERSATION_TRANSCRIPT_CLOSED,
        }}
        hero={{ imageSrc: header_image?.filename || undefined, imageAlt: header_image?.alt }}
        contributors={contributors}
        teamMembersSection={team_members_section?.[0]}
        pageSections={page_sections}
        relatedExercises={related_exercises}
        relatedContent={related_content}
        userContentPartners={userHasAccessToPartnerContent(
          partnerAdmin?.partner,
          partnerAccesses,
          null,
          userId,
        )}
        media={
          <ResourceAudioPlayer
            url={audio.filename}
            eventPrefix={EVENT_PREFIX}
            eventData={eventData}
            onStart={start}
            onFinish={complete}
          />
        }
      />
    </Box>
  );
};

export default StoryblokResourceConversationPage;
