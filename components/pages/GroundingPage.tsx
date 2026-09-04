'use client';

import ScrollToSignUpButton from '@/components/common/ScrollToSignUpButton';
import { SignUpSection } from '@/components/common/SignUpSection';
import { SupportSection } from '@/components/common/SupportSection';
import Header from '@/components/layout/Header';
import { GroundingExerciseDialog } from '@/components/resources/GroundingExerciseDialog';
import { Link as i18nLink, useRouter } from '@/i18n/routing';
import {
  GROUNDING_LOAD_MORE_CLICKED,
  GROUNDING_SUPPORT_CARD_CLICKED,
  GROUNDING_VIEWED,
} from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { useCookieReferralPartner } from '@/lib/hooks/useCookieReferralPartner';
import filterResourcesForLocaleAndPartnerAccess from '@/lib/utils/filterStoryByLanguageAndPartnerAccess';
import { parseMinutes, toPlainText } from '@/lib/utils/libraryData';
import logEvent, { getEventUserData } from '@/lib/utils/logEvent';
import userHasAccessToPartnerContent from '@/lib/utils/userHasAccessToPartnerContent';
import { cardShadow } from '@/styles/common';
import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded';
import { Box, Button, Card, CardActionArea, Container, Divider, Typography } from '@mui/material';
import { ISbStoryData } from '@storyblok/react/rsc';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

// Matches LibraryPage's card-grid page size, sized to fill whole rows of this grid's 3 columns.
const PAGE_SIZE = 9;

// Matches Figma's "Sessions" section background (background/secondary/2, #fff2eb) — without it
// the section falls back to the page's plain default and the cardSurface cards barely contrast.
const sectionStyle = { backgroundColor: 'pageBackground', py: { xs: 4, md: 6 } } as const;

const resultsCountWrapperStyle = { mb: 3 } as const;

const resultsCountStyle = { textAlign: 'end', color: 'grey.700', mb: 0 } as const;

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
  gap: 3,
} as const;

const cardStyle = {
  // The theme's global MuiCard override adds a 20px top margin below `md` (for cards stacked
  // outside a grid); it just doubles up with this grid's own `gap` here.
  mt: 0,
  borderRadius: '16px',
  boxShadow: cardShadow,
  backgroundColor: 'cardSurface',
} as const;

const cardContentStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
  p: 2,
} as const;

const cardDescriptionStyle = {
  color: 'grey.700',
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
} as const;

const durationRowStyle = { display: 'flex', alignItems: 'center', gap: 0.5, color: 'grey.800' } as const;

const durationLabelStyle = { fontFamily: 'headingFontFamily', fontSize: '0.875rem', fontWeight: 500 } as const;

const loadMoreRowStyle = { display: 'flex', justifyContent: 'center', mt: 4 } as const;

interface GroundingPageProps {
  stories: ISbStoryData[];
  heroStory?: ISbStoryData;
}

