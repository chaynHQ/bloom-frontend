'use client';

import { useContactDialog } from '@/components/contact/ContactDialogProvider';
import { getImageSizes } from '@/lib/utils/imageSizes';
import bloomHead from '@/public/illustration_bloom_head.svg';
import { fullScreenContainerStyle } from '@/styles/common';
import { Box, Button, Container, Typography } from '@mui/material';
import { useRollbar } from '@rollbar/react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect } from 'react';

const imageContainerStyle = {
  position: 'relative',
  width: { xs: 180, md: 260 },
  height: { xs: 180, md: 260 },
  marginInlineStart: { xs: -3, md: -6 },
  marginBottom: 2,
} as const;

const actionsStyle = { display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 3 } as const;

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const rollbar = useRollbar();
  const { open: openContactDialog } = useContactDialog();

  useEffect(() => {
    rollbar.error(error);

    if ((window as any).newrelic) {
      (window as any).newrelic.noticeError(error);
    }
  }, [error, rollbar]);

  const t = useTranslations('Shared');
  const tContact = useTranslations('Contact.shared');

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
      <Typography variant="h1">{t('error.title')}</Typography>
      <Typography>{t('error.description')}</Typography>
      <Box sx={actionsStyle}>
        <Button variant="contained" color="secondary" onClick={() => reset()}>
          {t('error.buttonLabel')}
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() =>
            openContactDialog({
              type: 'bug',
              source: 'error_page',
              prefill: error.digest
                ? { bugContext: `Error reference: ${error.digest}` }
                : undefined,
            })
          }
        >
          {tContact('reportProblemButton')}
        </Button>
      </Box>
    </Container>
  );
}
