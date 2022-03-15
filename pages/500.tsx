import { Button, Container, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { GetStaticPropsContext, NextPage } from 'next';
import Image from 'next/image';
import { useTranslations } from 'use-intl';
import { RootState } from '../app/store';
import Link from '../components/common/Link';
import LoadingContainer from '../components/common/LoadingContainer';
import { useTypedSelector } from '../hooks/store';
import bloomHead from '../public/illustration_bloom_head.svg';
import { columnStyle } from '../styles/common';

const Custom500: NextPage = () => {
  const t = useTranslations('Shared');
  const { user } = useTypedSelector((state: RootState) => state);

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

  if (user.loading) {
    return <LoadingContainer />;
  }

  return (
    <Container sx={containerStyle}>
      <Box sx={imageContainerStyle}>
        <Image alt={t('alt.bloomLogo')} src={bloomHead} layout="fill" />
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
        href={user.token ? '/courses' : '/welcome'}
      >
        {user.token ? t('500.authenticatedRedirectButton') : t('500.unauthenticatedRedirectButton')}
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
