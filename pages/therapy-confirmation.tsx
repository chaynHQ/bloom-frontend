import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import type { NextPage } from 'next';
import { GetStaticPropsContext } from 'next';
import { useTranslations } from 'next-intl';
import Header from '../components/Header';
import Link from '../components/Link';
import illustrationTeaPeach from '../public/illustration_tea_peach.png';

const TherapyConfirmation: NextPage = () => {
  const t = useTranslations('TherapyBooking');

  const headerProps = {
    title: t.rich('title'),
    introduction: t.rich('introduction'),
    imageSrc: illustrationTeaPeach,
    imageAlt: 'Bloom logo',
  };

  const containerStyle = {
    backgroundColor: 'secondary.light',
  } as const;

  const imageContainerStyle = {
    position: 'relative',
    width: 100,
    height: 80,
    marginY: { xs: 2, md: 2 },
    marginX: 'auto',
  } as const;

  return (
    <Box>
      <Header
        title={headerProps.title}
        introduction={headerProps.introduction}
        imageSrc={headerProps.imageSrc}
        imageAlt={headerProps.imageAlt}
      />

      <Container sx={containerStyle}>
        <Box maxWidth={700}>
          <Typography variant="h2" component="h2">
            {t.rich('confirmation.header')}
          </Typography>
          <Typography variant="body1" component="p">
            {t.rich('confirmation.description')}
          </Typography>
          <Typography variant="body1" component="p" mt={3}>
            {t.rich('confirmation.returnDescription', {
              bookingLink: (children) => <Link href="/therapy-booking">{children}</Link>,
            })}
          </Typography>
        </Box>
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
        ...require(`../messages/therapyBooking/${locale}.json`),
      },
    },
  };
}

export default TherapyConfirmation;
