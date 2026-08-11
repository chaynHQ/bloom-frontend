'use client';

import { Link as i18nLink } from '@/i18n/routing';
import { HOME_HERO_CTA_CLICKED, PROMO_GET_STARTED_CLICKED } from '@/lib/constants/events';
import { getImageSizes } from '@/lib/utils/imageSizes';
import logEvent, { getEventUserData } from '@/lib/utils/logEvent';
import { RichTextOptions } from '@/lib/utils/richText';
import { columnStyle, rowStyle } from '@/styles/common';
import theme from '@/styles/theme';
import { Box, Button, Container, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { render, StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

interface HomeHeaderProps {
  title: string;
  introduction: StoryblokRichtext;
  imageSrc?: string;
  imageAlt?: string;
  translatedImageAlt?: string;
  isLoggedIn: boolean;
  registerPath: string;
  eventUserData: ReturnType<typeof getEventUserData>;
}

const containerStyle = {
  ...columnStyle,
  justifyContent: 'center',
  minHeight: { xs: 240, md: 340 },
  paddingTop: '3.5rem !important',
  paddingBottom: { xs: '3rem !important', md: '4rem !important' },
  background: theme.palette.bloomGradientSoft,
} as const;

const headerRowStyle = {
  ...rowStyle,
  flexDirection: { xs: 'column-reverse', sm: 'row' },
  alignItems: { xs: 'flex-start', sm: 'center' },
  flexWrap: 'nowrap',
  gap: { xs: 3, md: 5 },
} as const;

const textContainerStyle = {
  ...columnStyle,
  alignItems: 'flex-start',
  width: { xs: '100%', sm: 'auto' },
  maxWidth: { xs: '100%', sm: '60%' },
} as const;

const titleStyle = { mb: 2 } as const;

const ctaRowStyle = { display: 'flex', flexWrap: 'wrap', gap: 2, mt: 3 } as const;

const imageContainerStyle = {
  position: 'relative',
  flexShrink: 0,
  alignSelf: { xs: 'center', sm: 'auto' },
  width: { xs: 200, sm: 220, md: 280, lg: 340 },
  height: { xs: 200, sm: 220, md: 280, lg: 340 },
} as const;

export function HomeHeader({
  title,
  introduction,
  imageSrc,
  imageAlt,
  translatedImageAlt,
  isLoggedIn,
  registerPath,
  eventUserData,
}: HomeHeaderProps) {
  const t = useTranslations('Home.hero');
  const tS = useTranslations('Shared');
  const imageAltText = translatedImageAlt ?? (imageAlt ? tS(`alt.${imageAlt}`) : '');

  // The sign-up CTA keeps firing PROMO_GET_STARTED_CLICKED so its funnel stays continuous.
  const logCtaClick = (cta: string, alsoLog?: string) => {
    logEvent(HOME_HERO_CTA_CLICKED, { home_hero_cta: cta, ...eventUserData });
    if (alsoLog) logEvent(alsoLog, eventUserData);
  };

  return (
    <Container sx={containerStyle}>
      <Box sx={headerRowStyle}>
        <Box sx={textContainerStyle}>
          <Typography variant="h1" component="h1" sx={titleStyle}>
            {title}
          </Typography>
          {render(introduction, RichTextOptions)}
          <Box sx={ctaRowStyle}>
            {isLoggedIn ? (
              <>
                <Button
                  qa-id="home-hero-sessions-button"
                  variant="contained"
                  color="error"
                  component={i18nLink}
                  href="/library?type=session"
                  onClick={() => logCtaClick('sessions')}
                >
                  {t('exploreSessionsCta')}
                </Button>
                <Button
                  qa-id="home-hero-courses-button"
                  variant="outlined"
                  color="primary"
                  component={i18nLink}
                  href="/library?type=course"
                  onClick={() => logCtaClick('courses')}
                >
                  {t('goToCoursesCta')}
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
                {t('joinCta')}
              </Button>
            )}
          </Box>
        </Box>
        {imageSrc && (
          <Box sx={imageContainerStyle}>
            <Image
              alt={imageAltText}
              src={imageSrc}
              fill
              priority
              sizes={getImageSizes(imageContainerStyle.width)}
              style={{ objectFit: 'contain' }}
            />
          </Box>
        )}
      </Box>
    </Container>
  );
}
