import { Box, Button, Container, Typography } from '@mui/material';
import { GetStaticPropsContext, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useTranslations } from 'use-intl';
import Link from '../components/common/Link';
import LoadingContainer from '../components/common/LoadingContainer';
import { useTypedSelector } from '../hooks/store';
import bloomHead from '../public/illustration_bloom_head.svg';
import { columnStyle } from '../styles/common';

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

const Custom404: NextPage = () => {
  const t = useTranslations('Shared');
  const userId = useTypedSelector((state) => state.user.id);
  const userLoading = useTypedSelector((state) => state.user.loading);

  if (userLoading) {
    return <LoadingContainer />;
  }

  return (
    <Container sx={containerStyle}>
      <Head>
        <title>{`${t('404.title')} • Bloom`}</title>
      </Head>
      <Box sx={imageContainerStyle}>
        <Image alt={t('alt.bloomLogo')} src={bloomHead} fill sizes="100vw" />
      </Box>
      <Typography variant="h1" component="h1">
        {t('404.title')}
      </Typography>
      <Typography>
        {userId ? t('404.authenticatedDescription') : t('404.unauthenticatedDescription')}
      </Typography>
      <Button
        sx={{ mt: 3 }}
        variant="contained"
        color="secondary"
        component={Link}
        href={userId ? '/courses' : '/login'}
      >
        {userId ? t('404.authenticatedRedirectButton') : t('404.unauthenticatedRedirectButton')}
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

export default Custom404;
