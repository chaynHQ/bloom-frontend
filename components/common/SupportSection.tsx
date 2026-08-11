'use client';

import { LinkCard } from '@/components/common/LinkCard';
import logEvent, { getEventUserData } from '@/lib/utils/logEvent';
import chatIcon from '@/public/chat_icon.svg';
import notesFromBloomIcon from '@/public/notes_from_bloom_icon.svg';
import theme from '@/styles/theme';
import { Box, Container, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import type { StaticImageData } from 'next/image';

const SUPPORT_CARDS: { key: string; href: string; icon: StaticImageData }[] = [
  { key: 'messaging', href: '/messaging', icon: chatIcon },
  { key: 'notes', href: '/subscription/whatsapp', icon: notesFromBloomIcon },
];

const containerStyle = {
  background: theme.palette.bloomGradientSoft,
  pt: { xs: 8, md: 13 },
  pb: { xs: 8, md: 13 },
} as const;

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
  gap: 2.5,
  mt: 3,
} as const;

// The "Get support" section, closing both the library and the home page.
export function SupportSection({
  eventUserData,
  eventName,
}: {
  eventUserData: ReturnType<typeof getEventUserData>;
  eventName: string;
}) {
  const t = useTranslations('Shared.supportSection');

  return (
    <Container qa-id="support-section" sx={containerStyle}>
      <Typography variant="h2" sx={{ mb: 1 }}>
        {t('title')}
      </Typography>
      <Typography sx={{ color: 'grey.800' }}>{t('introduction')}</Typography>
      <Box sx={gridStyle}>
        {SUPPORT_CARDS.map(({ key, href, icon }) => (
          <LinkCard
            key={key}
            title={t(`${key}.title`)}
            description={t(`${key}.description`)}
            iconSrc={icon}
            href={href}
            size="large"
            background="panelSurface"
            arrowColor="supportArrowPanel"
            qaId={`support-card-${key}`}
            onSelect={() => logEvent(eventName, { support_card: key, ...eventUserData })}
          />
        ))}
      </Box>
    </Container>
  );
}
