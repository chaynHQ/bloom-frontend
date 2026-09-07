'use client';

import { BackLink } from '@/components/common/BackLink';
import LoginForm from '@/components/forms/LoginForm';
import { useRouter } from '@/i18n/routing';
import { getImageSizes } from '@/lib/utils/imageSizes';
import illustrationLeafMix from '@/public/illustration_leaf_mix.svg';
import { pageHeaderPaddingTop, pageHeaderPaddingTopMobile } from '@/styles/common';
import theme from '@/styles/theme';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import Image from 'next/image';

const imageContainerStyle = {
  position: 'relative',
  width: { xs: 100, md: 120 },
  height: { xs: 80, md: 100 },
} as const;

const headerContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  paddingBottom: { xs: '2.5rem !important', md: '5rem !important' },
  paddingTop: { xs: pageHeaderPaddingTopMobile, md: pageHeaderPaddingTop },
  paddingX: '2rem',
  background: {
    xs: theme.palette.bloomGradient,
    md: theme.palette.bloomGradient,
  },
};
const headerContentStyle = {
  alignContent: 'flex-center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 3,
  width: '100%',
};

export default function LoginPage() {
  const t = useTranslations('Auth');
  const tS = useTranslations('Shared');
  const router = useRouter();

  const headerProps = {
    imageSrc: illustrationLeafMix,
    imageAlt: 'alt.leafMix',
  };

  return (
    <Box>
      <Head>
        <title>{`${t('login.title')} • Bloom`}</title>
      </Head>
      <Box sx={headerContainerStyle}>
        <BackLink label={tS('back')} onSelect={() => router.back()} inlineOnDesktop={false} />
        <Box sx={headerContentStyle}>
          <Box
            sx={{
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h1"
              component="h1"
              sx={{
                marginBottom: 0,
              }}
            >
              {t('login.title')}
            </Typography>
          </Box>
          <Card style={{ marginTop: 0, maxWidth: 420 }}>
            <CardContent>
              <LoginForm />
            </CardContent>
          </Card>
          <Box sx={imageContainerStyle}>
            <Image
              src={headerProps.imageSrc}
              alt={headerProps.imageAlt}
              fill
              sizes={getImageSizes(imageContainerStyle.width)}
              style={{
                objectFit: 'contain',
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
