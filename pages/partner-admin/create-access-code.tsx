import { Card, CardContent, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { GetStaticPropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { useEffect } from 'react';
import CreateAccessCodeForm from '../../components/CreateAccessCodeForm';
import AdminHeader from '../../components/PartnerAdminHeader';
import { CREATE_PARTNER_ACCESS_VIEWED } from '../../constants/events';
import bumbleLogo from '../../public/bumble_logo.svg';
import { rowStyle } from '../../styles/common';
import logEvent from '../../utils/logEvent';

const CreateAccessCode: NextPage = () => {
  const t = useTranslations('PartnerAdmin.createAccessCode');

  const headerProps = {
    title: t.rich('title'),
    introduction: t.rich('introduction'),
    partnerLogoSrc: bumbleLogo,
    partnerLogoAlt: 'alt.bumbleLogo',
  };

  const containerStyle = {
    backgroundColor: 'secondary.light',
    ...rowStyle,
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  } as const;

  const cardStyle = {
    width: { xs: '100%', md: '60%' },
  } as const;

  useEffect(() => {
    logEvent(CREATE_PARTNER_ACCESS_VIEWED, { partner: 'bumble' });
    console.log('CREATE_PARTNER_ACCESS_VIEWED');
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
              {t.rich('title')}
            </Typography>
            <Typography variant="body1" component="p" mb={2}>
              {t.rich('introduction')}
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
