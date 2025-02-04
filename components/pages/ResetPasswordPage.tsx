'use client';

import { EmailForm, PasswordForm } from '@/components/forms/ResetPasswordForm';
import PartnerHeader from '@/components/layout/PartnerHeader';
import illustrationBloomHeadYellow from '@/public/illustration_bloom_head_yellow.svg';
import welcomeToBloom from '@/public/welcome_to_bloom.svg';
import { rowStyle } from '@/styles/common';
import { Box, Card, CardContent, Container, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

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
} as const;

export default function ResetPasswordPage() {
  const t = useTranslations('Auth');
  const searchParams = useSearchParams();
  const oobCodeParam = searchParams.get('oobCode');

  const headerProps = {
    partnerLogoSrc: welcomeToBloom,
    partnerLogoAlt: 'alt.welcomeToBloom',
    imageSrc: illustrationBloomHeadYellow,
    imageAlt: 'alt.bloomHead',
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
        </Box>
        <Card sx={formCardStyle}>
          <CardContent>
            <Typography variant="h2" component="h2">
              {t('resetPassword.title')}
            </Typography>
            {oobCodeParam ? <PasswordForm codeParam={oobCodeParam} /> : <EmailForm />}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
