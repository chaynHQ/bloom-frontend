'use client';

import { ContentUnavailable } from '@/components/common/ContentUnavailable';
import { ResourcePageLayout } from '@/components/resources/ResourcePageLayout';
import { RESOURCE_CATEGORIES } from '@/lib/constants/enums';
import { type ResourceEventPrefix } from '@/lib/hooks/useResourceProgress';
import {
  useStoryblokResourcePage,
  type ResourceStoryContent,
} from '@/lib/hooks/useStoryblokResourcePage';
import { type ContentType } from '@/lib/utils/libraryData';
import { RichTextOptions } from '@/lib/utils/richText';
import { Box } from '@mui/material';
import { ISbStoryData, SbBlokData, storyblokEditable } from '@storyblok/react/rsc';
import { useEffect } from 'react';
import { render, StoryblokRichtext } from 'storyblok-rich-text-react-renderer';
import { StoryblokRelatedContentStory } from './StoryblokRelatedContent';
import { StoryblokTeamMembersSectionProps } from './StoryblokTeamMembersSection';

// The `resource_written` and `resource_activity` blocks are identical in shape: a rich-text `body`
// rendered as the media, no transcript, and progress that starts on view (there's no play event
// to hook it to). They differ only in the category/events they report under.
export interface TextResourceContent extends ResourceStoryContent {
  _uid: string;
  _editable: string;
  description: StoryblokRichtext;
  header_image: { filename: string; alt: string };
  duration: string;
  body: StoryblokRichtext;
  login_required: boolean;
  team_members_section?: StoryblokTeamMembersSectionProps[];
  page_sections: SbBlokData[];
  related_content: StoryblokRelatedContentStory[];
  related_grounding: ISbStoryData[];
}

interface StoryblokTextResourcePageProps {
  initialStory: ISbStoryData;
  format: ContentType;
  category: RESOURCE_CATEGORIES;
  eventPrefix: ResourceEventPrefix;
  viewedEvent: string;
}

export const StoryblokTextResourcePage = ({
  initialStory,
  format,
  category,
  eventPrefix,
  viewedEvent,
}: StoryblokTextResourcePageProps) => {
  const {
    content,
    storyUuid,
    isSignedIn,
    contentAccessStatus,
    resourceProgress,
    resourceId,
    eventData,
    contributors,
    relatedGrounding,
    relatedSessionHref,
    relatedSessionName,
    userContentPartners,
    start,
    complete,
  } = useStoryblokResourcePage<TextResourceContent>({
    initialStory,
    category,
    eventPrefix,
    viewedEvent,
  });

  const {
    _uid,
    _editable,
    name,
    description,
    header_image,
    body,
    login_required,
    team_members_section,
    page_sections,
    related_content,
    related_grounding,
    related_session,
  } = content;

  // Reading the page is the only engagement signal, so progress starts as soon as it's viewed.
  useEffect(() => {
    start();
  }, [start]);

  if (contentAccessStatus === 'accessDenied') {
    return <ContentUnavailable />;
  }

  return (
    <Box
      {...storyblokEditable({
        _uid,
        _editable,
        name,
        description,
        body,
        login_required,
        team_members_section,
        page_sections,
        related_content,
        related_grounding,
        related_session,
      })}
    >
      <ResourcePageLayout
        format={format}
        name={name}
        storyUuid={storyUuid}
        category={category}
        eventPrefix={eventPrefix}
        resourceProgress={resourceProgress}
        resourceId={resourceId}
        onComplete={complete}
        isSignedIn={isSignedIn}
        contentAccessStatus={contentAccessStatus}
        eventData={eventData}
        description={description}
        hero={{ imageSrc: header_image?.filename || undefined, imageAlt: header_image?.alt }}
        contributors={contributors}
        teamMembersSection={team_members_section?.[0]}
        pageSections={page_sections}
        relatedGrounding={relatedGrounding}
        relatedContent={related_content}
        userContentPartners={userContentPartners}
        relatedSessionHref={relatedSessionHref}
        relatedSessionName={relatedSessionName}
        media={<Box>{render(body, RichTextOptions)}</Box>}
      />
    </Box>
  );
};
