'use client';

import { CardCarousel } from '@/components/common/CardCarousel';
import { Link as i18nLink } from '@/i18n/routing';
import { RELATED_CONTENT_CAROUSEL_PAGED } from '@/lib/constants/events';
import { cardShadow } from '@/styles/common';
import { Box, Card, CardActionArea, Divider, Typography } from '@mui/material';
import { ISbStoryData } from '@storyblok/react/rsc';
import { useLocale, useTranslations } from 'next-intl';

const cardStyle = {
  height: '100%',
  borderRadius: '16px',
  boxShadow: cardShadow,
  backgroundColor: 'cardSurface',
  transition: 'box-shadow 150ms ease',
  '&:hover, &:focus-within': { boxShadow: '0 6px 20px rgba(0,0,0,0.12)' },
} as const;

const contentStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 1,
  minHeight: 128,
  p: 2,
} as const;

const badgeStyle = {
  px: 1,
  height: 32,
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: '8px',
  border: '1px solid',
  borderColor: 'chipBackground',
  backgroundColor: 'secondary.light',
  fontFamily: 'headingFontFamily',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: 'grey.700',
} as const;

interface ResourceGroundingSectionProps {
  groundingStories: ISbStoryData[];
}

export const ResourceGroundingSection = ({ groundingStories }: ResourceGroundingSectionProps) => {
  const t = useTranslations('Resources.moment');
  const locale = useLocale();

  // Exercises are not available in German, so that locale gets no "moment" section.
  if (locale === 'de' || groundingStories.length === 0) return null;

  const items = groundingStories.map((story) => ({
    id: story.slug,
    name: story.content.name as string,
    label: t('groundingLabel'),
    href: `/grounding?id=${story.slug}`,
  }));

  return (
    <Box qa-id="resource-moment">
      <Divider sx={{ borderColor: 'sectionBorder', mb: 4 }} />
      {/* Wrapper carries the gap to the cards: the global `p:last-of-type` rule zeroes the
          subtitle's own margin. */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" component="h2" sx={{ mb: 0.5 }}>
          {t('title')}
        </Typography>
        <Typography sx={{ maxWidth: 683, color: 'grey.800' }}>{t('subtitle')}</Typography>
      </Box>
      <CardCarousel
        label={t('title')}
        controls
        eventName={RELATED_CONTENT_CAROUSEL_PAGED}
        slidesPerView={{ xs: 1.1, sm: 2, md: 3 }}
        gap={3}
      >
        {items.map((item) => (
          <Card key={item.id} sx={cardStyle}>
            <CardActionArea component={i18nLink} href={item.href} sx={contentStyle}>
              <Typography variant="h4" component="h3" sx={{ mb: 0 }}>
                {item.name}
              </Typography>
              <Box component="span" sx={badgeStyle}>
                {item.label}
              </Box>
            </CardActionArea>
          </Card>
        ))}
      </CardCarousel>
    </Box>
  );
};
