import { STORYBLOK_COLORS } from '@/lib/constants/enums';
import { NOTES_FROM_BLOOM_PROMO_CLICKED } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { getImageSizes } from '@/lib/utils/imageSizes';
import logEvent, { getEventUserData } from '@/lib/utils/logEvent';
import NotesIcon from '@/public/illustration_notes.svg';
import theme from '@/styles/theme';
import { Box, Container, Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Button from '../common/Button';

const containerStyle = {
  background: theme.palette.bloomGradientVertical,
  paddingTop: { xs: '2.5rem !important', md: '3.5rem !important' },
  paddingBottom: { xs: '2.5rem !important', md: '3.5rem !important' },
} as const;

const rowStyle = {
  flexDirection: { xs: 'column', md: 'row' },
  alignItems: 'center',
  justifyContent: 'center',
  gap: { xs: 3, md: 8 },
} as const;

const contentStyle = {
  flexDirection: { xs: 'column', md: 'row' },
  alignItems: 'center',
  gap: { xs: 2, md: 4 },
} as const;

const imageContainerStyle = {
  position: 'relative',
  flexShrink: 0,
  width: { xs: 120, md: 140 },
  height: { xs: 120, md: 140 },
} as const;

const textContainerStyle = {
  textAlign: { xs: 'center', md: 'start' },
} as const;

const NotesFromBloomPromo = () => {
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);

  const t = useTranslations('Shared.notesFromBloomPromo');
  const tN = useTranslations('Navigation');

  return (
    <Container sx={containerStyle}>
      <Stack sx={rowStyle}>
        <Stack sx={contentStyle}>
          <Box sx={imageContainerStyle}>
            <Image alt={tN('alt.notesIcon')} src={NotesIcon} sizes={getImageSizes(140)} fill />
          </Box>
          <Box sx={textContainerStyle}>
            <Typography variant="h3" component="h2" sx={{ mb: 1 }}>
              {t('title')}
            </Typography>
            <Typography sx={{ mb: 0 }}>{t('description')}</Typography>
          </Box>
        </Stack>
        <Button
          link="/subscription/whatsapp"
          color={STORYBLOK_COLORS.PRIMARY_DARK}
          text={t('buttonText')}
          size="medium"
          style={{ marginTop: 0, marginBottom: 0, flexShrink: 0 }}
          clickHandler={() => {
            logEvent(NOTES_FROM_BLOOM_PROMO_CLICKED, eventUserData);
          }}
        />
      </Stack>
    </Container>
  );
};

export default NotesFromBloomPromo;
