'use client';

import { type Avatar } from '@/components/common/AvatarGroup';
import { BackLink } from '@/components/common/BackLink';
import { SignUpCard } from '@/components/course/SignUpCard';
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
import { Link as i18nLink } from '@/i18n/routing';
import { PROGRESS_STATUS, RESOURCE_CATEGORIES } from '@/lib/constants/enums';
import { GROUNDING_EXERCISE_CLICKED } from '@/lib/constants/events';
import { useLibraryReturnHref } from '@/lib/hooks/useLibraryReturnHref';
import { type CompleteResource, type ResourceEventPrefix } from '@/lib/hooks/useResourceProgress';
import { type ContentType } from '@/lib/utils/libraryData';
import logEvent from '@/lib/utils/logEvent';
import { Box, Button, CircularProgress, Container, Divider } from '@mui/material';
import { type ISbStoryData, type SbBlokData } from '@storyblok/react/rsc';
import { useTranslations } from 'next-intl';
import { type ReactNode } from 'react';
import { type StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

const mediaSlotLoadingStyle = { display: 'flex', justifyContent: 'center', py: 6 } as const;

export interface ResourcePageLayoutProps {
  format: ContentType;
  name: string;
  storyUuid: string;
  category: RESOURCE_CATEGORIES;
  eventPrefix: ResourceEventPrefix;
  resourceProgress: PROGRESS_STATUS;
  resourceId?: string;
  // Marks the resource finished from the bottom action panel. Shares the hook instance the page
  // already wired to the media player, so there's one `useResourceProgress` per resource.
  onComplete: CompleteResource;
  isSignedIn: boolean;
  // The page handles `'accessDenied'` before rendering. `'resolving'` and `'signInRequired'` share
  // one shell (header + content card) so it never reflows — a spinner where the media goes, then
  // the real media or the sign-up card in its place.
  contentAccessStatus: 'resolving' | 'signInRequired' | 'accessGranted';
  eventData: Record<string, unknown>;
  // Shown in the content card, below the badges.
  description: string | StoryblokRichtext;
  transcript?: StoryblokRichtext;
  // Omitted for types with no transcript (written, activity).
  transcriptEvents?: { opened: string; closed: string };
  // Called the first time the transcript is opened, to mark the resource "started" for types
  // whose media has no play event of its own to hook that to.
  onTranscriptStart?: () => void;
  // The audio player or video embed, already wired to the progress helpers.
  media: ReactNode;
  // Per-type hero overrides; anything unset falls back to the shared defaults.
  hero?: { imageSrc?: string; imageAlt?: string; subtitle?: string };
  contributors?: { avatars: Avatar[]; caption: string };
  teamMembersSection?: StoryblokTeamMembersSectionProps;
  // Type-specific blocks between the content card and the page sections (e.g. references on a video).
  beforeSections?: ReactNode;
  // Link to the full session this resource excerpts, if any.
  relatedSessionHref?: string;
  relatedSessionName?: string;
  pageSections?: SbBlokData[];
  relatedGrounding: ISbStoryData[];
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
  onComplete,
  isSignedIn,
  contentAccessStatus,
  eventData,
  description,
  transcript,
  transcriptEvents,
  onTranscriptStart,
  media,
  hero,
  contributors,
  teamMembersSection,
  beforeSections,
  relatedSessionHref,
  relatedSessionName,
  pageSections,
  relatedGrounding,
  relatedContent,
  userContentPartners,
}: ResourcePageLayoutProps) => {
  const t = useTranslations('Resources');
  const libraryHref = useLibraryReturnHref();
  const isCompleted = resourceProgress === PROGRESS_STATUS.COMPLETED;
  const signInRequired = contentAccessStatus === 'signInRequired';

  // Signed-out sign-up prompt: keyed to the full session when the resource excerpts one. `embedded`
  // when it stands in for the media inside the content card.
  const signUpCard = (embedded?: boolean) =>
    relatedSessionHref ? (
      <SignUpCard
        source="relatedSession"
        returnPath={relatedSessionHref}
        embedded={embedded}
        contentName={name}
        contentUuid={storyUuid}
      />
    ) : (
      <SignUpCard
        source="resource"
        format={format}
        embedded={embedded}
        contentName={name}
        contentUuid={storyUuid}
      />
    );

  // Sits under the content card: the "watch full session" link for signed-in visitors, the sign-up
  // card in its place for signed-out ones.
  const relatedSessionSlot = !relatedSessionHref ? null : isSignedIn ? (
    <Button
      qa-id="resource-related-session-button"
      component={i18nLink}
      href={relatedSessionHref}
      variant="contained"
      color="secondary"
      onClick={() =>
        logEvent(`${eventPrefix}_VISIT_SESSION`, {
          ...eventData,
          related_session_name: relatedSessionName ?? null,
          related_session_href: relatedSessionHref,
        })
      }
      sx={{ alignSelf: 'flex-start' }}
    >
      {t('sessionButtonLabel')}
    </Button>
  ) : (
    signUpCard()
  );

  // The action panel below the grounding section — omitted for a signed-out visitor whose
  // related-session card above has already made the sign-up case.
  const bottomAction = isCompleted ? (
    <ResourceCompleteCard />
  ) : isSignedIn ? (
    <ResourceActions
      resourceId={resourceId}
      category={category}
      eventData={eventData}
      onComplete={onComplete}
    />
  ) : relatedSessionHref ? null : (
    signUpCard()
  );

  const header = (
    <>
      <Box>
        <BackLink qaId="resource-back-link" href={libraryHref} label={t('backToLibrary')} />
        <Divider sx={{ borderColor: 'sectionBorder', mt: 2 }} />
      </Box>

      <ResourceHero
        title={name}
        progress={resourceProgress}
        subtitle={hero?.subtitle}
        imageSrc={hero?.imageSrc}
        imageAlt={hero?.imageAlt}
      />
    </>
  );

  if (contentAccessStatus !== 'accessGranted') {
    return (
      <>
        <Container sx={resourceContainerStyle}>
          {header}
          <Box sx={resourceCardColumnStyle}>
            <ResourceMediaCard
              format={format}
              name={name}
              description={description}
              contributors={contributors}
              accountNeeded={signInRequired}
              media={
                signInRequired ? (
                  signUpCard(true)
                ) : (
                  <Box sx={mediaSlotLoadingStyle}>
                    <CircularProgress color="error" />
                  </Box>
                )
              }
            />
          </Box>
        </Container>

        {signInRequired && (
          <StoryblokRelatedContent
            relatedContent={relatedContent}
            userContentPartners={userContentPartners}
          />
        )}
      </>
    );
  }

  return (
    <>
      <Container sx={resourceContainerStyle}>
        {header}

        <Box sx={resourceCardColumnStyle}>
          <ResourceMediaCard
            format={format}
            name={name}
            description={description}
            contributors={contributors}
            transcript={transcript}
            onTranscriptToggle={(open) => {
              if (transcriptEvents) {
                logEvent(open ? transcriptEvents.opened : transcriptEvents.closed, eventData);
              }
              if (open) onTranscriptStart?.();
            }}
            media={media}
          />
          {relatedSessionSlot}
          {beforeSections}
        </Box>

        <ResourceGroundingSection
          groundingStories={relatedGrounding}
          onExerciseSelect={(story, index) =>
            logEvent(GROUNDING_EXERCISE_CLICKED, {
              ...eventData,
              grounding_context: 'resource_moment',
              grounding_exercise_name: story.content.name,
              grounding_exercise_storyblok_uuid: story.uuid,
              grounding_exercise_position: index + 1,
            })
          }
        />

        {bottomAction && (
          <>
            <Divider sx={{ borderColor: 'sectionBorder' }} />
            <Box sx={resourceCardColumnStyle}>{bottomAction}</Box>
          </>
        )}
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
