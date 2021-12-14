import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import type { NextPage } from 'next';
import { GetStaticPropsContext } from 'next';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Link from '../components/Link';
import illustrationTeaPeach from '../public/illustration_tea_peach.png';

const Home: NextPage = () => {
  // TODO: remove router replace once home page exists
  const router = useRouter();
  router.replace('/therapy-booking');

  const t = useTranslations('Index');

  const headerProps = {
    title: t.rich('title'),
    introduction: t.rich('introduction', {
      nextLink: (children) => <Link href="https://redux.js.org/">{children}</Link>,
      reduxLink: (children) => <Link href="https://redux.js.org/">{children}</Link>,
      muiLink: (children) => <Link href="https://mui.com/">{children}</Link>,
    }),
    imageSrc: illustrationTeaPeach,
    imageAlt: 'alt.personTea',
  };

  return (
    <Box>
      <Header
        title={headerProps.title}
        introduction={headerProps.introduction}
        imageSrc={headerProps.imageSrc}
        imageAlt={headerProps.imageAlt}
      />
      <Container>
        <Button
          sx={{ mt: 2, mr: 1.5 }}
          variant="contained"
          component={Link}
          href="https://nextjs.org/docs"
        >
          {t.rich('nextDocs')}
        </Button>
        <Box sx={{ bgcolor: 'primary.main', height: '2.5rem', mt: 2.5 }}></Box>
        <Box sx={{ bgcolor: 'primary.light', height: '2.5rem' }}></Box>
        <Box sx={{ bgcolor: 'primary.dark', height: '2.5rem' }}></Box>
        <Box sx={{ bgcolor: 'secondary.main', height: '2.5rem' }}></Box>
        <Box sx={{ bgcolor: 'secondary.light', height: '2.5rem' }}></Box>
        <Box sx={{ bgcolor: 'secondary.dark', height: '2.5rem' }}></Box>
      </Container>
    </Box>
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
