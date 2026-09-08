'use client';

import LoadingContainer from '@/components/common/LoadingContainer';
import { useContactDialog } from '@/components/contact/ContactDialogProvider';
import { Link as i18nLink } from '@/i18n/routing';
import { useTypedSelector } from '@/lib/hooks/store';
import { getImageSizes } from '@/lib/utils/imageSizes';
import bloomHead from '@/public/illustration_bloom_head.svg';
import { fullScreenContainerStyle } from '@/styles/common';
import { Box, Button, Container, Link, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const imageContainerStyle = {
  position: 'relative',
  width: { xs: 180, md: 260 },
  height: { xs: 180, md: 260 },
  marginInlineStart: { xs: -3, md: -6 },
  marginBottom: 4,
} as const;

export default function NotFoundPage() {
  const t = useTranslations('Shared');
  const tContact = useTranslations('Contact');
  const { open: openContactDialog } = useContactDialog();
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
        href={userId ? '/library' : '/login'}
      >
        {userId
          ? t('notFound.authenticatedRedirectButton')
          : t('notFound.unauthenticatedRedirectButton')}
      </Button>
      <Typography variant="body2" sx={{ mt: 3, color: 'grey.700' }}>
        {tContact.rich('notFoundPrompt', {
          link: (chunks) => (
            <Link
              component="button"
              type="button"
              variant="body2"
              onClick={() => openContactDialog({ type: 'bug', source: 'not_found' })}
            >
              {chunks}
            </Link>
          ),
        })}
      </Typography>
    </Container>
  );
}
