import LanguageIcon from '@mui/icons-material/Language';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Link from '../components/Link';

const Home: NextPage = () => {
  const router = useRouter();
  const locale = router.locale;
  const locales = router.locales;

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
          Starter <Link href="https://nextjs.org">Next.js</Link>,{' '}
          <Link href="https://redux.js.org/">Redux</Link> and{' '}
          <Link href="https://mui.com/">MUI</Link> project
        </Typography>
        <Typography variant="body1" component="p" gutterBottom>
          Get started by editing the <code>pages/index.tsx</code> file
        </Typography>
        <Button
          sx={{ mt: 2 }}
          variant="contained"
          component={Link}
          noLinkStyle
          href="https://nextjs.org/docs"
        >
          Next.js docs
        </Button>
      </Box>
    </Container>
  );
};

export default Home;
