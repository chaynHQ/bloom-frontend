import { Box, Button, Container, Typography } from '@mui/material';
import { GetStaticPropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import Image from 'next/image';
import Script from 'next/script';
import { useEffect, useState } from 'react';
import { PartnerAccess } from '../../app/partnerAccessSlice';
import Faqs from '../../components/common/Faqs';
import ImageTextGrid, { ImageTextItem } from '../../components/common/ImageTextGrid';
import Header from '../../components/layout/Header';
import { getSimplybookWidgetConfig } from '../../config/simplybook';
import { THERAPY_BOOKING_OPENED, THERAPY_BOOKING_VIEWED } from '../../constants/events';
import { therapyFaqs } from '../../constants/faqs';
import { useTypedSelector } from '../../hooks/store';
import illustrationChange from '../../public/illustration_change.svg';
import illustrationChooseTherapist from '../../public/illustration_choose_therapist.svg';
import illustrationConfidential from '../../public/illustration_confidential.svg';
import illustrationDateSelector from '../../public/illustration_date_selector.svg';
import illustrationLeafMix from '../../public/illustration_leaf_mix.svg';
import illustrationPerson4Peach from '../../public/illustration_person4_peach.svg';
import { rowStyle } from '../../styles/common';
import logEvent, { getEventUserData } from '../../utils/logEvent';

const containerStyle = {
  backgroundColor: 'secondary.light',
  textAlign: 'center',
  ...rowStyle,
} as const;

const ctaContent = {
  flex: 1,
  textAlign: 'left',
  marginTop: 4,
} as const;

const faqsContainerStyle = {
  maxWidth: '680px !important',
  margin: 'auto',
} as const;

const bookingButtonStyle = {
  minWidth: 200,
  marginY: 4,
} as const;

const steps: Array<ImageTextItem> = [
  {
    text: 'step1',
    illustrationSrc: illustrationChooseTherapist,
    illustrationAlt: 'alt.chooseTherapist',
  },
  {
    text: 'step2',
    illustrationSrc: illustrationDateSelector,
    illustrationAlt: 'alt.dateSelector',
  },
  {
    text: 'step3',
    illustrationSrc: illustrationChange,
    illustrationAlt: 'alt.change',
  },
  {
    text: 'step4',
    illustrationSrc: illustrationConfidential,
    illustrationAlt: 'alt.confidential',
  },
];

const BookSession: NextPage = () => {
  const t = useTranslations('Therapy');
  const tS = useTranslations('Shared');
  const [partnerAccess, setPartnerAccess] = useState<PartnerAccess | null>(null);
  const [hasTherapyRemaining, setHasTherapyRemaining] = useState<boolean>(false);
  const [widgetOpen, setWidgetOpen] = useState(false);

  const user = useTypedSelector((state) => state.user);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const eventUserData = getEventUserData(user.createdAt, partnerAccesses, partnerAdmin);

  useEffect(() => {
    let partnerAccess = partnerAccesses.find(
      (partnerAccess) =>
        partnerAccess.featureTherapy === true && partnerAccess.therapySessionsRemaining > 0,
    );
    if (partnerAccess) {
      setHasTherapyRemaining(true);
    } else {
      // existing therapy access has no remaining sessions, return access that was last redeemed
      const redeemedAccesses = partnerAccesses.filter(
        (partnerAccess) =>
          !!partnerAccess.featureTherapy && partnerAccess.therapySessionsRedeemed > 0,
      );
      partnerAccess = redeemedAccesses[redeemedAccesses.length - 1];
    }

    if (partnerAccess?.partner.name) {
      setPartnerAccess(partnerAccess);
    }
  }, [setPartnerAccess, partnerAccesses]);

  useEffect(() => {
    logEvent(THERAPY_BOOKING_VIEWED, eventUserData);
  }, []);

  const headerProps = {
    title: t('title'),
    introduction: `${t.rich('introduction', { partnerName: partnerAccess?.partner?.name })}`,
    imageSrc: illustrationPerson4Peach,
    imageAlt: 'alt.personTea',
  };

  const openWidget = () => {
    logEvent(THERAPY_BOOKING_OPENED, eventUserData);

    setWidgetOpen(true);
  };

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
        <Box sx={ctaContent}>
          <Typography>
            {hasTherapyRemaining
              ? t.rich('therapySessionsRemaining', {
                  strongText: () => (
                    <strong id="therapy-sessions-remaining">
                      {partnerAccess?.therapySessionsRemaining}
                    </strong>
                  ),
                })
              : t('noTherapySessionsRemaining')}
          </Typography>
          {hasTherapyRemaining && (
            <Button
              sx={bookingButtonStyle}
              variant="contained"
              color="secondary"
              size="large"
              onClick={openWidget}
            >
              {t('bookingButton')}
            </Button>
          )}
        </Box>
        <ImageTextGrid items={steps} translations="Therapy.steps" />
      </Container>

      <Container>
        <Typography variant="h2" component="h2" mb={2} textAlign="center">
          {t('faqHeader')}
        </Typography>
        <Box textAlign="center">
          <Image
            alt={tS('alt.leafMix')}
            src={illustrationLeafMix}
            width={125}
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
          {hasTherapyRemaining && (
            <Button
              sx={bookingButtonStyle}
              variant="contained"
              color="secondary"
              size="large"
              onClick={openWidget}
            >
              {t('bookingButton')}
            </Button>
          )}
        </Box>
      </Container>

      {widgetOpen && (
        <Script
          id="widget-js"
          src="//widget.simplybook.it/v2/widget/widget.js"
          onLoad={() => {
            new (window as any).SimplybookWidget(getSimplybookWidgetConfig(user));
          }}
        />
      )}
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

export default BookSession;
