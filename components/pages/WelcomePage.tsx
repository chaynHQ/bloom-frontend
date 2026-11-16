'use client';

import PageSection from '@/components/common/PageSection';
import { SignUpSection } from '@/components/common/SignUpSection';
import { SupportSection } from '@/components/common/SupportSection';
import PartnerHeader from '@/components/layout/PartnerHeader';
import { LibraryCardsSection } from '@/components/library/LibraryCardsSection';
import DynamicComponent from '@/components/storyblok/DynamicComponent';
import { Link as i18nLink } from '@/i18n/routing';
import { STORYBLOK_COLORS } from '@/lib/constants/enums';
import {
  generatePartnerPromoGetStartedEvent,
  generatePartnerPromoGoToCoursesEvent,
  WELCOME_BROWSE_ALL_CLICKED,
  WELCOME_CAROUSEL_PAGED,
  WELCOME_SUPPORT_CARD_CLICKED,
  WELCOME_VIEWED,
} from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { useFeaturedLibraryItems } from '@/lib/hooks/useFeaturedLibraryItems';
import { useLibrarySectionEvents } from '@/lib/hooks/useLibrarySectionEvents';
import { useHydratedSearchParams } from '@/lib/hooks/useHydratedSearchParams';
import { useLogEventOnce } from '@/lib/hooks/useLogEventOnce';
import useReferralPartner from '@/lib/hooks/useReferralPartner';
import { useUserAuthStatus } from '@/lib/hooks/useUserAuthStatus';
import type { BrandedPartner } from '@/lib/partners/types';
import { type LibraryStories } from '@/lib/utils/libraryData';
import logEvent, { getEventUserData } from '@/lib/utils/logEvent';
import { RichTextOptions } from '@/lib/utils/richText';
import bloomLogo from '@/public/bloom_logo.svg';
import illustrationSessions from '@/public/course_icon.svg';
import illustrationSignpost from '@/public/courses_signpost.svg';
import illustrationBloomHeadYellow from '@/public/illustration_bloom_head_yellow.svg';
import { Box, Button, Typography } from '@mui/material';
import { useStoryblokState } from '@storyblok/react';
import { ISbStoryData, SbBlokData } from '@storyblok/react/rsc';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { render } from 'storyblok-rich-text-react-renderer';

interface Props {
  story: ISbStoryData;
  libraryStories: LibraryStories;
  // The launched partner for the route's slug, resolved once by the page.
  partner: BrandedPartner;
}

const introTitleStyle = { mb: 2, maxWidth: 800 } as const;

export default function WelcomePage({
  story: initialStory,
  libraryStories,
  partner: partnerContent,
}: Props) {
  const story = useStoryblokState(initialStory) ?? initialStory;
  const t = useTranslations('Shared.librarySections');
  const tS = useTranslations('Shared');
  const tW = useTranslations('Welcome');

  const searchParams = useHydratedSearchParams();
  useReferralPartner();

  const userId = useTypedSelector((state) => state.user.id);
  const authStateLoading = useTypedSelector((state) => state.user.authStateLoading);
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);

  const userAuthStatus = useUserAuthStatus();
  const isLoggedIn = !authStateLoading && Boolean(userId);
  const partnerSlug = partnerContent.slug;
  const content = story.content;

  const code = searchParams?.get('code');

  const eventData = useMemo(
    () => ({
      welcome_partner: partnerSlug,
      ...getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin),
    }),
    [partnerSlug, userCreatedAt, partnerAccesses, partnerAdmin],
  );

  const registerPath = `/auth/register?partner=${partnerSlug}${code ? `&code=${code}` : ''}`;

  const { courses, sessions } = useFeaturedLibraryItems(libraryStories, content);
  const { logCardClick, logBrowseAll } = useLibrarySectionEvents('welcome', eventData);

  // Wait for getUser before logging, so a signed-in visitor isn't reported as anonymous.
  useLogEventOnce(
    WELCOME_VIEWED,
    { welcome_logged_in: isLoggedIn, ...eventData },
    userAuthStatus !== 'resolving',
  );

  const { partnershipLogo, partnershipLogoAlt, bloomGirlIllustration } = partnerContent;

  // Keeps firing the per-partner events, which feed existing dashboards.
  const logHeroClick = () => {
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
        priority
        imageSrc={
          content.header_image?.filename || bloomGirlIllustration || illustrationBloomHeadYellow
        }
        translatedImageAlt={content.header_image?.alt || tS('alt.bloomHead')}
        partnerLogoSrc={partnershipLogo || bloomLogo}
        partnerLogoAlt={
          partnershipLogo ? partnershipLogoAlt || 'alt.welcomeToBloom' : 'alt.bloomLogo'
        }
        partnerName={partnerContent.name}
        showWelcomeSubtext={!partnershipLogo}
      />

      <Box qa-id="welcome-intro">
        <PageSection
          color={STORYBLOK_COLORS.BLOOM_GRADIENT_PEACH}
          alignment="center"
          spacing="default"
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
        onCardSelect={logCardClick('sessions')}
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
        onCardSelect={logCardClick('courses')}
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
