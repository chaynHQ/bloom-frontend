import { Link as i18nLink } from '@/i18n/routing';
import { LIBRARY_SUPPORT_CARD_CLICKED } from '@/lib/constants/events';
import logEvent, { getEventUserData } from '@/lib/utils/logEvent';
import chatIcon from '@/public/chat_icon.svg';
import notesFromBloomIcon from '@/public/notes_from_bloom_icon.svg';
import { cardShadow } from '@/styles/common';
import theme from '@/styles/theme';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import { Box, Card, CardActionArea, Container, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image, { type StaticImageData } from 'next/image';

const containerStyle = {
  background: theme.palette.bloomGradientSoft,
  pt: { xs: 7, md: 13 },
  pb: { xs: 7, md: 13 },
} as const;

const headingStyle = { fontSize: { xs: '1.5rem', md: '1.75rem' }, fontWeight: 500, mb: 1 } as const;

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
  gap: 3,
  mt: 2,
} as const;

const cardStyle = {
  m: 0,
  borderRadius: '16px',
  boxShadow: cardShadow,
  overflow: 'hidden',
} as const;

const cardActionAreaStyle = {
  p: 0,
  display: 'flex',
  alignItems: 'stretch',
  minHeight: { xs: 132, md: 180 },
  backgroundColor: 'panelSurface',
  '&:hover': { backgroundColor: 'common.white' },
} as const;

const cardBodyStyle = {
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: 0.75,
  p: 2,
} as const;

const cardTitleRowStyle = { display: 'flex', alignItems: 'center', gap: 1 } as const;

const cardTitleStyle = {
  fontFamily: 'headingFontFamily',
  fontSize: '1.125rem',
  fontWeight: 500,
  letterSpacing: '0.15px',
} as const;

const arrowPanelStyle = {
  flexShrink: 0,
  width: 72,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'supportArrowPanel',
} as const;

function SupportCard({
  title,
  description,
  iconSrc,
  href,
  onSelect,
}: {
  title: string;
  description: string;
  iconSrc: StaticImageData;
  href: string;
  onSelect: () => void;
}) {
  return (
    <Card sx={cardStyle}>
      <CardActionArea
        component={i18nLink}
        href={href}
        aria-label={title}
        onClick={onSelect}
        sx={cardActionAreaStyle}
      >
        <Box sx={cardBodyStyle}>
          <Box sx={cardTitleRowStyle}>
            <Image src={iconSrc} alt="" width={44} height={44} style={{ objectFit: 'contain' }} />
            <Typography sx={cardTitleStyle}>{title}</Typography>
          </Box>
          <Typography variant="body2" sx={{ color: 'grey.800' }}>
            {description}
          </Typography>
        </Box>
        <Box sx={arrowPanelStyle}>
          <ArrowForwardRounded sx={{ color: 'grey.700' }} />
        </Box>
      </CardActionArea>
    </Card>
  );
}

// The "Get support" band closing the library.
export function SupportBand({
  eventUserData,
}: {
  eventUserData: ReturnType<typeof getEventUserData>;
}) {
  const t = useTranslations('Library');

  const logCardClick = (card: string) =>
    logEvent(LIBRARY_SUPPORT_CARD_CLICKED, { library_support_card: card, ...eventUserData });

  return (
    <Container sx={containerStyle}>
      <Typography variant="h2" sx={headingStyle}>
        {t('support.title')}
      </Typography>
      <Typography sx={{ color: 'grey.800' }}>{t('support.introduction')}</Typography>
      <Box sx={gridStyle}>
        <SupportCard
          iconSrc={chatIcon}
          title={t('support.messaging.title')}
          description={t('support.messaging.description')}
          href="/messaging"
          onSelect={() => logCardClick('messaging')}
        />
        <SupportCard
          iconSrc={notesFromBloomIcon}
          title={t('support.notes.title')}
          description={t('support.notes.description')}
          href="/subscription/whatsapp"
          onSelect={() => logCardClick('notes')}
        />
      </Box>
    </Container>
  );
}
