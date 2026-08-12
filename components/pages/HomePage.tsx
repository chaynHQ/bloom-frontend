'use client';

import NoDataAvailable from '@/components/common/NoDataAvailable';
import { SignUpSection } from '@/components/common/SignUpSection';
import { SupportSection } from '@/components/common/SupportSection';
import Header from '@/components/layout/Header';
import { LibraryCardsSection } from '@/components/library/LibraryCardsSection';
import DynamicComponent from '@/components/storyblok/DynamicComponent';
import { Link as i18nLink } from '@/i18n/routing';
import {
  HOME_BROWSE_ALL_CLICKED,
  HOME_CAROUSEL_PAGED,
  HOME_CONTENT_CARD_CLICKED,
  HOME_CONTINUE_CARD_CLICKED,
  HOME_HERO_CTA_CLICKED,
  HOME_SUPPORT_CARD_CLICKED,
  HOME_VIEWED,
  PROMO_GET_STARTED_CLICKED,
} from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { useFeaturedLibraryItems } from '@/lib/hooks/useFeaturedLibraryItems';
import { useLibrarySectionEvents } from '@/lib/hooks/useLibrarySectionEvents';
import { useRegisterPath } from '@/lib/hooks/useRegisterPath';
import { type LibraryStories } from '@/lib/utils/libraryData';
import logEvent, { getEventUserData } from '@/lib/utils/logEvent';
import illustrationSignpost from '@/public/courses_signpost.svg';
import illustrationSessions from '@/public/course_icon.svg';
import { Box, Button } from '@mui/material';
import { useStoryblokState } from '@storyblok/react';
import { ISbStoryData, SbBlokData } from '@storyblok/react/rsc';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef } from 'react';

interface Props {
  story: ISbStoryData | undefined;
  libraryStories: LibraryStories;
}

export default function HomePage({ story: initialStory, libraryStories }: Props) {
  const story = useStoryblokState(initialStory ?? null) ?? initialStory;
  const t = useTranslations('Shared.librarySections');
  const tHero = useTranslations('Home.hero');

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

  const { courses, sessions, inProgress } = useFeaturedLibraryItems(libraryStories, story?.content);
  const { logCardClick, logBrowseAll } = useLibrarySectionEvents('home', eventUserData);

  // Wait for getUser before logging, so a signed-in visitor isn't reported as anonymous.
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

  if (!story) {
    return <NoDataAvailable />;
  }

  const logCtaClick = (cta: string, alsoLog?: string) => {
    logEvent(HOME_HERO_CTA_CLICKED, { home_hero_cta: cta, ...eventUserData });
    if (alsoLog) logEvent(alsoLog, eventUserData);
  };

  return (
    <Box>
      <Header
        variant="hero"
        title={story.content.title}
        introduction={story.content.introduction}
        imageSrc={story.content.header_image?.filename}
        imageAlt={
          story.content.header_image?.alt ? `alt.${story.content.header_image.alt}` : undefined
        }
        translatedImageAlt={story.content.translatedImageAlt}
        cta={
          isLoggedIn ? (
            <>
              <Button
                qa-id="home-hero-sessions-button"
                variant="contained"
                color="error"
                component={i18nLink}
                href="/library?type=session"
                onClick={() => logCtaClick('sessions')}
              >
                {tHero('exploreSessionsCta')}
              </Button>
              <Button
                qa-id="home-hero-courses-button"
                variant="outlined"
                color="primary"
                component={i18nLink}
                href="/library?type=course"
                onClick={() => logCtaClick('courses')}
              >
                {tHero('goToCoursesCta')}
              </Button>
            </>
          ) : (
            <Button
              id="primary-get-started-button"
              qa-id="home-hero-join-button"
              variant="contained"
              color="error"
              size="large"
              component={i18nLink}
              href={registerPath}
              onClick={() => logCtaClick('join', PROMO_GET_STARTED_CLICKED)}
            >
              {tHero('joinCta')}
            </Button>
          )
        }
      />

      {story.content.top_sections?.map((section: SbBlokData, index: number) => (
        <DynamicComponent key={`top_section_${index}`} blok={section} />
      ))}

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
        onBrowseAll={logBrowseAll(HOME_BROWSE_ALL_CLICKED, 'sessions')}
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
        onBrowseAll={logBrowseAll(HOME_BROWSE_ALL_CLICKED, 'courses')}
      />

      <SupportSection eventUserData={eventUserData} eventName={HOME_SUPPORT_CARD_CLICKED} />

      {!isLoggedIn && <SignUpSection source="home" sectionBelow />}

      {story.content.bottom_sections?.map((section: SbBlokData, index: number) => (
        <DynamicComponent key={`bottom_section_${index}`} blok={section} />
      ))}
    </Box>
  );
}
