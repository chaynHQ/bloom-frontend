import LanguageIcon from '@mui/icons-material/Language';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import type { NextPage } from 'next';
import { GetStaticPropsContext } from 'next';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import Link from '../components/Link';

const Home: NextPage = () => {
  const router = useRouter();
  const locale = router.locale;
  const locales = router.locales;
  const t = useTranslations('Index');

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 10 }}>
        <AppBar sx={{ bgcolor: 'primary.light', flexDirection: 'row' }}>
          {locales?.map((language) => {
            const currentLocale = language === locale;

            return (
              <Button
                key={language}
                component={Link}
                noLinkStyle
                variant={currentLocale ? 'outlined' : 'contained'}
                disabled={currentLocale}
                startIcon={currentLocale && <LanguageIcon />}
                href="/"
                locale={language}
              >
                {language}
              </Button>
            );
          })}
        </AppBar>
        <Typography variant="h1" component="h1" gutterBottom>
          H1 -{' '}
          {t.rich('introduction', {
            nextLink: (children) => <Link href="https://redux.js.org/">{children}</Link>,
            reduxLink: (children) => <Link href="https://redux.js.org/">{children}</Link>,
            muiLink: (children) => <Link href="https://mui.com/">{children}</Link>,
          })}
        </Typography>
        <Typography variant="h2" component="h2" gutterBottom>
          H2 -{' '}
          {t.rich('introduction', {
            nextLink: (children) => <Link href="https://redux.js.org/">{children}</Link>,
            reduxLink: (children) => <Link href="https://redux.js.org/">{children}</Link>,
            muiLink: (children) => <Link href="https://mui.com/">{children}</Link>,
          })}
        </Typography>
        <Typography variant="h3" component="h3" gutterBottom>
          H3 -{' '}
          {t.rich('introduction', {
            nextLink: (children) => <Link href="https://redux.js.org/">{children}</Link>,
            reduxLink: (children) => <Link href="https://redux.js.org/">{children}</Link>,
            muiLink: (children) => <Link href="https://mui.com/">{children}</Link>,
          })}
        </Typography>
        <Typography variant="h4" component="h4" gutterBottom>
          H4 -{' '}
          {t.rich('introduction', {
            nextLink: (children) => <Link href="https://redux.js.org/">{children}</Link>,
            reduxLink: (children) => <Link href="https://redux.js.org/">{children}</Link>,
            muiLink: (children) => <Link href="https://mui.com/">{children}</Link>,
          })}
        </Typography>
        <Typography variant="h5" component="h5" gutterBottom>
          H5 -{' '}
          {t.rich('introduction', {
            nextLink: (children) => <Link href="https://redux.js.org/">{children}</Link>,
            reduxLink: (children) => <Link href="https://redux.js.org/">{children}</Link>,
            muiLink: (children) => <Link href="https://mui.com/">{children}</Link>,
          })}
        </Typography>
        <Typography variant="h6" component="h6" gutterBottom>
          H6 -{' '}
          {t.rich('introduction', {
            nextLink: (children) => <Link href="https://redux.js.org/">{children}</Link>,
            reduxLink: (children) => <Link href="https://redux.js.org/">{children}</Link>,
            muiLink: (children) => <Link href="https://mui.com/">{children}</Link>,
          })}
        </Typography>
        <Typography variant="body1" component="p" gutterBottom>
          {t.rich('getStarted', {
            code: (children) => <code>{children}</code>,
          })}
        </Typography>
        <Button
          sx={{ mt: 2, mr: 1.5 }}
          variant="contained"
          component={Link}
          noLinkStyle
          href="https://nextjs.org/docs"
        >
          {t.rich('nextDocs')}
        </Button>
        <Button
          component={Link}
          sx={{ mt: 2, mr: 1.5 }}
          variant="contained"
          color="secondary"
          noLinkStyle
          href="https://nextjs.org/docs"
        >
          {t.rich('nextDocs')}
        </Button>
        <Button
          component={Link}
          sx={{ mt: 2, mr: 1.5 }}
          variant="outlined"
          noLinkStyle
          href="https://nextjs.org/docs"
        >
          {t.rich('nextDocs')}
        </Button>
      </Box>
      <Box sx={{ bgcolor: 'primary.main', height: '2.5rem', mt: 2.5 }}></Box>
      <Box sx={{ bgcolor: 'primary.light', height: '2.5rem' }}></Box>
      <Box sx={{ bgcolor: 'primary.dark', height: '2.5rem' }}></Box>
      <Box sx={{ bgcolor: 'secondary.main', height: '2.5rem' }}></Box>
      <Box sx={{ bgcolor: 'secondary.light', height: '2.5rem' }}></Box>
      <Box sx={{ bgcolor: 'secondary.dark', height: '2.5rem' }}></Box>
    </Container>
  );
};

export function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: {
        ...require(`../messages/shared/${locale}.json`),
        ...require(`../messages/index/${locale}.json`),
      },
    },
  };
}

export default Home;
