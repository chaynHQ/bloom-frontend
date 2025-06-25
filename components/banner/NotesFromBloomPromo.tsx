import { STORYBLOK_COLORS } from '@/lib/constants/enums';
import { NOTES_FROM_BLOOM_PROMO_CLICKED } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { getImageSizes } from '@/lib/utils/imageSizes';
import logEvent, { getEventUserData } from '@/lib/utils/logEvent';
import NotesIcon from '@/public/illustration_notes.svg';
import theme from '@/styles/theme';
import Box from '@mui/material/Box';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Button from '../common/Button';

const NotesFromBloomPromo = () => {
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);

  // add tracking for this component
  const t = useTranslations('Shared.notesFromBloomPromo');
  const tN = useTranslations('Navigation');
  return (
    <Box
      padding={['20px 30px', '30px 30px']}
      width="100%"
      display={'flex'}
      justifyContent="center"
      sx={{ overflow: 'hidden', background: theme.palette.bloomGradientVertical }} // This will clip overflowing content
    >
      <Box
        maxWidth={[600, 600, 750]}
        width="100%"
        gap={2}
        display="flex"
        justifyContent="space-between"
        alignItems="left"
      >
        <Box flex="1" height={[100, 100, 50]} position="relative" display="flex">
          <Box
            height={[200, 225, 200]}
            width={[200, 225, 200]}
            position="absolute"
            bottom={[-125, -125, -100]}
            left={[-100, -100, -75]}
            zIndex={1}
          >
            <Image alt={tN('alt.notesIcon')} src={NotesIcon} sizes={getImageSizes(100)} fill />
          </Box>
        </Box>
        <Box
          flex="3"
          zIndex={2}
          display="flex"
          flexDirection="column"
          alignContent="right"
          justifyContent={'right'}
        >
          <Box component="h2" fontSize={theme.typography.body1.fontSize} mb={0.5} mt={0}>
            {t('title')}
          </Box>
          <Box component="p" mb={2} lineHeight={1.5}>
            {t('description')}
          </Box>
          <Box display={['flex', 'flex', 'none']} justifyContent="flex-end">
            <Button
              link="/subscribe/whatsapp"
              color={STORYBLOK_COLORS.PRIMARY_DARK}
              text={t('buttonText')}
              size="medium"
              style={{ marginBottom: 0, marginTop: 1.5 }}
              clickHandler={() => {
                logEvent(NOTES_FROM_BLOOM_PROMO_CLICKED, eventUserData);
              }}
            />
          </Box>
        </Box>
        <Box display={['none', 'none', 'flex']} justifyContent="flex-end">
          <Button
            link="/subscribe/whatsapp"
            color={STORYBLOK_COLORS.PRIMARY_DARK}
            text={t('buttonText')}
            size="small"
            clickHandler={() => {
              logEvent(NOTES_FROM_BLOOM_PROMO_CLICKED, eventUserData);
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default NotesFromBloomPromo;
