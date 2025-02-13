'use client';

import LoadingContainer from '@/components/common/LoadingContainer';
import { Link as i18nLink } from '@/i18n/routing';
import { useTypedSelector } from '@/lib/hooks/store';
import { getImageSizes } from '@/lib/utils/imageSizes';
import bloomHead from '@/public/illustration_bloom_head.svg';
import { fullScreenContainerStyle } from '@/styles/common';
import { Box, Button, Container, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const imageContainerStyle = {
  position: 'relative',
  width: { xs: 180, md: 260 },
  height: { xs: 180, md: 260 },
  marginLeft: { xs: -3, md: -6 },
  marginBottom: 4,
} as const;

export default function NotFoundPage() {
  const t = useTranslations('Shared');
  const userId = useTypedSelector((state) => state.user.id);
  const userLoading = useTypedSelector((state) => state.user.loading);

  if (userLoading) {
    return <LoadingContainer />;
  }

  return (
    <Container sx={fullScreenContainerStyle}>
      <Box sx={imageContainerStyle}>
        <Image
          alt={t('alt.bloomLogo')}
          src={bloomHead}
          fill
          sizes={getImageSizes(imageContainerStyle.width)}
        />
      </Box>
      <Typography variant="h1" component="h1">
        {t('notFound.title')}
      </Typography>
      <Typography>
        {userId ? t('notFound.authenticatedDescription') : t('notFound.unauthenticatedDescription')}
      </Typography>
      <Button
        sx={{ mt: 3 }}
        variant="contained"
        color="secondary"
        component={i18nLink}
        href={userId ? '/courses' : '/login'}
      >
        {userId
          ? t('notFound.authenticatedRedirectButton')
          : t('notFound.unauthenticatedRedirectButton')}
      </Button>
    </Container>
  );
}
