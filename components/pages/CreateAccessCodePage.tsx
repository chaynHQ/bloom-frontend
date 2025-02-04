'use client';

import CreateAccessCodeForm from '@/components/forms/CreateAccessCodeForm';
import AdminHeader from '@/components/layout/PartnerAdminHeader';
import { CREATE_PARTNER_ACCESS_VIEWED } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import logEvent from '@/lib/utils/logEvent';
import bloomLogo from '@/public/bloom_logo.svg';
import { rowStyle } from '@/styles/common';
import { Box, Card, CardContent, Container, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

const containerStyle = {
  backgroundColor: 'secondary.light',
  ...rowStyle,
} as const;

const cardStyle = {
  width: { xs: '100%', md: '60%' },
} as const;

export default function CreateAccessCodePage() {
  const t = useTranslations('PartnerAdmin.createAccessCode');
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);

  const headerProps = {
    title: t('title'),
    introduction: t('introduction'),
    partnerLogoSrc: partnerAdmin.partner?.logo || bloomLogo,
    partnerLogoAlt: partnerAdmin.partner?.logoAlt || 'alt.bloomLogo',
  };

  useEffect(() => {
    logEvent(CREATE_PARTNER_ACCESS_VIEWED);
  }, []);

  return (
    <Box>
      <AdminHeader
        title={headerProps.title}
        introduction={headerProps.introduction}
        partnerLogoSrc={headerProps.partnerLogoSrc}
        partnerLogoAlt={headerProps.partnerLogoAlt}
      />
      <Container sx={containerStyle}>
        <Card sx={cardStyle}>
          <CardContent>
            <Typography variant="h2" component="h2">
              {t('title')}
            </Typography>
            <Typography
              sx={{
                '&:last-of-type': {
                  marginBottom: '1em',
                },
              }}
            >
              {t('introduction')}
            </Typography>
            <CreateAccessCodeForm />
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
