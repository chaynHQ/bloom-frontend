'use client';

import CreateAccessCodeForm from '@/components/forms/CreateAccessCodeForm';
import AdminHeader from '@/components/layout/PartnerAdminHeader';
import { useTypedSelector } from '@/lib/hooks/store';
import bloomLogo from '@/public/bloom_logo.svg';
import { rowStyle } from '@/styles/common';
import { Box, Card, CardContent, Container, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

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
