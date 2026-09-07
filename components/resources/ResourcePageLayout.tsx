'use client';

import { AvatarGroup, type Avatar } from '@/components/common/AvatarGroup';
import { BackLink } from '@/components/common/BackLink';
import { FormatBadge } from '@/components/common/FormatBadge';
import { TranscriptAccordion } from '@/components/common/TranscriptAccordion';
import { SignUpCard } from '@/components/course/SignUpCard';
import { ResourceActions } from '@/components/resources/ResourceActions';
import { ResourceCompleteCard } from '@/components/resources/ResourceCompleteCard';
import { ResourceGroundingSection } from '@/components/resources/ResourceGroundingSection';
import { ResourceHero } from '@/components/resources/ResourceHero';
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
import { type ResourceEventPrefix } from '@/lib/hooks/useResourceProgress';
import { type ContentType } from '@/lib/utils/libraryData';
import logEvent from '@/lib/utils/logEvent';
import LockOutlined from '@mui/icons-material/LockOutlined';
import { Box, Button, CircularProgress, Container, Divider, Typography } from '@mui/material';
import { type ISbStoryData, type SbBlokData } from '@storyblok/react/rsc';
import { useTranslations } from 'next-intl';
import { type ReactNode } from 'react';
import { type StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

const mediaSlotLoadingStyle = { display: 'flex', justifyContent: 'center', py: 6 } as const;

// Wraps the media, transcript and contributors once access is granted. FormatBadge brings its own
// bottom spacing, so the body below it is a separate evenly-spaced stack.
const contentCardStyle = {
  display: 'flex',
  flexDirection: 'column',
  p: 2,
  borderRadius: '16px',
  border: '1px solid',
  borderColor: 'cardBorder',
  backgroundColor: 'cardSurface',
} as const;

const contentBodyStyle = { display: 'flex', flexDirection: 'column', gap: 2 } as const;

const contributorRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  py: 1,
  borderTop: '1px solid',
  borderBottom: '1px solid',
  borderColor: 'cardBorder',
} as const;

const captionStyle = { fontStyle: 'italic', color: 'grey.700' } as const;

// FormatBadge carries its own bottom spacing; the row only needs a gap between the two badges.
const badgeRowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  gap: 1,
} as const;

const accountNeededBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.5,
  height: 32,
  pl: 1,
  pr: 1.5,
  borderRadius: '8px',
  border: '1px solid',
  borderColor: 'cardBorder',
  backgroundColor: 'panelSurface',
} as const;

const accountNeededLabelStyle = {
  fontFamily: 'headingFontFamily',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: 'grey.700',
} as const;

