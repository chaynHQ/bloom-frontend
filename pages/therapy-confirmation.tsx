import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { GetStaticPropsContext } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import Image from 'next/image';
import { RootState } from '../app/store';
import Faqs from '../components/Faqs';
import Header from '../components/Header';
import Link from '../components/Link';
import { therapyFaqs } from '../constants/faqs';
import { useTypedSelector } from '../hooks/store';
import illustrationLeafMix from '../public/illustration_leaf_mix.svg';
import illustrationTeaPeach from '../public/illustration_tea_peach.png';
import { AuthNextPage } from '../utils/authNextPage';

const TherapyConfirmation: AuthNextPage = () => {
  const t = useTranslations('TherapyBooking');
  const tS = useTranslations('Shared');
  const { user, partnerAccess } = useTypedSelector((state: RootState) => state);

  const headerProps = {
    title: t.rich('confirmation.title'),
    introduction: t.rich('confirmation.introduction'),
    imageSrc: illustrationTeaPeach,
    imageAlt: 'alt.personTea',
  };

  const containerStyle = {
    backgroundColor: 'secondary.light',
  } as const;

  const faqsContainerStyle = {
    maxWidth: '680px !important',
    margin: 'auto',
  } as const;

  return (
    <Box>
      <Head>
        <title>{t('title')}</title>
      </Head>
      <Header
        title={headerProps.title}
        introduction={headerProps.introduction}
        imageSrc={headerProps.imageSrc}
        imageAlt={headerProps.imageAlt}
      />
      <Container sx={containerStyle}>
        <Typography variant="body1" component="p">
          {t.rich('confirmation.returnDescription')}
        </Typography>
        <Typography variant="body1" component="p">
          {t.rich('confirmation.bookmarkDescription', {
            bookingLink: (children) => (
              <Link href={`${process.env.NEXT_PUBLIC_BASE_URL}/`}>{children}</Link>
            ),
          })}
        </Typography>
      </Container>
      <Container>
        <Typography variant="h2" component="h2" mb={2} textAlign="center">
          {t.rich('faqHeader')}
        </Typography>
        <Box textAlign="center">
          <Image
            alt={tS.raw('alt.partialLeavesRose')}
            src={illustrationLeafMix}
            width={100}
            height={100}
          />
        </Box>
        <Box sx={faqsContainerStyle}>
          <Faqs faqList={therapyFaqs} translations="TherapyBooking.faqs" />
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
TherapyConfirmation.requireAuth = true;

export default TherapyConfirmation;
