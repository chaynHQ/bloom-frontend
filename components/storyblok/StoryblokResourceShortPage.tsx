'use client';

import { SignUpBanner } from '@/components/banner/SignUpBanner';
import ResourceFeedbackForm from '@/components/forms/ResourceFeedbackForm';
import { LANGUAGES, PROGRESS_STATUS, RESOURCE_CATEGORIES } from '@/lib/constants/enums';
import { RESOURCE_SHORT_VIDEO_VIEWED } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { Resource } from '@/lib/store/resourcesSlice';
import hasAccessToPage from '@/lib/utils/hasAccessToPage';
import logEvent from '@/lib/utils/logEvent';
import userHasAccessToPartnerContent from '@/lib/utils/userHasAccessToPartnerContent';
import { Box, Container } from '@mui/material';
import { ISbStoryData, storyblokEditable } from '@storyblok/react/rsc';
import Cookies from 'js-cookie';
import { useLocale } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { StoryblokRichtext } from 'storyblok-rich-text-react-renderer';
import { ContentUnavailable } from '../common/ContentUnavailable';
import LoadingContainer from '../common/LoadingContainer';
import { ResourceShortHeader } from '../resources/ResourceShortsHeader';
import DynamicComponent from './DynamicComponent';
import { StoryblokPageSectionProps } from './StoryblokPageSection';
import { StoryblokRelatedContent, StoryblokRelatedContentStory } from './StoryblokRelatedContent';

export interface StoryblokResourceShortPageProps {
  storyUuid: string;
  _uid: string;
  _editable: string;
  name: string;
  description: StoryblokRichtext;
  duration: string;
  video: { url: string };
  video_transcript: StoryblokRichtext;
  page_sections: StoryblokPageSectionProps[];
  related_session?: ISbStoryData;
  related_course?: ISbStoryData;
  related_content: StoryblokRelatedContentStory[];
  related_exercises: string[];
  languages: string[];
  component: 'resource_short_video';
  included_for_partners: string[];
}

const StoryblokResourceShortPage = (props: StoryblokResourceShortPageProps) => {
  const {
    storyUuid,
    _uid,
    _editable,
    name,
    description,
    video,
    video_transcript,
    page_sections,
    related_session,
    related_course,
    related_content,
    related_exercises,
    languages,
    included_for_partners,
  } = props;
  const locale = useLocale();
  const entryPartnerReferral = useTypedSelector((state) => state.user.entryPartnerReferral);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const resources = useTypedSelector((state) => state.resources);
  const userId = useTypedSelector((state) => state.user.id);
  const isLoggedIn = useTypedSelector((state) => Boolean(state.user.id));
  const [userAccess, setUserAccess] = useState<boolean>();

  const [resourceProgress, setResourceProgress] = useState<PROGRESS_STATUS>(
    PROGRESS_STATUS.NOT_STARTED,
  );
  const [resourceId, setResourceId] = useState<string>();

  const getContentPartners = useMemo(() => {
    const referralPartner = Cookies.get('referralPartner') || entryPartnerReferral;

    return userHasAccessToPartnerContent(
      partnerAdmin?.partner,
      partnerAccesses,
      referralPartner,
      userId,
    );
  }, [entryPartnerReferral, partnerAccesses, partnerAdmin, userId]);

  const eventData = useMemo(() => {
    return {
      resource_category: RESOURCE_CATEGORIES.SHORT_VIDEO,
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
    logEvent(RESOURCE_SHORT_VIDEO_VIEWED, eventData);
  }, []);

  const nextResourceHref = useMemo(() => {
    const nextResourceSlug = related_content[0]?.full_slug;
    return nextResourceSlug ? `/${nextResourceSlug}` : undefined;
  }, [related_content]);

  if (userAccess === undefined) return <LoadingContainer />;
  if (!userAccess) return <ContentUnavailable />;

  return (
    <Box
      {...storyblokEditable({
        _uid,
        _editable,
        name,
        description,
        video,
        video_transcript,
        page_sections,
        related_session,
        related_content,
        related_exercises,
      })}
    >
      <ResourceShortHeader
        {...{
          storyUuid,
          name,
          resourceProgress,
          // during the migration from multiple related sessions to a single related session
          // I am leaving this array option
          relatedSession: related_session,
          relatedCourse: related_course,
          video,
          video_transcript,
          nextResourceHref,
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
            category={RESOURCE_CATEGORIES.SHORT_VIDEO}
          />
        </Container>
      )}

      <StoryblokRelatedContent
        relatedContent={related_content}
        relatedExercises={related_exercises}
        userContentPartners={getContentPartners}
      />

      {!isLoggedIn && <SignUpBanner />}
    </Box>
  );
};

export default StoryblokResourceShortPage;
