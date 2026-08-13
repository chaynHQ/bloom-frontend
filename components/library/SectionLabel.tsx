import { Box, Button, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

const containerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  minHeight: 24,
} as const;

const labelStyle = { fontWeight: 600, fontSize: '0.875rem', color: 'grey.800' } as const;

const resetButtonStyle = {
  minWidth: 0,
  p: 0,
  fontFamily: 'headingFontFamily',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: 'primary.dark',
  '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
} as const;

export function SectionLabel({ label, onReset }: { label: string; onReset?: () => void }) {
  const t = useTranslations('Library');
  return (
    <Box sx={containerStyle}>
      <Typography sx={labelStyle}>{label}</Typography>
      {onReset && (
        <Button onClick={onReset} size="small" sx={resetButtonStyle}>
          {t('reset')}
        </Button>
      )}
    </Box>
  );
}
