'use client';

import { Link as i18nLink } from '@/i18n/routing';
import { TextNode } from '@/lib/types/types';
import { getImageSizes } from '@/lib/utils/imageSizes';
import illustrationPerson4Peach from '@/public/illustration_person4_peach.svg';
import { fullScreenContainerStyle } from '@/styles/common';
import { Box, Container, Link, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const imageContainerStyle = {
  position: 'relative',
  width: { xs: 150, md: 210 },
  height: { xs: 150, md: 210 },
  marginBottom: 4,
} as const;

interface ContentUnavailableProps {
  title?: string;
  message?: TextNode;
  // 'language': the content exists, just not in the viewer's language (yet).
  reason?: 'access' | 'language';
}

export const ContentUnavailable = ({
  title,
  message,
  reason = 'access',
}: ContentUnavailableProps) => {
  const t = useTranslations(
    reason === 'language' ? 'Resources.languageUnavailable' : 'Courses.accessGuard',
  );
  const tS = useTranslations('Shared');

  return (
    <Container sx={fullScreenContainerStyle}>
      <Box sx={imageContainerStyle}>
        <Image
          alt={tS('alt.personTea')}
          src={illustrationPerson4Peach}
          fill
          sizes={getImageSizes(imageContainerStyle.width)}
          style={{
            objectFit: 'contain',
          }}
        />
      </Box>
      <Typography
        variant="h2"
        component="h2"
        sx={{
          mb: 2,
        }}
      >
        {title || t('title')}
      </Typography>
      <Typography
        sx={{
          mb: 2,
        }}
      >
        {message ||
          t.rich('introduction', {
            contactLink: (children) => (
              <Link component={i18nLink} href="/library">
                {children}
              </Link>
            ),
          })}
      </Typography>
    </Container>
  );
};
