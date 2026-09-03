'use client';

import { type Avatar } from '@/components/common/AvatarGroup';
import { BackLink } from '@/components/common/BackLink';
import { AccessFullCourseCard } from '@/components/course/AccessFullCourseCard';
import { ResourceActions } from '@/components/resources/ResourceActions';
import { ResourceCompleteCard } from '@/components/resources/ResourceCompleteCard';
import { ResourceGroundingSection } from '@/components/resources/ResourceGroundingSection';
import { ResourceHero } from '@/components/resources/ResourceHero';
import { ResourceMediaCard } from '@/components/resources/ResourceMediaCard';
import {
  resourceCardColumnStyle,
  resourceContainerStyle,
} from '@/components/resources/resourcePageStyles';
import DynamicComponent from '@/components/storyblok/DynamicComponent';
import {
  StoryblokRelatedContent,
  StoryblokRelatedContentStory,
} from '@/components/storyblok/StoryblokRelatedContent';
import StoryblokTeamMembersSection, {
  StoryblokTeamMembersSectionProps,
} from '@/components/storyblok/StoryblokTeamMembersSection';
import { PROGRESS_STATUS, RESOURCE_CATEGORIES } from '@/lib/constants/enums';
import { useResourceProgress, type ResourceEventPrefix } from '@/lib/hooks/useResourceProgress';
import { type ContentType } from '@/lib/utils/libraryData';
import logEvent from '@/lib/utils/logEvent';
import { Box, Container, Divider } from '@mui/material';
import { type SbBlokData } from '@storyblok/react/rsc';
import { useTranslations } from 'next-intl';
import { type ReactNode } from 'react';
import { type StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

export interface ResourcePageLayoutProps {
  format: ContentType;
  name: string;
  storyUuid: string;
  category: RESOURCE_CATEGORIES;
  eventPrefix: ResourceEventPrefix;
  resourceProgress: PROGRESS_STATUS;
  resourceId?: string;
  isLoggedIn: boolean;
  eventData: Record<string, unknown>;
  description: string | StoryblokRichtext;
  transcript?: StoryblokRichtext;
  transcriptEvents: { opened: string; closed: string };
  // The audio player or video embed, already wired to the progress helpers.
  media: ReactNode;
  // Per-type hero overrides; anything unset falls back to the shared defaults.
  hero?: { imageSrc?: string; imageAlt?: string; eyebrow?: string; subtitle?: string };
  contributors?: { avatars: Avatar[]; caption: string };
  teamMembersSection?: StoryblokTeamMembersSectionProps;
  // Type-specific blocks that sit between the media card and the page sections (references on a
  // video, the "watch full session" link on a short).
  beforeSections?: ReactNode;
  pageSections?: SbBlokData[];
  relatedExercises: string[];
  relatedContent: StoryblokRelatedContentStory[];
  userContentPartners: string[];
}

export const ResourcePageLayout = ({
  format,
  name,
  storyUuid,
  category,
  eventPrefix,
  resourceProgress,
  resourceId,
  isLoggedIn,
  eventData,
  description,
  transcript,
  transcriptEvents,
  media,
  hero,
  contributors,
  teamMembersSection,
  beforeSections,
  pageSections,
  relatedExercises,
  relatedContent,
  userContentPartners,
}: ResourcePageLayoutProps) => {
  const t = useTranslations('Resources');
  const { start } = useResourceProgress({ storyUuid, eventPrefix, resourceProgress, eventData });
  const isCompleted = resourceProgress === PROGRESS_STATUS.COMPLETED;

  return (
    <>
      <Container sx={resourceContainerStyle}>
        <Box>
          <BackLink qaId="resource-back-link" href="/library" label={t('backToSessions')} />
          <Divider sx={{ borderColor: 'sectionBorder', mt: 2 }} />
        </Box>

        <ResourceHero
          title={name}
          progress={resourceProgress}
          eyebrow={hero?.eyebrow ?? t('hero.eyebrow')}
          subtitle={hero?.subtitle}
          imageSrc={hero?.imageSrc}
          imageAlt={hero?.imageAlt}
        />

        <Box sx={resourceCardColumnStyle}>
          <ResourceMediaCard
            format={format}
            title={t('mediaCard.title', { name })}
            name={name}
            description={description}
            contributors={contributors}
            transcript={transcript}
            onTranscriptToggle={(open) => {
              logEvent(open ? transcriptEvents.opened : transcriptEvents.closed, eventData);
              if (open) start();
            }}
            media={media}
          />
          {beforeSections}
        </Box>

        <ResourceGroundingSection exerciseIds={relatedExercises} />

        <Divider sx={{ borderColor: 'sectionBorder' }} />

        <Box sx={resourceCardColumnStyle}>
          {isCompleted ? (
            <ResourceCompleteCard />
          ) : isLoggedIn ? (
            <ResourceActions
              storyUuid={storyUuid}
              resourceId={resourceId}
              category={category}
              eventPrefix={eventPrefix}
              resourceProgress={resourceProgress}
              eventData={eventData}
            />
          ) : (
            <AccessFullCourseCard source="resource" />
          )}
        </Box>
      </Container>

      {/* Full-bleed CMS sections keep their own layout, so they sit outside the page container. */}
      {teamMembersSection && <StoryblokTeamMembersSection {...teamMembersSection} />}

      {pageSections?.map((section, index) => (
        <DynamicComponent key={`page_section_${index}`} blok={section} />
      ))}

      <StoryblokRelatedContent
        relatedContent={relatedContent}
        userContentPartners={userContentPartners}
      />
    </>
  );
};
