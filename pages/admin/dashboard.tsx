import { Card, CardContent, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { GetStaticPropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useEffect } from 'react';
import { RootState } from '../../app/store';
import CreatePartnerAdminForm from '../../components/forms/CreatePartnerAdminForm';
import AdminHeader from '../../components/layout/PartnerAdminHeader';
import { CREATE_PARTNER_ACCESS_VIEWED } from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import { rowStyle } from '../../styles/common';
import logEvent, { getEventUserData } from '../../utils/logEvent';

const containerStyle = {
  backgroundColor: 'secondary.light',
  ...rowStyle,
} as const;

const cardStyle = {
  width: { xs: '100%', md: '60%' },
} as const;

const Dashboard: NextPage = () => {
  const t = useTranslations('Admin');
  const { partnerAdmin, user, partnerAccesses } = useTypedSelector((state: RootState) => state);
  const eventUserData = getEventUserData({ user, partnerAccesses, partnerAdmin });

  const headerProps = {
    title: t('title'),
  };

  useEffect(() => {
    logEvent(CREATE_PARTNER_ACCESS_VIEWED, { ...eventUserData });
  }, []);

  return (
    <Box>
      <Head>
        <title>{headerProps.title}</title>
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
            ></Typography>
            <CreatePartnerAdminForm />
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
