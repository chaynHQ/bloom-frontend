import { Box, Container, Typography } from '@mui/material';
import { GetStaticPropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { PartnerAccess } from '../../app/partnerAccessSlice';
import Faqs from '../../components/common/Faqs';
import Link from '../../components/common/Link';
import Header from '../../components/layout/Header';
import { BASE_URL } from '../../constants/common';
import { THERAPY_CONFIRMATION_VIEWED } from '../../constants/events';
import { therapyFaqs } from '../../constants/faqs';
import { useTypedSelector } from '../../hooks/store';
import illustrationLeafMix from '../../public/illustration_leaf_mix.svg';
import illustrationPerson4Peach from '../../public/illustration_person4_peach.svg';
import logEvent, { getEventUserData } from '../../utils/logEvent';

const ConfirmedSession: NextPage = () => {
  const t = useTranslations('Therapy');
  const tS = useTranslations('Shared');

  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);
  const [partnerAccess, setPartnerAccess] = useState<PartnerAccess | null>(null);

  useEffect(() => {
    let accesses = partnerAccesses.filter(
      (partnerAccess) =>
        !!partnerAccess.featureTherapy && partnerAccess.therapySessionsRedeemed > 0,
    );
    let partnerAccess = null;

    if (accesses.length === 1) {
      partnerAccess = accesses[0];
    } else {
      // several partner accesses with redeemed therapy, get last one
      partnerAccess = accesses[accesses.length - 1];
    }
    setPartnerAccess(partnerAccess);
  }, [partnerAccesses]);

  useEffect(() => {
    logEvent(THERAPY_CONFIRMATION_VIEWED, eventUserData);
  }, []);

  const headerProps = {
    title: t('confirmation.title'),
    introduction: t('confirmation.introduction'),
    imageSrc: illustrationPerson4Peach,
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
        <Typography>{t('confirmation.returnDescription')}</Typography>
        <Typography>
          {t.rich('confirmation.bookmarkDescription', {
            bookingLink: (children) => <Link href={`${BASE_URL}/`}>{children}</Link>,
          })}
        </Typography>
      </Container>
      <Container>
        <Typography variant="h2" component="h2" mb={2} textAlign="center">
          {t('faqHeader')}
        </Typography>
        <Box textAlign="center">
          <Image
            alt={tS('alt.leafMix')}
            src={illustrationLeafMix}
            width={100}
            height={100}
            style={{
              maxWidth: '100%',
              height: 'auto',
            }}
          />
        </Box>
        <Box sx={faqsContainerStyle}>
          <Faqs
            faqList={therapyFaqs(tS('feedbackTypeform'))}
            translations="Therapy.faqs"
            partner={partnerAccess?.partner}
            eventUserData={eventUserData}
          />
        </Box>
      </Container>
    </Box>
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

export default ConfirmedSession;
