'use client';

import ResourceFeedbackForm from '@/components/forms/ResourceFeedbackForm';
import { LANGUAGES, PROGRESS_STATUS, RESOURCE_CATEGORIES } from '@/lib/constants/enums';
import { RESOURCE_CONVERSATION_VIEWED } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { Resource } from '@/lib/store/resourcesSlice';
import hasAccessToPage from '@/lib/utils/hasAccessToPage';
import logEvent from '@/lib/utils/logEvent';
import userHasAccessToPartnerContent from '@/lib/utils/userHasAccessToPartnerContent';
import { Box, Container } from '@mui/material';
import { storyblokEditable } from '@storyblok/react/rsc';
import { useLocale } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { StoryblokRichtext } from 'storyblok-rich-text-react-renderer';
import { ContentUnavailable } from '../common/ContentUnavailable';
import LoadingContainer from '../common/LoadingContainer';
import { ResourceConversationHeader } from '../resources/ResourceConversationHeader';
import DynamicComponent from './DynamicComponent';
import { StoryblokPageSectionProps } from './StoryblokPageSection';
import { StoryblokRelatedContent, StoryblokRelatedContentStory } from './StoryblokRelatedContent';

export interface StoryblokResourceConversationPageProps {
  storyUuid: string;
  _uid: string;
  _editable: string;
  name: string;
  description: StoryblokRichtext;
  header_image: { filename: string; alt: string };
  duration: string;
  audio: { filename: string };
  audio_transcript: StoryblokRichtext;
  page_sections: StoryblokPageSectionProps[];
  related_content: StoryblokRelatedContentStory[];
  related_exercises: string[];
  languages: string[];
  component: 'resource_conversation';
  included_for_partners: string[];
}

const StoryblokResourceConversationPage = (props: StoryblokResourceConversationPageProps) => {
  const {
    storyUuid,
    _uid,
    _editable,
    name,
    description,
    header_image,
    audio,
    audio_transcript,
    page_sections,
    related_content,
    related_exercises,
    languages,
    included_for_partners,
  } = props;

  const locale = useLocale();
  const userId = useTypedSelector((state) => state.user.id);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const resources = useTypedSelector((state) => state.resources);
  const isLoggedIn = useTypedSelector((state) => Boolean(state.user.id));
  const [userAccess, setUserAccess] = useState<boolean>();

  const [resourceProgress, setResourceProgress] = useState<PROGRESS_STATUS>(
    PROGRESS_STATUS.NOT_STARTED,
  );
  const [resourceId, setResourceId] = useState<string>();

  const eventData = useMemo(() => {
    return {
      resource_category: RESOURCE_CATEGORIES.CONVERSATION,
      resource_name: name,
      resource_storyblok_uuid: storyUuid,
      resource_progress: resourceProgress,
    };
  }, [name, storyUuid, resourceProgress]);

  useEffect(() => {
    const userHasAccess =
      hasAccessToPage(
        isLoggedIn,
        true, // setting true here to allow preview. The login overlay will block interaction
        included_for_partners,
        partnerAccesses,
        partnerAdmin,
      ) &&
      (locale === LANGUAGES.en || languages.includes(locale));
    setUserAccess(userHasAccess);
  }, [partnerAccesses, included_for_partners, isLoggedIn, partnerAdmin, locale, languages]);

  useEffect(() => {
    const userResource = resources.find(
      (resource: Resource) => resource.storyblokUuid === storyUuid,
    );

    if (userResource) {
      userResource.completed
        ? setResourceProgress(PROGRESS_STATUS.COMPLETED)
        : setResourceProgress(PROGRESS_STATUS.STARTED);
      setResourceId(userResource.id);
    } else {
      setResourceProgress(PROGRESS_STATUS.NOT_STARTED);
    }
  }, [resources, storyUuid]);

  useEffect(() => {
    logEvent(RESOURCE_CONVERSATION_VIEWED, eventData);
  }, []);

  if (userAccess === undefined) return <LoadingContainer />;
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
        page_sections,
        related_content,
        related_exercises,
      })}
    >
      <ResourceConversationHeader
        {...{
          storyUuid,
          name,
          description,
          header_image,
          resourceProgress,
          audio,
          audio_transcript,
          eventData,
        }}
      />
      {page_sections?.length > 0 &&
        page_sections.map((section: any, index: number) => (
          <DynamicComponent key={`page_section_${index}`} blok={section} />
        ))}
      {resourceId && (
        <Container sx={{ bgcolor: 'background.paper' }}>
          <ResourceFeedbackForm
            resourceId={resourceId}
            category={RESOURCE_CATEGORIES.CONVERSATION}
          />
        </Container>
      )}
      <StoryblokRelatedContent
        relatedContent={related_content}
        relatedExercises={related_exercises}
        userContentPartners={userHasAccessToPartnerContent(
          partnerAdmin?.partner,
          partnerAccesses,
          null,
          userId,
        )}
      />
    </Box>
  );
};

export default StoryblokResourceConversationPage;
