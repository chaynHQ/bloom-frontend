'use client';

import { SignUpSection } from '@/components/common/SignUpSection';
import NoDataAvailable from '@/components/common/NoDataAvailable';
import { SupportSection } from '@/components/common/SupportSection';
import { LibraryCardsSection } from '@/components/library/LibraryCardsSection';
import { HomeHeader } from '@/components/home/HomeHeader';
import StoryblokNotesFromBloomPromo from '@/components/storyblok/StoryblokNotesFromBloomPromo';
import StoryblokPageSection from '@/components/storyblok/StoryblokPageSection';
import {
  HOME_BROWSE_ALL_CLICKED,
  HOME_CAROUSEL_PAGED,
  HOME_CONTENT_CARD_CLICKED,
  HOME_CONTINUE_CARD_CLICKED,
  HOME_SUPPORT_CARD_CLICKED,
  HOME_VIEWED,
} from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { useRegisterPath } from '@/lib/hooks/useRegisterPath';
import { useLibraryItems } from '@/lib/hooks/useLibraryItems';
import {
  PROGRESS_STATUS_BY_ITEM_PROGRESS,
  type LibraryItem,
  type LibraryStories,
} from '@/lib/utils/libraryData';
import logEvent, { getEventUserData } from '@/lib/utils/logEvent';
import illustrationSignpost from '@/public/courses_signpost.svg';
import illustrationSessions from '@/public/course_icon.svg';
import { Box } from '@mui/material';
import { useStoryblokState } from '@storyblok/react';
import { ISbStoryData } from '@storyblok/react/rsc';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef } from 'react';

// How many cards each content section shows.
const SECTION_SIZE = 3;

interface Props {
  story: ISbStoryData | undefined;
  libraryStories: LibraryStories;
}

export default function HomePage({ story: initialStory, libraryStories }: Props) {
  const story = useStoryblokState(initialStory ?? null) ?? initialStory;
  const t = useTranslations('Home');

  const userId = useTypedSelector((state) => state.user.id);
  const authStateLoading = useTypedSelector((state) => state.user.authStateLoading);
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const userToken = useTypedSelector((state) => state.user.token);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const registerPath = useRegisterPath();
  const isLoggedIn = !authStateLoading && Boolean(userId);

  const eventUserData = useMemo(
    () => getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin),
    [userCreatedAt, partnerAccesses, partnerAdmin],
  );

  // The same locale- and partner-filtered content the library is built from, so the page cannot
  // surface a course or session the visitor has no access to.
  const items = useLibraryItems(libraryStories);

  const content = story?.content;

  const { courses, sessions, inProgress } = useMemo(() => {
    const byUuid = new Map(items.map((item) => [item.id, item]));
    // An editor's picks come first, falling back to the first few items of that kind.
    const pick = (uuids: string[] | undefined, fallback: LibraryItem[]) => {
      const chosen = (uuids ?? [])
        .map((uuid) => byUuid.get(uuid))
        .filter((item): item is LibraryItem => Boolean(item));
      return (chosen.length ? chosen : fallback).slice(0, SECTION_SIZE);
    };

    return {
      courses: pick(
        content?.featured_courses,
        items.filter((item) => item.kind === 'course'),
      ),
      sessions: pick(
        content?.featured_sessions,
        items.filter((item) => item.kind === 'session'),
      ),
      inProgress: items.filter((item) => item.progress === 'started').slice(0, SECTION_SIZE),
    };
  }, [items, content]);

  // partnerAccesses/createdAt only arrive after the getUser query, so the view event waits for the
  // user to settle rather than reporting a signed-in visitor as anonymous.
  const userSettled = !authStateLoading && (!userToken || Boolean(userId));
  const viewLogged = useRef(false);
  useEffect(() => {
    if (!userSettled || viewLogged.current) return;
    viewLogged.current = true;
    logEvent(HOME_VIEWED, {
      home_logged_in: isLoggedIn,
      home_in_progress_count: inProgress.length,
      ...eventUserData,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSettled, eventUserData]);

  const logCardClick = useCallback(
    (event: string, section: string) => (item: LibraryItem, index: number) => {
      logEvent(event, {
        home_section: section,
        home_item_name: item.title,
        home_item_storyblok_uuid: item.id,
        home_item_kind: item.kind,
        home_item_format: item.format ?? null,
        home_item_progress: PROGRESS_STATUS_BY_ITEM_PROGRESS[item.progress ?? 'none'],
        home_item_position: index + 1, // 1-based rank within the section
        ...eventUserData,
      });
    },
    [eventUserData],
  );

  const logBrowseAll = (section: string) => () =>
    logEvent(HOME_BROWSE_ALL_CLICKED, { home_section: section, ...eventUserData });

  // Editor-composed sections: `top_sections` sits between the hero and the content rows below,
  // `bottom_sections` closes the page.
  const renderSections = (sections: any[] | undefined, key: string) =>
    sections?.map((section: any, index: number) =>
      section.component === 'notes_from_bloom_promo' ? (
        <StoryblokNotesFromBloomPromo key={`${key}_notes_${index}`} />
      ) : (
        <StoryblokPageSection key={`${key}_${index}`} {...section} isLoggedIn={isLoggedIn} />
      ),
    );

  if (!story) {
    return <NoDataAvailable />;
  }

  return (
    <Box>
      <HomeHeader
        title={story.content.title}
        introduction={story.content.introduction}
        imageSrc={story.content.header_image?.filename}
        imageAlt={story.content.header_image?.alt}
        translatedImageAlt={story.content.translatedImageAlt}
        isLoggedIn={isLoggedIn}
        registerPath={registerPath}
        eventUserData={eventUserData}
      />

      {renderSections(story.content.top_sections, 'top_section')}

      <LibraryCardsSection
        qaId="home-continue-learning"
        heading={t('continueLearning.heading')}
        items={inProgress}
        background="paleSecondaryLight"
        carouselEventName={HOME_CAROUSEL_PAGED}
        onCardSelect={logCardClick(HOME_CONTINUE_CARD_CLICKED, 'continue')}
      />

      <LibraryCardsSection
        qaId="home-sessions"
        heading={t('sessions.heading')}
        introduction={t('sessions.introduction')}
        illustrationSrc={illustrationSessions}
        items={sessions}
        carouselEventName={HOME_CAROUSEL_PAGED}
        showAccountNeeded={!isLoggedIn}
        browseLabel={t('sessions.browseAll')}
        browseHref="/library?type=session"
        onCardSelect={logCardClick(HOME_CONTENT_CARD_CLICKED, 'sessions')}
        onBrowseAll={logBrowseAll('sessions')}
      />

      <LibraryCardsSection
        qaId="home-courses"
        heading={t('courses.heading')}
        introduction={t('courses.introduction')}
        illustrationSrc={illustrationSignpost}
        items={courses}
        carouselEventName={HOME_CAROUSEL_PAGED}
        browseLabel={t('courses.browseAll')}
        browseHref="/library?type=course"
        divided={sessions.length > 0}
        onCardSelect={logCardClick(HOME_CONTENT_CARD_CLICKED, 'courses')}
        onBrowseAll={logBrowseAll('courses')}
      />

      <SupportSection eventUserData={eventUserData} eventName={HOME_SUPPORT_CARD_CLICKED} />

      {!isLoggedIn && <SignUpSection sectionBelow />}

      {renderSections(story.content.bottom_sections, 'bottom_section')}
    </Box>
  );
}
