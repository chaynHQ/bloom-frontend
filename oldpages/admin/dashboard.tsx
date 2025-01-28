import CreatePartnerAdminForm from '@/components/forms/CreatePartnerAdminForm';
import UpdatePartnerAdminForm from '@/omponents/forms/UpdatePartnerAdminForm';
import UpdateTherapyAdminForm from '@/omponents/forms/UpdateTherapyAdminForm';
import AdminHeader from '@/omponents/layout/PartnerAdminHeader';
import { CREATE_PARTNER_ACCESS_VIEWED } from '@/onstants/events';
import logEvent from '@/tils/logEvent';
import { rowStyle } from '@/tyles/common';
import { Box, Card, CardContent, Container, Typography } from '@mui/material';
import { GetStaticPropsContext, NextPage } from 'next';
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

const Dashboard: NextPage = () => {
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
};

export function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: {
        ...require(`../../messages/shared/${locale}.json`),
        ...require(`../../messages/navigation/${locale}.json`),
        ...require(`../../messages/partnerAdmin/${locale}.json`),
        ...require(`../../messages/admin/${locale}.json`),
      },
    },
  };
}

export default Dashboard;
