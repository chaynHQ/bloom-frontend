import { Button, Container, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { GetStaticPropsContext, NextPage } from 'next';
import Image from 'next/image';
import { useTranslations } from 'use-intl';
import { RootState } from '../app/store';
import Link from '../components/Link';
import { useTypedSelector } from '../hooks/store';
import bloomHead from '../public/illustration_bloom_head.svg';

const Custom404: NextPage = () => {
  const t = useTranslations('Shared');
  const { user } = useTypedSelector((state: RootState) => state);

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    justifyContent: 'center',
    alignItems: 'flex-start',
  } as const;

  const imageContainerStyle = {
    position: 'relative',
    width: { xs: 180, md: 260 },
    height: { xs: 180, md: 260 },
    ml: { xs: -3, md: -6 },
    mb: 2,
  } as const;

  return (
    <Container sx={containerStyle}>
      <Box sx={imageContainerStyle}>
        <Image alt={t('alt.bloomLogo')} src={bloomHead} layout="fill" />
      </Box>
      <Typography variant="h1" component="h1">
        {t.rich('404.title')}
      </Typography>
      <Typography variant="body1" component="p">
        {t.rich('404.description')}{' '}
        {user.id ? t('404.authenticatedRedirect') : t('404.unauthenticatedRedirect')}.
      </Typography>
      <Button
        sx={{ mt: 3 }}
        variant="contained"
        color="secondary"
        component={Link}
        href={user.id ? '/courses' : '/welcome'}
      >
        {t.rich('404.goBack')}{' '}
        {user.id ? t('404.authenticatedRedirect') : t('404.unauthenticatedRedirect')}
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
