'use client';

import { ContentUnavailable } from '@/components/common/ContentUnavailable';
import LoadingContainer from '@/components/common/LoadingContainer';
import LoginDialog from '@/components/layout/LoginDialog';
import { ResourcePageLayout } from '@/components/resources/ResourcePageLayout';
import { LANGUAGES, PROGRESS_STATUS, RESOURCE_CATEGORIES } from '@/lib/constants/enums';
import { RESOURCE_WRITTEN_VIEWED } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { useIsUserLoading } from '@/lib/hooks/useIsUserLoading';
import { useResourceProgress } from '@/lib/hooks/useResourceProgress';
import { Resource } from '@/lib/store/resourcesSlice';
import hasAccessToPage from '@/lib/utils/hasAccessToPage';
import logEvent from '@/lib/utils/logEvent';
import { toResourceContributors } from '@/lib/utils/resourceContributors';
import { RichTextOptions } from '@/lib/utils/richText';
import userHasAccessToPartnerContent from '@/lib/utils/userHasAccessToPartnerContent';
import { Box } from '@mui/material';
import { useStoryblokState } from '@storyblok/react';
import { ISbStoryData, SbBlokData, storyblokEditable } from '@storyblok/react/rsc';
import { useLocale } from 'next-intl';
import { useEffect, useMemo } from 'react';
import { render, StoryblokRichtext } from 'storyblok-rich-text-react-renderer';
import { StoryblokRelatedContentStory } from './StoryblokRelatedContent';
import { StoryblokTeamMembersSectionProps } from './StoryblokTeamMembersSection';

export interface StoryblokResourceWrittenPageProps {
  _uid: string;
  _editable: string;
  name: string;
  description: StoryblokRichtext;
  header_image: { filename: string; alt: string };
  duration: string;
  body: StoryblokRichtext;
  login_required: boolean;
  contributor_images?: { filename: string; alt: string }[];
  contributors_description?: string;
  team_members_section?: StoryblokTeamMembersSectionProps[];
  page_sections: SbBlokData[];
  related_content: StoryblokRelatedContentStory[];
  related_grounding: ISbStoryData[];
  languages: string[];
  component: 'resource_written';
  included_for_partners: string[];
}

const EVENT_PREFIX = 'RESOURCE_WRITTEN' as const;

const StoryblokResourceWrittenPage = ({ story: initialStory }: { story: ISbStoryData }) => {
  const story = useStoryblokState(initialStory) ?? initialStory;
  const {
    _uid,
    _editable,
    name,
    description,
    header_image,
    body,
    login_required,
    contributor_images,
    contributors_description,
    team_members_section,
    page_sections,
    related_content,
    related_grounding,
    languages,
    included_for_partners,
  } = story.content as StoryblokResourceWrittenPageProps;
  const storyUuid = story.uuid;

  const locale = useLocale();
  const userId = useTypedSelector((state) => state.user.id);
  const authStateLoading = useTypedSelector((state) => state.user.authStateLoading);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const resources = useTypedSelector((state) => state.resources);
  const isLoggedIn = !authStateLoading && Boolean(userId);
  const isUserLoading = useIsUserLoading();

  const userAccess = useMemo(() => {
    const isPublicContent = included_for_partners.some(
      (partner) => partner.toLowerCase() === 'public',
    );
    return (
      (isPublicContent ||
        hasAccessToPage(isLoggedIn, true, included_for_partners, partnerAccesses, partnerAdmin)) &&
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
      resource_category: RESOURCE_CATEGORIES.WRITTEN,
      resource_name: name,
      resource_storyblok_uuid: storyUuid,
      resource_progress: resourceProgress,
    }),
    [name, storyUuid, resourceProgress],
  );

  useEffect(() => {
    logEvent(RESOURCE_WRITTEN_VIEWED, eventData);
  });

  const { start } = useResourceProgress({
    storyUuid,
    eventPrefix: EVENT_PREFIX,
    resourceProgress,
    eventData,
  });

  // Written resources have no play button to hook "started" to — reading the page is the
  // engagement signal, so progress starts as soon as it's viewed.
  useEffect(() => {
    start();
  }, [start]);

  const contributors = useMemo(
    () => toResourceContributors(contributor_images, contributors_description),
    [contributor_images, contributors_description],
  );
  const groundingIds = useMemo(
    () => related_grounding?.map((groundingStory) => groundingStory.slug) ?? [],
    [related_grounding],
  );

  if (!userAccess) {
    if (isUserLoading) return <LoadingContainer />;
    return <ContentUnavailable />;
  }

  // Waits out the same loading window as userAccess above, so a logged-in visitor doesn't see
  // the login dialog flash open and close while their auth state is still resolving.
  const requiresLogin = !isUserLoading && login_required && !isLoggedIn;

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
      })}
    >
      {requiresLogin && <LoginDialog />}
      <ResourcePageLayout
        format="written"
        name={name}
        storyUuid={storyUuid}
        category={RESOURCE_CATEGORIES.WRITTEN}
        eventPrefix={EVENT_PREFIX}
        resourceProgress={resourceProgress}
        resourceId={resourceId}
        isLoggedIn={isLoggedIn}
        eventData={eventData}
        description={description}
        hero={{ imageSrc: header_image?.filename || undefined, imageAlt: header_image?.alt }}
        contributors={contributors}
        teamMembersSection={team_members_section?.[0]}
        pageSections={page_sections}
        relatedGrounding={groundingIds}
        relatedContent={related_content}
        userContentPartners={userHasAccessToPartnerContent(
          partnerAdmin?.partner,
          partnerAccesses,
          null,
          userId,
        )}
        media={<Box>{render(body, RichTextOptions)}</Box>}
      />
    </Box>
  );
};

export default StoryblokResourceWrittenPage;
