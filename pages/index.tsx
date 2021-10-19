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
      <Box sx={{ my: 6 }}>
        <AppBar sx={{ flexDirection: 'row' }}>
          {locales?.map((language) => {
            const currentLocale = language === locale;

            return (
              <Button
                key={language}
                component={Link}
                noLinkStyle
                color={currentLocale ? 'secondary' : 'primary'}
                variant="contained"
                startIcon={currentLocale && <LanguageIcon />}
                href="/"
                locale={language}
              >
                {language}
              </Button>
            );
          })}
        </AppBar>
        <Typography variant="h2" component="h1" gutterBottom>
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
          sx={{ mt: 2 }}
          variant="contained"
          component={Link}
          noLinkStyle
          href="https://nextjs.org/docs"
        >
          {t.rich('nextDocs')}
        </Button>
      </Box>
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
