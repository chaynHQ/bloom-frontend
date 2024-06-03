import { Button, Container, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { GetStaticPropsContext, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useTranslations } from 'use-intl';
import Link from '../components/common/Link';
import LoadingContainer from '../components/common/LoadingContainer';
import { useTypedSelector } from '../hooks/store';
import bloomHead from '../public/illustration_bloom_head.svg';
import { columnStyle } from '../styles/common';

const Custom500: NextPage = () => {
  const t = useTranslations('Shared');
  const userToken = useTypedSelector((state) => state.user.token);
  const userLoading = useTypedSelector((state) => state.user.loading);

  const containerStyle = {
    ...columnStyle,
    height: '100vh',
    alignItems: 'flex-start',
  } as const;

  const imageContainerStyle = {
    position: 'relative',
    width: { xs: 180, md: 260 },
    height: { xs: 180, md: 260 },
    marginLeft: { xs: -3, md: -6 },
    marginBottom: 2,
  } as const;

  if (userLoading) {
    return <LoadingContainer />;
  }

  return (
    <Container sx={containerStyle}>
      <Head>
        <title>{t('500.title')}</title>
      </Head>
      <Box sx={imageContainerStyle}>
        <Image alt={t('alt.bloomLogo')} src={bloomHead} fill sizes="100vw" />
      </Box>
      <Typography variant="h1" component="h1">
        {t('500.title')}
      </Typography>
      <Typography>{t('500.description')}</Typography>
      <Button
        sx={{ mt: 3 }}
        variant="contained"
        color="secondary"
        component={Link}
        href={userToken ? '/courses' : '/login'}
      >
        {userToken ? t('500.authenticatedRedirectButton') : t('500.unauthenticatedRedirectButton')}
      </Button>
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

export default Custom500;
