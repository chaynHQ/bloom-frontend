'use client';

import ResourceFeedbackForm from '@/components/forms/ResourceFeedbackForm';
import {
  LANGUAGES,
  PROGRESS_STATUS,
  RESOURCE_CATEGORIES,
  STORYBLOK_TAGS,
} from '@/lib/constants/enums';
import { RESOURCE_SINGLE_VIDEO_VIEWED } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { Resource } from '@/lib/store/resourcesSlice';
import hasAccessToPage from '@/lib/utils/hasAccessToPage';
import logEvent from '@/lib/utils/logEvent';
import userHasAccessToPartnerContent from '@/lib/utils/userHasAccessToPartnerContent';
import { Box, Container } from '@mui/material';
import { storyblokEditable } from '@storyblok/react/rsc';
import Cookies from 'js-cookie';
import { useLocale } from 'next-intl';
import { useEffect, useMemo } from 'react';
import { StoryblokRichtext } from 'storyblok-rich-text-react-renderer';
import { ContentUnavailable } from '../common/ContentUnavailable';
import { ResourceSingleVideoHeader } from '../resources/ResourceSingleVideoHeader';
import DynamicComponent from './DynamicComponent';
import { StoryblokPageSectionProps } from './StoryblokPageSection';
import { StoryblokRelatedContent, StoryblokRelatedContentStory } from './StoryblokRelatedContent';
import StoryblokTeamMembersSection, {
  StoryblokTeamMembersSectionProps,
} from './StoryblokTeamMembersSection';
import { StoryblokReferenceProps } from './StoryblokTypes';

export interface StoryblokResourceSingleVideoPageProps {
  storyUuid: string;
  _uid: string;
  _editable: string;
  name: string;
  subtitle: string;
  description: StoryblokRichtext;
  duration: string;
  video: { url: string };
  video_transcript: StoryblokRichtext;
  page_sections: StoryblokPageSectionProps[];
  team_members_section: StoryblokTeamMembersSectionProps[];
  related_content: StoryblokRelatedContentStory[];
  related_exercises: string[];
  references: StoryblokReferenceProps[];
  languages: string[];
  included_for_partners: string[];
  component: 'resource_single_video';
  tags: STORYBLOK_TAGS[];
}

const StoryblokResourceSingleVideoPage = (props: StoryblokResourceSingleVideoPageProps) => {
  const {
    storyUuid,
    _uid,
    _editable,
    name,
    subtitle,
    description,
    video,
    video_transcript,
    page_sections,
    team_members_section,
    related_content,
    related_exercises,
    references,
    languages,
    included_for_partners,
    tags,
  } = props;

  const locale = useLocale();
  const entryPartnerReferral = useTypedSelector((state) => state.user.entryPartnerReferral);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const resources = useTypedSelector((state) => state.resources);
  const userId = useTypedSelector((state) => state.user.id);
  const isLoggedIn = useTypedSelector((state) => Boolean(state.user.id));

  const getContentPartners = useMemo(() => {
    const referralPartner = Cookies.get('referralPartner') || entryPartnerReferral;

    return userHasAccessToPartnerContent(
      partnerAdmin?.partner,
      partnerAccesses,
      referralPartner,
      userId,
    );
  }, [entryPartnerReferral, partnerAccesses, partnerAdmin, userId]);

  const userAccess = useMemo(() => {
    return (
      hasAccessToPage(
        isLoggedIn,
        true, // setting true here to allow preview. The login overlay will block interaction
        included_for_partners,
        partnerAccesses,
        partnerAdmin,
      ) &&
      (locale === LANGUAGES.en || languages.includes(locale))
    );
  }, [partnerAccesses, included_for_partners, isLoggedIn, partnerAdmin, locale, languages]);

  const { resourceProgress, resourceId } = useMemo(() => {
    const userResource = resources.find(
      (resource: Resource) => resource.storyblokUuid === storyUuid,
    );

    if (userResource) {
      return {
        resourceProgress: userResource.completed
          ? PROGRESS_STATUS.COMPLETED
          : PROGRESS_STATUS.STARTED,
        resourceId: userResource.id,
      };
    }
    return {
      resourceProgress: PROGRESS_STATUS.NOT_STARTED,
      resourceId: undefined,
    };
  }, [resources, storyUuid]);

  const nextResourceHref = useMemo(() => {
    const nextResourceSlug = related_content[0]?.full_slug;
    return nextResourceSlug ? `/${nextResourceSlug}` : undefined;
  }, [related_content]);

  const eventData = useMemo(() => {
    return {
      resource_category: RESOURCE_CATEGORIES.SINGLE_VIDEO,
      resource_name: name,
      resource_storyblok_uuid: storyUuid,
      resource_progress: resourceProgress,
    };
  }, [name, storyUuid, resourceProgress]);

  useEffect(() => {
    logEvent(RESOURCE_SINGLE_VIDEO_VIEWED, eventData);
  });

  if (!userAccess) return <ContentUnavailable />;

  return (
    <Box
      {...storyblokEditable({
        _uid,
        _editable,
        name,
        subtitle,
        description,
        video,
        video_transcript,
        page_sections,
        team_members_section,
        references,
        related_content,
        related_exercises,
      })}
    >
      <ResourceSingleVideoHeader
        {...{
          storyUuid,
          name,
          subtitle,
          description,
          resourceProgress,
          video,
          video_transcript,
          references,
          eventData,
          nextResourceHref,
          tags,
        }}
      />
      {team_members_section && <StoryblokTeamMembersSection {...team_members_section[0]} />}
      {page_sections?.length > 0 &&
        page_sections.map((section: any, index: number) => (
          <DynamicComponent key={`page_section_${index}`} blok={section} />
        ))}
      {resourceId && (
        <Container sx={{ bgcolor: 'background.paper' }}>
          <ResourceFeedbackForm
            resourceId={resourceId}
            category={RESOURCE_CATEGORIES.SINGLE_VIDEO}
          />
        </Container>
      )}

      <StoryblokRelatedContent
        relatedContent={related_content}
        relatedExercises={related_exercises}
        userContentPartners={getContentPartners}
      />
    </Box>
  );
};

export default StoryblokResourceSingleVideoPage;
