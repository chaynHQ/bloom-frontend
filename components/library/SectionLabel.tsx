import { Box, Button, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import { HEADING_FONT } from './libraryTokens';

// A section/sidebar label with an optional "Reset" action on the trailing edge — used by both
// "Explore by theme" and "Filter the library".
export function SectionLabel({ label, onReset }: { label: string; onReset?: () => void }) {
  const t = useTranslations('Library');
  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 24 }}
    >
      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'grey.800' }}>
        {label}
      </Typography>
      {onReset && (
        <Button
          onClick={onReset}
          size="small"
          sx={{
            minWidth: 0,
            p: 0,
            fontFamily: HEADING_FONT,
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'primary.dark',
            '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
          }}
        >
          {t('reset')}
        </Button>
      )}
    </Box>
  );
}
