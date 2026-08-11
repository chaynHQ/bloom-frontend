import { THEME_KEYS, toggle, type ThemeKey } from '@/lib/utils/libraryData';
import { cardShadow, sectionDivider } from '@/styles/common';
import { Box, Card, CardActionArea, Container, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import type { Dispatch, SetStateAction } from 'react';
import { SectionLabel } from './SectionLabel';

const containerStyle = {
  backgroundColor: 'pageBackground',
  ...sectionDivider('bottom'),
  pt: { xs: 4, md: 6 },
  pb: { xs: 4, md: 6 },
} as const;

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: 2,
  mt: 1,
} as const;

const cardStyle = {
  m: 0,
  borderRadius: '8px',
  backgroundColor: 'cardSurface',
  boxShadow: cardShadow,
} as const;

const cardActionAreaStyle = {
  p: 1.5,
  height: '100%',
  // CardActionArea centres its content; the cards in a row are equal height, so the text is
  // pinned to the top instead to keep the labels level.
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'flex-start',
  backgroundColor: 'cardSurface',
  borderRadius: '8px',
  // Transparent when inactive, so selecting a theme never shifts the layout.
  border: '2px solid',
  '&:hover': { backgroundColor: 'common.white' },
} as const;

// Title/Small Emphasized.
const cardLabelStyle = {
  fontFamily: 'headingFontFamily',
  fontSize: '0.875rem',
  fontWeight: 600,
  letterSpacing: '0.1px',
  color: 'common.black',
  mb: 0.5,
} as const;

// The "Explore by theme" section above the results.
export function ThemeCards({
  themes,
  setThemes,
}: {
  themes: ThemeKey[];
  setThemes: Dispatch<SetStateAction<ThemeKey[]>>;
}) {
  const t = useTranslations('Library');

  return (
    <Container sx={containerStyle}>
      <SectionLabel
        label={t('exploreByTheme')}
        onReset={themes.length ? () => setThemes([]) : undefined}
      />
      <Box sx={gridStyle}>
        {THEME_KEYS.map((theme) => {
          const active = themes.includes(theme);
          return (
            <Card key={theme} sx={cardStyle}>
              <CardActionArea
                onClick={() => setThemes((p) => toggle(p, theme))}
                aria-pressed={active}
                qa-id={`library-theme-${theme}`}
                sx={{
                  ...cardActionAreaStyle,
                  borderColor: active ? 'primary.dark' : 'transparent',
                }}
              >
                <Typography sx={cardLabelStyle}>{t(`themes.${theme}.label`)}</Typography>
                <Typography variant="body2" sx={{ color: 'grey.800' }}>
                  {t(`themes.${theme}.blurb`)}
                </Typography>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>
    </Container>
  );
}
