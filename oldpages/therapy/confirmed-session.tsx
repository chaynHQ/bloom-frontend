import { Link as i18nLink } from '@/18n/routing';
import Faqs from '@/components/common/Faqs';
import { PartnerAccess } from '@/ib/store/partnerAccessSlice';
import Header from '@/omponents/layout/Header';
import { THERAPY_CONFIRMATION_VIEWED } from '@/onstants/events';
import { therapyFaqs } from '@/onstants/faqs';
import { useTypedSelector } from '@/ooks/store';
import logEvent from '@/tils/logEvent';
import illustrationLeafMix from '@/ublic/illustration_leaf_mix.svg';
import illustrationPerson4Peach from '@/ublic/illustration_person4_peach.svg';
import { Box, Container, Link, Typography } from '@mui/material';
import { GetStaticPropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const ConfirmedSession: NextPage = () => {
  const t = useTranslations('Therapy');
  const tS = useTranslations('Shared');

  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
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
    logEvent(THERAPY_CONFIRMATION_VIEWED);
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
        <title>{`${t('title')} • Bloom`}</title>
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
            bookingLink: (children) => (
              <Link component={i18nLink} href={`/`}>
                {children}
              </Link>
            ),
          })}
        </Typography>
      </Container>
      <Container>
        <Typography variant="h2" component="h2" mb={2} textAlign="center">
          {t('faqHeader')}
        </Typography>
        <Box textAlign="center">
          <Image alt={tS('alt.leafMix')} src={illustrationLeafMix} width={100} height={100} />
        </Box>
        <Box sx={faqsContainerStyle}>
          <Faqs
            faqList={therapyFaqs(tS('feedbackTypeform'))}
            translations="Therapy.faqs"
            partner={partnerAccess?.partner}
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
