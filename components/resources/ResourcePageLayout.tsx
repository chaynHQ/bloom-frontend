'use client';

import SessionContentCard from '@/components/cards/SessionContentCard';
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
import MultipleBonusContent, { type BonusContent } from '@/components/session/MultipleBonusContent';
import { SessionCourseNav } from '@/components/session/SessionCourseNav';
import { sessionContainerStyle, sessionMainStyle } from '@/components/session/sessionPageLayout';
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
import {
  GROUNDING_EXERCISE_CLICKED,
  SESSION_CARD_CLICKED,
  SESSION_NEXT_CLICKED,
  SESSION_PLAYLIST_OPENED,
} from '@/lib/constants/events';
import { useLibraryReturnHref } from '@/lib/hooks/useLibraryReturnHref';
import { type CompleteResource, type ResourceEventPrefix } from '@/lib/hooks/useResourceProgress';
import { type CourseNav } from '@/lib/hooks/useStoryblokResourcePage';
import { type ContentType } from '@/lib/utils/libraryData';
import logEvent from '@/lib/utils/logEvent';
import { RichTextOptions } from '@/lib/utils/richText';
import { Box, Button, CircularProgress, Container, Divider, Link, Typography } from '@mui/material';
import { type ISbStoryData, type SbBlokData } from '@storyblok/react/rsc';
import { useTranslations } from 'next-intl';
import { type ReactNode } from 'react';
import { render, type StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

const mediaSlotLoadingStyle = { display: 'flex', justifyContent: 'center', py: 6 } as const;

// Inside a course the resource sits in the session pages' two-column shell; the column keeps the
// resource pages' own spacing and width.
const courseMainStyle = { ...sessionMainStyle, gap: 4, maxWidth: { lg: 680 } } as const;

const partOfStyle = { color: 'grey.800' } as const;

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
  activity?: StoryblokRichtext;
  bonus?: BonusContent[];
  // The visible courses that list this resource, linked under the content card.
  partOfCourses?: { name: string; href: string }[];
  // Set when the resource is opened inside a modular course: course playlist, back link and "Next".
  courseNav?: CourseNav;
}

// An empty Storyblok rich-text field is a single empty paragraph.
const hasRichText = (value?: StoryblokRichtext) =>
  Boolean(value?.content && (value.content.length > 1 || value.content[0]?.content));

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
  activity,
  bonus,
  partOfCourses = [],
  courseNav,
}: ResourcePageLayoutProps) => {
  const t = useTranslations('Resources');
  const tC = useTranslations('Courses');
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

  // Inside a course the playlist carries the back link from `lg`; below that it sits inline here.
  const header = (
    <>
      {courseNav ? (
        <BackLink
          qaId="resource-back-link"
          href={courseNav.courseHref}
          label={tC('backToCourse')}
          sx={{ display: { lg: 'none' } }}
        />
      ) : (
        <Box>
          <BackLink qaId="resource-back-link" href={libraryHref} label={t('backToLibrary')} />
          <Divider sx={{ borderColor: 'sectionBorder', mt: 2 }} />
        </Box>
      )}

      <ResourceHero
        title={name}
        progress={resourceProgress}
        subtitle={hero?.subtitle}
        imageSrc={hero?.imageSrc}
        imageAlt={hero?.imageAlt}
      />
    </>
  );

  const courseNavigation = courseNav && courseNav.resources.length > 0 && (
    <SessionCourseNav
      courseName={courseNav.courseName}
      courseHref={courseNav.courseHref}
      sessions={courseNav.resources}
      currentSessionUuid={storyUuid}
      progressByUuid={courseNav.progressByUuid}
      accountNeeded={!isSignedIn}
      isLocked={(resource) => !isSignedIn && Boolean(resource.loginRequired)}
      backHref={courseNav.courseHref}
      backLabel={tC('backToCourse')}
      onSessionSelect={(resource) =>
        logEvent(SESSION_CARD_CLICKED, {
          ...eventData,
          card_surface: 'playlist',
          card_item_name: resource.name,
          selected_session_storyblok_uuid: resource.uuid,
          selected_session_position: resource.position,
        })
      }
      onPlaylistOpen={() => logEvent(SESSION_PLAYLIST_OPENED, eventData)}
    />
  );

  // The page's main column: the resource container on its own, the session shell in a course.
  const shell = (children: ReactNode) =>
    courseNav ? (
      <Container sx={sessionContainerStyle}>
        <Box component="main" sx={courseMainStyle}>
          {children}
        </Box>
        {/* After main in the DOM so the mobile bar closes the page; ordered first on desktop. */}
        {courseNavigation}
      </Container>
    ) : (
      <Container sx={resourceContainerStyle}>{children}</Container>
    );

  const nextResource = courseNav?.nextResource;
  const nextButton = nextResource && (
    <Button
      qa-id="resource-next-button"
      variant="contained"
      color="error"
      component={i18nLink}
      href={nextResource.href}
      onClick={() =>
        logEvent(SESSION_NEXT_CLICKED, {
          ...eventData,
          card_item_name: nextResource.name,
          next_session_storyblok_uuid: nextResource.uuid,
        })
      }
      sx={{ alignSelf: 'center' }}
    >
      {tC('sessionDetail.nextSession')}
    </Button>
  );

  const partOfLinks = partOfCourses.length > 0 && (
    <Typography qa-id="resource-part-of" variant="body2" sx={partOfStyle}>
      {courseNav ? t('alsoPartOfCourses', { count: partOfCourses.length }) : t('partOf')}{' '}
      {partOfCourses.map((course, index) => (
        <span key={course.href}>
          {index > 0 && ' · '}
          <Link component={i18nLink} href={course.href}>
            {course.name}
          </Link>
        </span>
      ))}
    </Typography>
  );

  if (contentAccessStatus !== 'accessGranted') {
    return (
      <>
        {shell(
          <>
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
              {partOfLinks}
            </Box>
          </>,
        )}

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
      {shell(
        <>
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
            {partOfLinks}
            {relatedSessionSlot}
            {beforeSections}
            {hasRichText(activity) && (
              <SessionContentCard
                qaId="resource-activity"
                format="activity"
                eventPrefix="SESSION_ACTIVITY"
                eventData={eventData}
              >
                <>{render(activity, RichTextOptions)}</>
              </SessionContentCard>
            )}
            {bonus && bonus.length > 0 && (
              <MultipleBonusContent bonus={bonus} eventData={eventData} />
            )}
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

          {(bottomAction || nextButton) && (
            <>
              <Divider sx={{ borderColor: 'sectionBorder' }} />
              <Box sx={resourceCardColumnStyle}>
                {bottomAction}
                {nextButton}
              </Box>
            </>
          )}
        </>,
      )}

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
