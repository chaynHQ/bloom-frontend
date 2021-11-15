import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import type { NextPage } from 'next';
import { GetStaticPropsContext } from 'next';
import { useTranslations } from 'next-intl';
import Link from '../components/Link';
import illustrationTeaPeach from '../public/illustration_tea_peach.png';

const Home: NextPage = () => {
  const t = useTranslations('Index');

  const headerProps = {
    title: t.rich('title'),
    introduction: t.rich('introduction', {
      nextLink: (children) => <Link href="https://redux.js.org/">{children}</Link>,
      reduxLink: (children) => <Link href="https://redux.js.org/">{children}</Link>,
      muiLink: (children) => <Link href="https://mui.com/">{children}</Link>,
    }),
    imageSrc: illustrationTeaPeach,
    imageAlt: 'Bloom logo',
  };

  return (
    <Container>
      <Box sx={{ mt: 10 }}>
        <Typography variant="h1" component="h1" gutterBottom>
          H1 -{' '}
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
        ...require(`../messages/navigation/${locale}.json`),
        ...require(`../messages/index/${locale}.json`),
      },
    },
  };
}

export default Home;
