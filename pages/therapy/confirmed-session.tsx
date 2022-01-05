import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { GetStaticPropsContext } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import Image from 'next/image';
import { useEffect } from 'react';
import { useGetUserMutation } from '../../app/api';
import Faqs from '../../components/Faqs';
import Header from '../../components/Header';
import Link from '../../components/Link';
import rollbar from '../../config/rollbar';
import {
  GET_USER_ERROR,
  GET_USER_REQUEST,
  GET_USER_SUCCESS,
  THERAPY_CONFIRMATION_VIEWED,
} from '../../constants/events';
import { therapyFaqs } from '../../constants/faqs';
import illustrationLeafMix from '../../public/illustration_leaf_mix.svg';
import illustrationTeaPeach from '../../public/illustration_tea_peach.png';
import { AuthNextPage } from '../../utils/authNextPage';
import { getErrorMessage } from '../../utils/errorMessage';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import { TherapyAccessGuard } from '../../utils/therapyAccessGuard';

const ConfirmedSession: AuthNextPage = () => {
  const t = useTranslations('Therapy');
  const tS = useTranslations('Shared');
  const [getUser, { isLoading: getUserIsLoading }] = useGetUserMutation();

  useEffect(() => {
    async function callGetUser() {
      logEvent(GET_USER_REQUEST);
      const userResponse = await getUser('');

      if ('data' in userResponse && userResponse.data.user.id) {
        const eventUserData = getEventUserData(userResponse.data);
        logEvent(GET_USER_SUCCESS, eventUserData);
        logEvent(THERAPY_CONFIRMATION_VIEWED, eventUserData);
      } else {
        if ('error' in userResponse) {
          rollbar.error('Therapy confirmation get user error', userResponse.error);
          logEvent(GET_USER_ERROR, { message: getErrorMessage(userResponse.error) });
        }
        logEvent(THERAPY_CONFIRMATION_VIEWED);
      }
    }
    callGetUser();
  }, [getUser]);

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
    <TherapyAccessGuard>
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
            <Faqs faqList={therapyFaqs} translations="Therapy.faqs" />
          </Box>
        </Container>
      </Box>
    </TherapyAccessGuard>
  );
};

export function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: {
        ...require(`../../messages/shared/${locale}.json`),
        ...require(`../../messages/navigation/${locale}.json`),
        ...require(`../../messages/therapy/${locale}.json`),
      },
    },
  };
}
ConfirmedSession.requireAuth = true;

export default ConfirmedSession;
