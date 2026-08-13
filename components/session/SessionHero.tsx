'use client';

import ProgressStatus from '@/components/common/ProgressStatus';
import { PROGRESS_STATUS } from '@/lib/constants/enums';
import { getImageSizes } from '@/lib/utils/imageSizes';
import illustrationPerson4Peach from '@/public/illustration_person4_peach.svg';
import { Box, Divider, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 3,
} as const;

const imageStyle = {
  position: 'relative',
  flexShrink: 0,
  width: { xs: 100, md: 134 },
  height: { xs: 100, md: 134 },
} as const;

interface SessionHeroProps {
  name: string;
  sessionProgress: PROGRESS_STATUS;
}

export const SessionHero = ({ name, sessionProgress }: SessionHeroProps) => {
  const t = useTranslations('Courses');
  const tS = useTranslations('Shared');

  return (
    <Box qa-id="session-hero">
      <Box sx={rowStyle}>
        <Box>
          <Typography variant="body2" sx={{ color: 'grey.700' }}>
            {t('sessionDetail.currentSession')}
          </Typography>
          <Typography variant="h1" component="h1" sx={{ mb: 0 }}>
            {name}
          </Typography>
          {sessionProgress !== PROGRESS_STATUS.NOT_STARTED && (
            <Box sx={{ mt: 2 }}>
              <ProgressStatus status={sessionProgress} />
            </Box>
          )}
        </Box>
        <Box sx={imageStyle}>
          <Image
            alt={tS('alt.personTea')}
            src={illustrationPerson4Peach}
            fill
            priority
            sizes={getImageSizes(imageStyle.width)}
            style={{ objectFit: 'contain' }}
          />
        </Box>
      </Box>
      <Divider sx={{ mt: 3, borderColor: 'sectionBorder' }} />
    </Box>
  );
};
