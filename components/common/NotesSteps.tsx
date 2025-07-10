'use client';

import { getImageSizes } from '@/lib/utils/imageSizes';
import { columnStyle } from '@/styles/common';
import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ReactNode } from 'react';

const stepsContainerStyle = {
  ...columnStyle,
  gap: { xs: 4, sm: 5 },
  flex: 1,
  maxWidth: 350,
} as const;

const stepContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: { xs: 2, md: 3 },
  mx: { xs: 1, sm: 0 },
} as const;

const stepIconContainerStyle = {
  width: { xs: 60, md: 80 },
  height: { xs: 60, md: 80 },
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  position: 'relative',
} as const;

interface StepProps {
  icon: string;
  iconAlt: string;
  children: ReactNode;
  indent?: boolean;
}

const Step = ({ icon, iconAlt, children, indent = false }: StepProps) => {
  const tS = useTranslations('Shared');

  return (
    <Box sx={{ ...stepContainerStyle, marginLeft: indent ? { xs: 4, sm: 3, md: 5 } : 0 }}>
      <Box sx={stepIconContainerStyle}>
        <Image
          alt={tS(iconAlt)}
          src={icon}
          fill
          sizes={getImageSizes(stepIconContainerStyle.width)}
          style={{ objectFit: 'contain' }}
        />
      </Box>
      <Typography>{children}</Typography>
    </Box>
  );
};

const NotesSteps = () => {
  const t = useTranslations('Whatsapp.notes');

  return (
    <Box sx={stepsContainerStyle}>
      <Step icon="/illustration_notes_green.svg" iconAlt="alt.notes" indent>
        {t('step1')}
      </Step>

      <Step icon="/illustration_date_selector.svg" iconAlt="alt.dateSelector">
        {t('step2')}
      </Step>

      <Step icon="/illustration_choose_therapist.svg" iconAlt="alt.chooseTherapist" indent>
        {t('step3')}
      </Step>

      <Step icon="/illustration_change.svg" iconAlt="alt.change">
        {t('step4')}
      </Step>
    </Box>
  );
};

export default NotesSteps;
