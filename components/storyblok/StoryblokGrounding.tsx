'use client';

import { ScrollReveal } from '@/components/common/ScrollReveal';
import SignUpButton from '@/components/common/SignUpButton';
import { SignUpSection } from '@/components/common/SignUpSection';
import { SupportSection } from '@/components/common/SupportSection';
import Header from '@/components/layout/Header';
import { GroundingExerciseDialog } from '@/components/resources/GroundingExerciseDialog';
import { Link as i18nLink, useRouter } from '@/i18n/routing';
import {
  GROUNDING_EXERCISE_CLICKED,
  GROUNDING_LOAD_MORE_CLICKED,
  GROUNDING_SUPPORT_CARD_CLICKED,
  GROUNDING_VIEWED,
} from '@/lib/constants/events';
import { useLogEventOnce } from '@/lib/hooks/useLogEventOnce';
import { useTypedSelector } from '@/lib/hooks/store';
import { useUserAuthStatus } from '@/lib/hooks/useUserAuthStatus';
import { useUserContentPartners } from '@/lib/hooks/useUserContentPartners';
import { parseMinutes, toPlainText } from '@/lib/utils/libraryData';
import logEvent, { getEventUserData } from '@/lib/utils/logEvent';
import { filterStoriesForLocaleAndPartnerAccess } from '@/lib/utils/partnerContentAccess';
import { interactiveCardStyle } from '@/styles/common';
import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded';
import { Box, Button, Card, CardActionArea, Container, Divider, Typography } from '@mui/material';
import { useStoryblokState } from '@storyblok/react';
import { ISbStoryData, storyblokEditable } from '@storyblok/react/rsc';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

// Matches LibraryPage's card-grid page size, sized to fill whole rows of this grid's 3 columns.
const PAGE_SIZE = 9;

// A tinted section background so the `cardSurface` cards have something to contrast against;
// the page's default background is too close to the card colour.
const sectionStyle = { backgroundColor: 'pageBackground', py: { xs: 4, md: 6 } } as const;

const resultsCountWrapperStyle = { mb: 3 } as const;

const resultsCountStyle = { textAlign: 'end', color: 'grey.700', mb: 0 } as const;

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
  gap: 3,
} as const;

const cardStyle = {
  ...interactiveCardStyle,
  // The theme's global MuiCard override adds a 20px top margin below `md` (for cards stacked
  // outside a grid); it just doubles up with this grid's own `gap` here.
  mt: 0,
  borderRadius: '16px',
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

const durationRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
  color: 'grey.800',
} as const;

const durationLabelStyle = {
  fontFamily: 'headingFontFamily',
  fontSize: '0.875rem',
  fontWeight: 500,
} as const;

const loadMoreRowStyle = { display: 'flex', justifyContent: 'center', mt: 4 } as const;

interface GroundingPageContent {
  _uid?: string;
  _editable?: string;
  title?: string;
  description?: StoryblokRichtext;
  seo_description?: string;
  header_image?: { filename: string; alt: string };
}

interface StoryblokGroundingProps {
  // The `grounding_page` story — hero copy + SEO. `stories` is the list of `resource_grounding`
  // exercise stories, fetched server-side by the /grounding route.
  story: ISbStoryData;
  stories: ISbStoryData[];
}

const StoryblokGrounding = ({ story: initialStory, stories = [] }: StoryblokGroundingProps) => {
  const story = useStoryblokState(initialStory) ?? initialStory;
  const t = useTranslations('Resources');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const userContentPartners = useUserContentPartners();
  const userAuthStatus = useUserAuthStatus();
  const isLoggedIn = userAuthStatus === 'signedIn';
  // Signed-in users briefly look anonymous while getUser is in flight; wait for that so the
  // GROUNDING_VIEWED event below carries accurate partner/account attribution.
  const userSettled = userAuthStatus !== 'resolving';
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { _uid, _editable, title, description, seo_description, header_image } = (story?.content ??
    {}) as GroundingPageContent;

  const visibleStories = useMemo(
    // Grounding has no gating, unlike partner-curated resources — 'public' always applies here,
    // regardless of the visitor's own partner, or a partner user's cards vanish once auth resolves.
    () =>
      filterStoriesForLocaleAndPartnerAccess(stories, locale, [...userContentPartners, 'public']),
    [stories, locale, userContentPartners],
  );

  const openId = searchParams?.get('id') ?? searchParams?.get('openacc') ?? undefined;
  const openStory = openId ? visibleStories.find((story) => story.slug === openId) : undefined;

  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);
  const resultsCount = visibleStories.length;
  const displayedStories = visibleStories.slice(0, visibleCount);
  const hasMore = resultsCount > visibleCount;

  // Wait for auth to settle so account_type/partner attribution on this event is accurate.
  useLogEventOnce(
    GROUNDING_VIEWED,
    { grounding_results_count: resultsCount, grounding_logged_in: isLoggedIn, ...eventUserData },
    userSettled,
  );

  // Last slug opened from a card, to tell card-opens from deep-link opens.
  const [cardOpenedSlug, setCardOpenedSlug] = useState<string | undefined>(undefined);

  const logExerciseClick = (exerciseStory: ISbStoryData, index: number) => {
    setCardOpenedSlug(exerciseStory.slug);
    logEvent(GROUNDING_EXERCISE_CLICKED, {
      grounding_context: 'grounding_page',
      grounding_exercise_name: exerciseStory.content.name,
      grounding_exercise_storyblok_uuid: exerciseStory.uuid,
      grounding_exercise_position: index + 1,
      grounding_results_count: resultsCount,
      ...eventUserData,
    });
  };

  const loadMore = () => {
    const nextVisible = visibleCount + PAGE_SIZE;
    setVisibleCount(nextVisible);
    logEvent(GROUNDING_LOAD_MORE_CLICKED, {
      grounding_results_count: resultsCount,
      grounding_visible_count: Math.min(nextVisible, resultsCount),
      ...eventUserData,
    });
  };

  return (
    <Box
      {...storyblokEditable({ _uid, _editable, title, description, seo_description, header_image })}
    >
      {title && (
        <Header
          title={title}
          introduction={description}
          imageSrc={header_image?.filename}
          translatedImageAlt={header_image?.alt}
          cta={!isLoggedIn ? <SignUpButton source="grounding" /> : undefined}
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
          {displayedStories.map((exerciseStory, index) => {
            const minutes = parseMinutes(exerciseStory.content.duration);
            return (
              <ScrollReveal fill key={exerciseStory.uuid} delay={(index % PAGE_SIZE) * 15}>
                <Card sx={cardStyle} qa-id="grounding-card">
                  <CardActionArea
                    component={i18nLink}
                    href={`/grounding?id=${exerciseStory.slug}`}
                    onClick={() => logExerciseClick(exerciseStory, index)}
                  >
                    <Box sx={cardContentStyle}>
                      <Typography variant="h4" component="h3" sx={{ mb: 0 }}>
                        {exerciseStory.content.name}
                      </Typography>
                      <Typography sx={cardDescriptionStyle}>
                        {toPlainText(exerciseStory.content.description)}
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
              </ScrollReveal>
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
        <GroundingExerciseDialog
          story={openStory}
          openMethod={cardOpenedSlug === openStory.slug ? 'card' : 'deep_link'}
          onClose={() => router.replace('/grounding')}
        />
      )}
    </Box>
  );
};

export default StoryblokGrounding;
