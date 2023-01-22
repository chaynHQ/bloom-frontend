import { Container, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { GetStaticPropsContext, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useTranslations } from 'use-intl';
import { RootState } from '../app/store';
import LoadingContainer from '../components/common/LoadingContainer';
import { useTypedSelector } from '../hooks/store';
import bloomMeow from '../public/bloom_meow.png';
import { scaleTitleStyle } from '../styles/common';

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  alignItems: 'center',
  textAlign: 'center',
} as const;

const imageContainerStyle = {
  position: 'relative',
  width: { xs: 180, md: 200 },
  height: { xs: 180, md: 350 },
  marginBottom: 3,
} as const;

const textContainerStyle = {
  ...scaleTitleStyle,
  lineHeight: 1.5,
  maxWidth: { xs: 180, md: '70%' },
} as const;

const Maintenance: NextPage = () => {
  const t = useTranslations('Shared');
  const { user } = useTypedSelector((state: RootState) => state);

  if (user.loading) {
    return <LoadingContainer />;
  }

  return (
    <Container sx={containerStyle}>
      <Head>
        <title>{t('maintenance.title')}</title>
      </Head>
      <Box sx={imageContainerStyle}>
        <Image alt={t('alt.bloomLogo')} src={bloomMeow} />
      </Box>
      <Typography variant="h1" component="h1" sx={textContainerStyle}>
        {t('maintenance.description')}
      </Typography>
    </Container>
  );
};

export function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: {
        ...require(`../messages/shared/${locale}.json`),
        ...require(`../messages/navigation/${locale}.json`),
      },
    },
  };
}

export default Maintenance;
