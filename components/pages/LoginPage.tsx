'use client';

import LoginForm from '@/components/forms/LoginForm';
import { useRouter } from '@/i18n/routing';
import { useTypedSelector } from '@/lib/hooks/store';
import illustrationLeafMix from '@/public/illustration_leaf_mix.svg';
import theme from '@/styles/theme';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { Box, Card, CardContent, IconButton, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import UserResearchBanner from '../banner/UserResearchBanner';
import SetupMFA from '../guards/SetupMFA';

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
  paddingTop: { xs: '0', md: '6.5rem ' },
  paddingY: '2rem',
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
  maxWidth: 400,
};

const backButtonStyle = {
  display: { md: 'none' },
  width: '2.5rem',
  marginLeft: '-0.675rem',
  marginY: { xs: 1.5, sm: 2 },
  paddingRight: '1rem',
  alignSelf: 'start',
} as const;

const backIconStyle = {
  height: '1.75rem',
  width: '1.75rem',
  color: 'primary.dark',
} as const;

export default function LoginPage() {
  const t = useTranslations('Auth');
  const tS = useTranslations('Shared');
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = useTypedSelector((state) => state.user.id);
  const userIsSuperAdmin = useTypedSelector((state) => state.user.isSuperAdmin);
  const userMFAisSetup = useTypedSelector((state) => state.user.MFAisSetup);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);

  const [showSetupMFA, setShowSetupMFA] = useState(false);

  const headerProps = {
    imageSrc: illustrationLeafMix,
    imageAlt: 'alt.leafMix',
  };

  useEffect(() => {
    if (!userId) {
      if (showSetupMFA) {
        setShowSetupMFA(false);
      }
      return;
    }

    // Check if superadmin and complete extra 2FA/MFA steps
    if (userIsSuperAdmin && !userMFAisSetup) {
      setShowSetupMFA(true);
      return;
    }

    // Redirect if the user if login process is complete and userId loaded
    const returnUrl = searchParams?.get('return_url');

    if (partnerAdmin?.active) {
      router.push('/partner-admin/create-access-code');
    } else if (!!returnUrl) {
      router.push(returnUrl);
    } else {
      router.push('/courses');
    }
  }, [
    userId,
    partnerAdmin?.active,
    router,
    searchParams,
    showSetupMFA,
    userIsSuperAdmin,
    userMFAisSetup,
  ]);

  return (
    <Box>
      <Head>
        <title>{`${t('login.title')} • Bloom`}</title>
      </Head>
      <Box sx={headerContainerStyle}>
        <UserResearchBanner />
        <IconButton
          sx={backButtonStyle}
          onClick={() => router.back()}
          aria-label={tS('navigateBack')}
        >
          <KeyboardArrowLeftIcon sx={backIconStyle} />
        </IconButton>
        <Box sx={headerContentStyle}>
          <Box>
            <Typography variant="h1" component="h1" marginBottom={0}>
              {t('login.title')}
            </Typography>
          </Box>
          <Card style={{ marginTop: 0, maxWidth: 400 }}>
            <CardContent>{showSetupMFA ? <SetupMFA /> : <LoginForm />}</CardContent>
          </Card>
          <Box sx={imageContainerStyle}>
            <Image
              src={headerProps.imageSrc}
              alt={headerProps.imageAlt}
              fill
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
