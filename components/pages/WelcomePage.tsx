'use client';

import NoDataAvailable from '@/components/common/NoDataAvailable';
import PageSection from '@/components/common/PageSection';
import { SignUpSection } from '@/components/common/SignUpSection';
import { SupportSection } from '@/components/common/SupportSection';
import PartnerHeader from '@/components/layout/PartnerHeader';
import { LibraryCardsSection } from '@/components/library/LibraryCardsSection';
import DynamicComponent from '@/components/storyblok/DynamicComponent';
import { Link as i18nLink, usePathname, useRouter } from '@/i18n/routing';
import { STORYBLOK_COLORS } from '@/lib/constants/enums';
import {
  generatePartnerPromoGetStartedEvent,
  generatePartnerPromoGoToCoursesEvent,
  WELCOME_BROWSE_ALL_CLICKED,
  WELCOME_CAROUSEL_PAGED,
  WELCOME_CONTENT_CARD_CLICKED,
  WELCOME_SUPPORT_CARD_CLICKED,
  WELCOME_VIEWED,
} from '@/lib/constants/events';
import { getPartnerContent } from '@/lib/constants/partners';
import { useTypedSelector } from '@/lib/hooks/store';
import { useFeaturedLibraryItems } from '@/lib/hooks/useFeaturedLibraryItems';
import { useLibrarySectionEvents } from '@/lib/hooks/useLibrarySectionEvents';
import useReferralPartner from '@/lib/hooks/useReferralPartner';
import { type LibraryStories } from '@/lib/utils/libraryData';
import logEvent, { getEventUserData } from '@/lib/utils/logEvent';
import { RichTextOptions } from '@/lib/utils/richText';
import bloomLogo from '@/public/bloom_logo.svg';
import illustrationSignpost from '@/public/courses_signpost.svg';
import illustrationSessions from '@/public/course_icon.svg';
import illustrationBloomHeadYellow from '@/public/illustration_bloom_head_yellow.svg';
import { Box, Button, Typography } from '@mui/material';
import { useStoryblokState } from '@storyblok/react';
import { ISbStoryData, SbBlokData } from '@storyblok/react/rsc';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';
import { render } from 'storyblok-rich-text-react-renderer';

interface Props {
  story: ISbStoryData;
  libraryStories: LibraryStories;
  // Taken from the route rather than the story, so an unpublished or mis-slugged story cannot
  // silently drop the partner branding.
  partnerName: string;
}

// The headline and the call to action sit in a section of their own under the partner banner,
// rather than beside the lockup, so the partnership is what opens the page.
const introTitleStyle = { mb: 2, maxWidth: 800 } as const;