export interface ResourcePageLayoutProps {
  format: ContentType;
  name: string;
  storyUuid: string;
  category: RESOURCE_CATEGORIES;
  eventPrefix: ResourceEventPrefix;
  resourceProgress: PROGRESS_STATUS;
  resourceId?: string;
  isSignedIn: boolean;
  // The page handles `'accessDenied'` before rendering. `'resolving'` and `'signInRequired'` share
  // the header so it never reflows — a spinner where the content goes, then the content or the
  // sign-up card in its place.
  contentAccessStatus: 'resolving' | 'signInRequired' | 'accessGranted';
  eventData: Record<string, unknown>;
  // Shown in the header, below the title.
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
  // Type-specific blocks between the media and the page sections (e.g. references on a video).
  beforeSections?: ReactNode;
  // Link to the full session this resource excerpts, if any.
  relatedSessionHref?: string;
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
  pageSections,
  relatedGrounding,
  relatedContent,
  userContentPartners,
}: ResourcePageLayoutProps) => {
  const t = useTranslations('Resources');
  const tLibrary = useTranslations('Library');
  const isCompleted = resourceProgress === PROGRESS_STATUS.COMPLETED;
  const signInRequired = contentAccessStatus === 'signInRequired';

  // Signed-out sign-up prompt: keyed to the full session when the resource excerpts one.
  const signUpCard = relatedSessionHref ? (
    <SignUpCard source="relatedSession" returnPath={relatedSessionHref} />
  ) : (
    <SignUpCard source="resource" format={format} />
  );

  // Sits under the media: the "watch full session" link for signed-in visitors, the sign-up card
  // in its place for signed-out ones.
  const relatedSessionSlot = !relatedSessionHref ? null : isSignedIn ? (
    <Button
      qa-id="resource-related-session-button"
      component={i18nLink}
      href={relatedSessionHref}
      variant="contained"
      color="secondary"
      onClick={() => logEvent(`${eventPrefix}_VISIT_SESSION`, eventData)}
      sx={{ alignSelf: 'flex-start' }}
    >
      {t('sessionButtonLabel')}
    </Button>
  ) : (
    <SignUpCard source="relatedSession" returnPath={relatedSessionHref} />
  );

  // The action panel below the grounding section — omitted for a signed-out visitor whose
  // related-session card above has already made the sign-up case.
  const bottomAction = isCompleted ? (
    <ResourceCompleteCard />
  ) : isSignedIn ? (
    <ResourceActions
      storyUuid={storyUuid}
      resourceId={resourceId}
      category={category}
      eventPrefix={eventPrefix}
      resourceProgress={resourceProgress}
      eventData={eventData}
    />
  ) : relatedSessionHref ? null : (
    <SignUpCard source="resource" format={format} />
  );

  // The resource-type badge, plus an "account needed" badge on the signed-out preview. Signed in,
  // it heads the content card; signed out, it sits in the header below the description.
  const badges = (
    <Box sx={badgeRowStyle}>
      <FormatBadge type={format} />
      {signInRequired && (
        <Box qa-id="resource-account-needed" sx={accountNeededBadgeStyle}>
          <LockOutlined sx={{ fontSize: 14, color: 'grey.700' }} />
          <Typography component="span" sx={accountNeededLabelStyle}>
            {tLibrary('accountNeeded')}
          </Typography>
        </Box>
      )}
    </Box>
  );

  const header = (
    <>
      <Box>
        <BackLink qaId="resource-back-link" href="/library" label={t('backToLibrary')} />
        <Divider sx={{ borderColor: 'sectionBorder', mt: 2 }} />
      </Box>

      <ResourceHero
        title={name}
        progress={resourceProgress}
        description={description}
        subtitle={hero?.subtitle}
        imageSrc={hero?.imageSrc}
        imageAlt={hero?.imageAlt}
        badges={signInRequired ? badges : undefined}
      />
    </>
  );

  if (contentAccessStatus !== 'accessGranted') {
    return (
      <>
        <Container sx={resourceContainerStyle}>
          {header}
          <Box sx={resourceCardColumnStyle}>
            {signInRequired ? (
              signUpCard
            ) : (
              <Box sx={mediaSlotLoadingStyle}>
                <CircularProgress color="error" />
              </Box>
            )}
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
          <Box sx={contentCardStyle}>
            {badges}
            <Box sx={contentBodyStyle}>
              {contributors && contributors.avatars.length > 0 && (
                <Box sx={contributorRowStyle}>
                  <AvatarGroup
                    avatars={contributors.avatars}
                    size="xsmall"
                    bordered={false}
                    frontAvatar="last"
                  />
                  <Typography sx={captionStyle}>{contributors.caption}</Typography>
                </Box>
              )}

              {media}

              {transcript && (
                <TranscriptAccordion
                  content={transcript}
                  name={name}
                  onToggle={(open) => {
                    if (transcriptEvents) {
                      logEvent(open ? transcriptEvents.opened : transcriptEvents.closed, eventData);
                    }
                    if (open) onTranscriptStart?.();
                  }}
                />
              )}
            </Box>
          </Box>

          {relatedSessionSlot}
          {beforeSections}
        </Box>

        <ResourceGroundingSection groundingStories={relatedGrounding} />

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
