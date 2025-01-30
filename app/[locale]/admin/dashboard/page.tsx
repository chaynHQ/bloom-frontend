'use client';

import CreatePartnerAdminForm from '@/lib/components/forms/CreatePartnerAdminForm';
import UpdatePartnerAdminForm from '@/lib/components/forms/UpdatePartnerAdminForm';
import UpdateTherapyAdminForm from '@/lib/components/forms/UpdateTherapyAdminForm';
import AdminHeader from '@/lib/components/layout/PartnerAdminHeader';
import { CREATE_PARTNER_ACCESS_VIEWED } from '@/lib/constants/events';
import logEvent from '@/lib/utils/logEvent';
import { rowStyle } from '@/styles/common';
import { Box, Card, CardContent, Container, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useEffect } from 'react';

const containerStyle = {
  backgroundColor: 'secondary.light',
  ...rowStyle,
} as const;

const cardStyle = {
  width: { xs: '100%', md: '60%' },
  margin: { xs: '10px' },
} as const;

export default function Page() {
  const t = useTranslations('Admin');

  const headerProps = {
    title: t('title'),
  };

  useEffect(() => {
    logEvent(CREATE_PARTNER_ACCESS_VIEWED);
  }, []);

  return (
    <Box>
      <Head>
        <title>{`${headerProps.title} • Bloom`}</title>
      </Head>
      <AdminHeader title={headerProps.title} />
      <Container sx={containerStyle}>
        <Card sx={cardStyle}>
          <CardContent>
            <Typography variant="h2" component="h2">
              {t('createPartnerAdmin.title')}
            </Typography>
            <Typography
              sx={{
                '&:last-of-type': {
                  marginBottom: '1em',
                },
              }}
            >
              {t('createPartnerAdmin.description')}
            </Typography>
            <CreatePartnerAdminForm />
          </CardContent>
        </Card>
        <Card sx={cardStyle}>
          <CardContent>
            <Typography variant="h2" component="h2">
              {t('updateTherapy.title')}
            </Typography>
            <Typography
              sx={{
                '&:last-of-type': {
                  marginBottom: '1em',
                },
              }}
            ></Typography>
            <UpdateTherapyAdminForm />
          </CardContent>
        </Card>
        <Card sx={cardStyle}>
          <CardContent>
            <Typography variant="h2" component="h2">
              {t('updatePartner.title')}
            </Typography>
            <UpdatePartnerAdminForm />
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
