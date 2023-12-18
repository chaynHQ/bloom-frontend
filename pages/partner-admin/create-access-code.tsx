import { Box, Card, CardContent, Container, Typography } from '@mui/material';
import { GetStaticPropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useEffect } from 'react';
import { RootState } from '../../app/store';
import CreateAccessCodeForm from '../../components/forms/CreateAccessCodeForm';
import AdminHeader from '../../components/layout/PartnerAdminHeader';
import { CREATE_PARTNER_ACCESS_VIEWED } from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import bloomLogo from '../../public/bloom_logo.svg';
import { rowStyle } from '../../styles/common';
import logEvent, { getEventUserData } from '../../utils/logEvent';

const containerStyle = {
  backgroundColor: 'secondary.light',
  ...rowStyle,
} as const;

const cardStyle = {
  width: { xs: '100%', md: '60%' },
} as const;

const CreateAccessCode: NextPage = () => {
  const t = useTranslations('PartnerAdmin.createAccessCode');
  const { partnerAdmin, user, partnerAccesses } = useTypedSelector((state: RootState) => state);
  const eventUserData = getEventUserData({ user, partnerAccesses, partnerAdmin });

  const headerProps = {
    title: t('title'),
    introduction: t('introduction'),
    partnerLogoSrc: partnerAdmin.partner?.logo || bloomLogo,
    partnerLogoAlt: partnerAdmin.partner?.logoAlt || 'alt.bloomLogo',
  };

  useEffect(() => {
    logEvent(CREATE_PARTNER_ACCESS_VIEWED, { ...eventUserData });
  }, []);

  return (
    <Box>
      <Head>
        <title>{t('title')}</title>
      </Head>
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
};

export function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: {
        ...require(`../../messages/shared/${locale}.json`),
        ...require(`../../messages/navigation/${locale}.json`),
        ...require(`../../messages/partnerAdmin/${locale}.json`),
      },
    },
  };
}

export default CreateAccessCode;
