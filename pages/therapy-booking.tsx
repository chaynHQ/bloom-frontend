import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import type { NextPage } from 'next';
import { GetStaticPropsContext } from 'next';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Script from 'next/script';
import { useState } from 'react';
import Header from '../components/Header';
import illustrationChange from '../public/illustration_change.svg';
import illustrationChooseTherapist from '../public/illustration_choose_therapist.svg';
import illustrationConfidential from '../public/illustration_confidential.svg';
import illustrationDateSelector from '../public/illustration_date_selector.svg';
import illustrationLeafMix from '../public/illustration_leaf_mix.svg';
import illustrationTeaPeach from '../public/illustration_tea_peach.png';
import { rowStyle } from '../styles/common';

interface StepItem {
  text:
    | string
    | React.ReactNodeArray
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  illustrationSrc: StaticImageData;
  illustrationAlt: string;
}

const TherapyBooking: NextPage = () => {
  const t = useTranslations('TherapyBooking');
  const [widgetOpen, setWidgetOpen] = useState(false);

  const steps: Array<StepItem> = [
    {
      text: t('step1'),
      illustrationSrc: illustrationChooseTherapist,
      illustrationAlt: t('illustrationChooseTherapist'),
    },
    {
      text: t('step2'),
      illustrationSrc: illustrationDateSelector,
      illustrationAlt: t('illustrationDateSelector'),
    },
    {
      text: t('step3'),
      illustrationSrc: illustrationChange,
      illustrationAlt: t('illustrationChange'),
    },
    {
      text: t('step4'),
      illustrationSrc: illustrationConfidential,
      illustrationAlt: t('illustrationConfidential'),
    },
  ];

  const widgetConfig = {
    widget_type: 'iframe',
    url: 'https://chayn.simplybook.it',
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
    app_config: { allow_switch_to_ada: 0, predefined: [] },
  } as const;

  const headerProps = {
    title: t.rich('title'),
    introduction: t.rich('introduction'),
    imageSrc: illustrationTeaPeach,
    imageAlt: 'Bloom logo',
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

  const stepsContainerStyle = {
    width: { xs: '100%', md: '50%' },
    display: 'flex',
    flexDirection: 'row',
    flexFlow: 'wrap',
  } as const;

  const stepContainerStyle = {
    position: 'relative',
    width: { xs: '100%', sm: '50%' },
    padding: { xs: 2, md: 2 },
    alignText: 'center',
  } as const;

  const imageContainerStyle = {
    position: 'relative',
    width: 100,
    height: 80,
    marginY: { xs: 2, md: 2 },
    marginX: 'auto',
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
              strongText: (children) => <strong>{children}</strong>,
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
        <Box sx={stepsContainerStyle}>
          {steps.map((step, i) => (
            <Box key={`step${i}`} sx={stepContainerStyle}>
              <Box sx={imageContainerStyle}>
                <Image
                  alt={step.illustrationAlt}
                  src={step.illustrationSrc}
                  layout="fill"
                  objectFit="contain"
                />
              </Box>
              <Typography variant="body1" component="p">
                {step.text}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>

      <Container>
        <Typography variant="h2" component="h2" mb={2} textAlign="center">
          {t.rich('faqHeader')}
        </Typography>
        <Box textAlign="center">
          <Image
            alt={t.raw('illustrationLeafMix')}
            src={illustrationLeafMix}
            width={100}
            height={100}
          />
        </Box>

        <Box sx={faqsContainerStyle}>
          {[...Array(8)].map((x, i) => (
            <Accordion key={`panel${i}`}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel${i}-content`}
                id={`panel${i}-header`}
              >
                <Typography variant="body1" component="h3">
                  {t.rich(`faqTitle${i}`)}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{t.rich(`faqBody${i}`)}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
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

export default TherapyBooking;
