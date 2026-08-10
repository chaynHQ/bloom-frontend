import { THEME_KEYS, toggle, type ThemeKey } from '@/lib/utils/libraryData';
import { cardShadow } from '@/styles/common';
import { Box, Card, CardActionArea, Container, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import type { Dispatch, SetStateAction } from 'react';
import { SectionLabel } from './SectionLabel';

const containerStyle = {
  backgroundColor: 'pageBackground',
  borderBottom: '1px solid',
  borderColor: 'cardBorder',
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
  backgroundColor: 'cardSurface',
  borderRadius: '8px',
  // Transparent when inactive, so selecting a theme never shifts the layout.
  border: '2px solid',
  '&:hover': { backgroundColor: 'common.white' },
} as const;

const cardLabelStyle = {
  fontFamily: 'headingFontFamily',
  fontSize: '0.875rem',
  fontWeight: 600,
  mb: 0.5,
} as const;

// The "Explore by theme" band above the results.
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
                <Typography variant="body2" sx={{ color: 'grey.700' }}>
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
