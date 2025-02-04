'use client';

import LoginForm from '@/components/forms/LoginForm';
import PartnerHeader from '@/components/layout/PartnerHeader';
import { Link as i18nLink, useRouter } from '@/i18n/routing';
import {
  GET_STARTED_WITH_BLOOM_CLICKED,
  RESET_PASSWORD_HERE_CLICKED,
  generateGetStartedPartnerEvent,
} from '@/lib/constants/events';
import { getAllPartnersContent } from '@/lib/constants/partners';
import { useTypedSelector } from '@/lib/hooks/store';
import { getImageSizes } from '@/lib/utils/imageSizes';
import logEvent from '@/lib/utils/logEvent';
import illustrationBloomHeadYellow from '@/public/illustration_bloom_head_yellow.svg';
import illustrationLeafMix from '@/public/illustration_leaf_mix.svg';
import welcomeToBloom from '@/public/welcome_to_bloom.svg';
import { rowStyle } from '@/styles/common';
import {
  Box,
  Card,
  CardContent,
  Container,
  Link,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

const containerStyle = {
  ...rowStyle,
  backgroundColor: 'primary.light',
} as const;

const textContainerStyle = {
  maxWidth: 600,
  width: { xs: '100%', md: '45%' },
} as const;

const formCardStyle = {
  width: { xs: '100%', sm: '70%', md: '45%' },
  alignSelf: 'flex-start',
} as const;

const imageContainerStyle = {
  position: 'relative',
  width: { xs: 120, md: 160 },
  height: { xs: 70, md: 80 },
  marginBottom: 3,
  marginTop: { xs: 0, md: 2 },
} as const;

export default function LoginPage() {
  const t = useTranslations('Auth');
  const tS = useTranslations('Shared');
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const userId = useTypedSelector((state) => state.user.id);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);

  const headerProps = {
    partnerLogoSrc: welcomeToBloom,
    partnerLogoAlt: 'alt.welcomeToBloom',
    imageSrc: illustrationBloomHeadYellow,
    imageAlt: 'alt.bloomHead',
  };

  const allPartnersContent = getAllPartnersContent();

  useEffect(() => {
    // Redirect if the user is on the login page but is already logged in and their data has been retrieved from the backend
    if (!userId) return;

    const returnUrl = searchParams?.get('return_url');

    if (partnerAdmin?.active) {
      router.push('/partner-admin/create-access-code');
    } else if (!!returnUrl) {
      router.push(returnUrl);
    } else {
      router.push('/courses');
    }
  }, [userId, partnerAdmin?.active, router, searchParams]);

  const ExtraContent = () => {
    return (
      <>
        <Box sx={imageContainerStyle}>
          <Image
            alt={tS('alt.leafMix')}
            src={illustrationLeafMix}
            fill
            sizes={getImageSizes(imageContainerStyle.width)}
          />
        </Box>
        <Typography variant="h3" component="h3">
          {t('login.newUserTitle')}
        </Typography>
        <Typography>
          <Link
            component={i18nLink}
            onClick={() => {
              logEvent(GET_STARTED_WITH_BLOOM_CLICKED);
            }}
            href="/"
          >
            {t('getStartedBloom')}
          </Link>
        </Typography>

        {allPartnersContent?.map((partner) => (
          <Typography key={`${partner.name}-link`} mt={0.5}>
            <Link
              component={i18nLink}
              mt="1rem !important"
              href={`/welcome/${partner.name.toLowerCase()}`}
              onClick={() => {
                logEvent(generateGetStartedPartnerEvent(partner.name));
              }}
            >
              {t.rich('getStartedWith', { partnerName: partner.name })}
            </Link>
          </Typography>
        ))}
      </>
    );
  };

  return (
    <Box>
      <PartnerHeader
        partnerLogoSrc={headerProps.partnerLogoSrc}
        partnerLogoAlt={headerProps.partnerLogoAlt}
        imageSrc={headerProps.imageSrc}
        imageAlt={headerProps.imageAlt}
      />
      <Container sx={containerStyle}>
        <Box sx={textContainerStyle}>
          <Typography pb={2} variant="subtitle1" component="p">
            {t('introduction')}
          </Typography>
          {!isSmallScreen && <ExtraContent />}
        </Box>
        <Card sx={formCardStyle}>
          <CardContent>
            <Typography variant="h2" component="h2">
              {t('login.title')}
            </Typography>

            <LoginForm />
            <Typography textAlign="center">
              {t.rich('login.resetPasswordLink', {
                resetLink: (children) => (
                  <Link
                    component={i18nLink}
                    onClick={() => {
                      logEvent(RESET_PASSWORD_HERE_CLICKED);
                    }}
                    href="/auth/reset-password"
                  >
                    {children}
                  </Link>
                ),
              })}
            </Typography>
          </CardContent>
        </Card>
      </Container>
      {isSmallScreen && (
        <Container>
          <ExtraContent />
        </Container>
      )}
    </Box>
  );
}