export const GroundingPage = ({ stories, heroStory }: GroundingPageProps) => {
  const t = useTranslations('Resources');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = useTypedSelector((state) => state.user.id);
  const userToken = useTypedSelector((state) => state.user.token);
  const authStateLoading = useTypedSelector((state) => state.user.authStateLoading);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const referralPartner = useCookieReferralPartner();
  const isLoggedIn = !authStateLoading && Boolean(userId);
  // A signed-in user briefly looks anonymous: partnerAccesses/createdAt arrive with getUser.
  const userSettled = !authStateLoading && (!userToken || Boolean(userId));
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const viewLogged = useRef(false);

  const visibleStories = useMemo(() => {
    // Grounding has no gating, unlike partner-curated resources — 'public' always applies here,
    // regardless of the visitor's own partner, or a partner user's cards vanish once auth resolves.
    const userPartners = [
      ...userHasAccessToPartnerContent(partnerAdmin?.partner, partnerAccesses, referralPartner, userId),
      'public',
    ];
    return filterResourcesForLocaleAndPartnerAccess(stories, locale, userPartners);
  }, [stories, locale, partnerAccesses, partnerAdmin?.partner, referralPartner, userId]);

  const openId = searchParams?.get('id') ?? searchParams?.get('openacc') ?? undefined;
  const openStory = openId ? visibleStories.find((story) => story.slug === openId) : undefined;

  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);
  const resultsCount = visibleStories.length;
  const displayedStories = visibleStories.slice(0, visibleCount);
  const hasMore = resultsCount > visibleCount;

  useEffect(() => {
    // Wait for auth to settle so account_type/partner attribution on this event is accurate,
    // and log only once — matches LibraryPage's LIBRARY_VIEWED pattern.
    if (!userSettled || viewLogged.current) return;
    viewLogged.current = true;
    logEvent(GROUNDING_VIEWED, { grounding_results_count: resultsCount, ...eventUserData });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSettled, eventUserData]);

  const loadMore = () => {
    const nextVisible = visibleCount + PAGE_SIZE;
    setVisibleCount(nextVisible);
    logEvent(GROUNDING_LOAD_MORE_CLICKED, {
      grounding_results_count: resultsCount,
      grounding_visible_count: Math.min(nextVisible, resultsCount),
      ...eventUserData,
    });
  };

  const heroContent = heroStory?.content as
    | {
        title: string;
        description?: StoryblokRichtext;
        header_image?: { filename: string; alt: string };
      }
    | undefined;

  return (
    <>
      {heroContent && (
        <Header
          title={heroContent.title}
          introduction={heroContent.description}
          imageSrc={heroContent.header_image?.filename}
          translatedImageAlt={heroContent.header_image?.alt}
          cta={!isLoggedIn ? <ScrollToSignUpButton /> : undefined}
        />
      )}

      <Container sx={sectionStyle}>
        {/* Box wrapper, not margin on the Typography directly: the global `p:last-of-type` rule
            (styles/globals.css) zeroes a lone paragraph's own margin-bottom. */}
        <Box sx={resultsCountWrapperStyle}>
          <Typography variant="body2" qa-id="grounding-results-count" sx={resultsCountStyle}>
            {t('grounding.exercisesCount', { count: resultsCount })}
          </Typography>
        </Box>

        <Box sx={gridStyle}>
          {displayedStories.map((story) => {
            const minutes = parseMinutes(story.content.duration);
            return (
              <Card key={story.uuid} sx={cardStyle} qa-id="grounding-card">
                <CardActionArea component={i18nLink} href={`/grounding?id=${story.slug}`}>
                  <Box sx={cardContentStyle}>
                    <Typography variant="h4" component="h3" sx={{ mb: 0 }}>
                      {story.content.name}
                    </Typography>
                    <Typography sx={cardDescriptionStyle}>
                      {toPlainText(story.content.description)}
                    </Typography>
                    {minutes != null && (
                      <>
                        <Divider sx={{ borderColor: 'cardBorder' }} />
                        <Box sx={durationRowStyle}>
                          <AccessTimeRounded sx={{ fontSize: 16 }} />
                          <Typography sx={durationLabelStyle}>
                            {t('grounding.duration', { minutes })}
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                </CardActionArea>
              </Card>
            );
          })}
        </Box>

        {hasMore && (
          <Box sx={loadMoreRowStyle}>
            <Button onClick={loadMore} variant="outlined" color="primary">
              {t('grounding.loadMore')}
            </Button>
          </Box>
        )}
      </Container>

      <SupportSection eventUserData={eventUserData} eventName={GROUNDING_SUPPORT_CARD_CLICKED} />
      {!isLoggedIn && <SignUpSection source="grounding" />}

      {openStory && (
        <GroundingExerciseDialog story={openStory} onClose={() => router.replace('/grounding')} />
      )}
    </>
  );
};