// The redesigned partner welcome page: the home page's sections, with the partner's lockup, CTA
// and editor-composed sections around them. Replaces StoryblokWelcomePage.
export default function WelcomePage({ story: initialStory, libraryStories, partnerName }: Props) {
  const story = useStoryblokState(initialStory) ?? initialStory;
  const t = useTranslations('Shared.librarySections');
  const tS = useTranslations('Shared');
  const tW = useTranslations('Welcome');

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useReferralPartner();

  const userId = useTypedSelector((state) => state.user.id);
  const authStateLoading = useTypedSelector((state) => state.user.authStateLoading);
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const userToken = useTypedSelector((state) => state.user.token);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const entryPartnerReferral = useTypedSelector((state) => state.user.entryPartnerReferral);
  const entryPartnerAccessCode = useTypedSelector((state) => state.user.entryPartnerAccessCode);

  const isLoggedIn = !authStateLoading && Boolean(userId);
  const partnerSlug = partnerName.toLowerCase();
  const content = story.content;

  const code = searchParams.get('code');
  const partner = searchParams.get('partner');
  const entryCode = entryPartnerReferral === partnerSlug ? entryPartnerAccessCode : '';
  const accessCode = code || entryCode;

  const eventData = useMemo(
    () => ({
      welcome_partner: partnerSlug,
      ...getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin),
    }),
    [partnerSlug, userCreatedAt, partnerAccesses, partnerAdmin],
  );

  // An entry code held in state is put back in the query, so it survives a refresh.
  const urlUpdated = useRef(false);
  useEffect(() => {
    if (code || !entryCode || urlUpdated.current) return;
    urlUpdated.current = true;
    router.push({ pathname, query: { code: entryCode, partner } });
  }, [router, pathname, partner, code, entryCode]);

  const registerPath = `/auth/register?partner=${partnerSlug}${accessCode ? `&code=${accessCode}` : ''}`;

  const { courses, sessions } = useFeaturedLibraryItems(libraryStories, content);
  const { logCardClick, logBrowseAll } = useLibrarySectionEvents('welcome', eventData);

  // partnerAccesses/createdAt arrive with getUser, so the view event waits for the user to settle
  // rather than reporting a signed-in visitor as anonymous.
  const userSettled = !authStateLoading && (!userToken || Boolean(userId));
  const viewLogged = useRef(false);
  useEffect(() => {
    if (!userSettled || viewLogged.current) return;
    viewLogged.current = true;
    logEvent(WELCOME_VIEWED, { welcome_logged_in: isLoggedIn, ...eventData });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSettled, eventData]);

  const partnerContent = getPartnerContent(partnerName);

  if (!partnerContent) {
    return <NoDataAvailable />;
  }

  const { partnershipLogo, partnershipLogoAlt, bloomGirlIllustration } = partnerContent;

  const logHeroClick = () => {
    // The per-partner events predate this page and feed existing dashboards, so both still fire.
    logEvent(
      isLoggedIn
        ? generatePartnerPromoGoToCoursesEvent(partnerSlug)
        : generatePartnerPromoGetStartedEvent(partnerSlug),
      eventData,
    );
  };

  return (
    <Box>
      <PartnerHeader
        variant="hero"
        // Falls back to the partner's own illustration, so an unset asset never leaves the banner
        // one-sided.
        imageSrc={
          content.header_image?.filename || bloomGirlIllustration || illustrationBloomHeadYellow
        }
        translatedImageAlt={content.header_image?.alt || tS('alt.bloomHead')}
        partnerLogoSrc={partnershipLogo || bloomLogo}
        partnerLogoAlt={
          partnershipLogo ? partnershipLogoAlt || 'alt.welcomeToBloom' : 'alt.bloomLogo'
        }
        showWelcomeSubtext={!partnershipLogo}
      />

      <Box qa-id="welcome-intro">
        <PageSection
          color={STORYBLOK_COLORS.COMMON_WHITE}
          alignment="center"
          spacing="compact"
          divider={false}
        >
          <Typography variant="h1" component="h1" sx={introTitleStyle}>
            {content.title}
          </Typography>
          {render(content.introduction, RichTextOptions)}
          <Box sx={{ mt: 3 }}>
            <Button
              id="primary-get-started-button"
              qa-id="welcome-hero-cta"
              variant="contained"
              color="error"
              size="large"
              component={i18nLink}
              href={isLoggedIn ? '/library' : registerPath}
              onClick={logHeroClick}
            >
              {tW(isLoggedIn ? 'goToLibrary' : 'getStarted')}
            </Button>
          </Box>
        </PageSection>
      </Box>

      {content.top_sections?.map((section: SbBlokData, index: number) => (
        <DynamicComponent key={`top_section_${index}`} blok={section} />
      ))}

      <LibraryCardsSection
        qaId="welcome-sessions"
        heading={t('sessions.heading')}
        introduction={t('sessions.introduction')}
        illustrationSrc={illustrationSessions}
        items={sessions}
        carouselEventName={WELCOME_CAROUSEL_PAGED}
        showAccountNeeded={!isLoggedIn}
        browseLabel={t('sessions.browseAll')}
        browseHref="/library?type=session"
        onCardSelect={logCardClick(WELCOME_CONTENT_CARD_CLICKED, 'sessions')}
        onBrowseAll={logBrowseAll(WELCOME_BROWSE_ALL_CLICKED, 'sessions')}
      />

      <LibraryCardsSection
        qaId="welcome-courses"
        heading={t('courses.heading')}
        introduction={t('courses.introduction')}
        illustrationSrc={illustrationSignpost}
        items={courses}
        carouselEventName={WELCOME_CAROUSEL_PAGED}
        browseLabel={t('courses.browseAll')}
        browseHref="/library?type=course"
        divided={sessions.length > 0}
        onCardSelect={logCardClick(WELCOME_CONTENT_CARD_CLICKED, 'courses')}
        onBrowseAll={logBrowseAll(WELCOME_BROWSE_ALL_CLICKED, 'courses')}
      />

      <SupportSection eventUserData={eventData} eventName={WELCOME_SUPPORT_CARD_CLICKED} />

      {!isLoggedIn && <SignUpSection source={`welcome-${partnerSlug}`} sectionBelow />}

      {content.bottom_sections?.map((section: SbBlokData, index: number) => (
        <DynamicComponent key={`bottom_section_${index}`} blok={section} />
      ))}
    </Box>
  );
}
