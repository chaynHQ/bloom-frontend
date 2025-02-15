'use client';

import { TextNode } from '@/lib/types/types';
import { getImageSizes } from '@/lib/utils/imageSizes';
import illustrationPerson4Peach from '@/public/illustration_person4_peach.svg';
import { fullScreenContainerStyle } from '@/styles/common';
import { Box, Container, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const imageContainerStyle = {
  position: 'relative',
  width: { xs: 150, md: 210 },
  height: { xs: 150, md: 210 },
  marginBottom: 4,
} as const;

interface ContentUnavailableProps {
  title: string;
  message: TextNode;
}

export const ContentUnavailable = ({ title, message }: ContentUnavailableProps) => {
  const t = useTranslations('Shared');

  return (
    <Container sx={fullScreenContainerStyle}>
      <Box sx={imageContainerStyle}>
        <Image
          alt={t('alt.personTea')}
          src={illustrationPerson4Peach}
          fill
          sizes={getImageSizes(imageContainerStyle.width)}
          style={{
            objectFit: 'contain',
          }}
        />
      </Box>
      <Typography variant="h2" component="h2" mb={2}>
        {title}
      </Typography>
      <Typography mb={2}>{message}</Typography>
    </Container>
  );
};
