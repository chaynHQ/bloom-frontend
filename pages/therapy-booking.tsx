import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { GetStaticPropsContext } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import Image from 'next/image';
import Script from 'next/script';
import { useState } from 'react';
import { RootState } from '../app/store';
import Faqs from '../components/Faqs';
import Header from '../components/Header';
import ImageTextGrid, { ImageTextItem } from '../components/ImageTextGrid';
import { therapyFaqs } from '../constants/faqs';
import { useTypedSelector } from '../hooks/store';
import illustrationChange from '../public/illustration_change.svg';
import illustrationChooseTherapist from '../public/illustration_choose_therapist.svg';
import illustrationConfidential from '../public/illustration_confidential.svg';
import illustrationDateSelector from '../public/illustration_date_selector.svg';
import illustrationLeafMix from '../public/illustration_leaf_mix.svg';
import illustrationTeaPeach from '../public/illustration_tea_peach.png';
import { rowStyle } from '../styles/common';
import { AuthNextPage } from '../utils/authNextPage';

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

const TherapyBooking: AuthNextPage = () => {
  const t = useTranslations('TherapyBooking');
  const tS = useTranslations('Shared');
  const [widgetOpen, setWidgetOpen] = useState(false);

  const { user, partnerAccess, partner } = useTypedSelector((state: RootState) => state);

  const widgetConfig = {
    widget_type: 'iframe',
    url: process.env.NEXT_PUBLIC_SIMPLYBOOK_WIDGET_URL,
    theme: 'dainty',
    theme_settings: {
      timeline_show_end_time: '1',
      timeline_hide_unavailable: '1',
      hide_past_days: '0',
      sb_base_color: '#F3D6D8',
      secondary_color: '#FFBFA4',
      sb_text_color: '#757575',
      display_item_mode: 'block',
      body_bg_color: '#FDF3EF',
      sb_background_image: '',
      sb_review_image: '',
      dark_font_color: '#424242',
      light_font_color: '#ffffff',
      sb_company_label_color: '#ffffff',
      sb_cancellation_color: '#EA0050',
      hide_img_mode: '0',
    },
    timeline: 'modern',
    datepicker: 'top_calendar',
    is_rtl: false,
    app_config: {
      allow_switch_to_ada: 0,
      predefined: {
        client: {
          name: user.name,
          email: user.email,
        },
      },
    },
  } as const;

  const headerProps = {
    title: t.rich('title'),
    introduction: t.rich('introduction'),
    imageSrc: illustrationTeaPeach,
    imageAlt: 'alt.personTea',
  };

  const containerStyle = {
    backgroundColor: 'secondary.light',
    textAlign: 'center',
    ...rowStyle,
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  } as const;

  const faqsContainerStyle = {
    maxWidth: '680px !important',
    margin: 'auto',
  } as const;

  const bookingButtonStyle = {
    minWidth: { xs: '100%', sm: 200 },
    marginY: 4,
  } as const;
  const openWidget = () => {
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
        <Box mt={4} textAlign="left">
          <Typography variant="body1" component="p">
            {t.rich('bookingDescription1', {
              strongText: () => <strong>{partnerAccess.therapySessionsRemaining}</strong>,
            })}
          </Typography>
          <Button
            sx={bookingButtonStyle}
            variant="contained"
            color="secondary"
            size="large"
            onClick={openWidget}
          >
            {t.rich('bookingButton')}
          </Button>
        </Box>
        <ImageTextGrid items={steps} translations="TherapyBooking.steps" />
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
          <Button
            sx={bookingButtonStyle}
            variant="contained"
            color="secondary"
            size="large"
            onClick={openWidget}
          >
            {t.rich('bookingButton')}
          </Button>
        </Box>
      </Container>

      {widgetOpen && (
        <Script
          id="widget-js"
          src="//widget.simplybook.it/v2/widget/widget.js"
          onLoad={() => {
            new (window as any).SimplybookWidget(widgetConfig);
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
        ...require(`../messages/shared/${locale}.json`),
        ...require(`../messages/navigation/${locale}.json`),
        ...require(`../messages/therapyBooking/${locale}.json`),
      },
    },
  };
}
TherapyBooking.requireAuth = true;

export default TherapyBooking;
