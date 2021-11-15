import EventIcon from '@mui/icons-material/Event';
import LanguageIcon from '@mui/icons-material/Language';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import ScheduleIcon from '@mui/icons-material/Schedule';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import type { NextPage } from 'next';
import { GetStaticPropsContext } from 'next';
import { useTranslations } from 'next-intl';
import Script from 'next/script';
import { useState } from 'react';
import Header from '../components/Header';
import illustrationTeaPeach from '../public/illustration_tea_peach.png';
// import Image from 'next/image';

const TherapyBooking: NextPage = () => {
  const t = useTranslations('TherapyBooking');
  const [widgetOpen, setWidgetOpen] = useState(false);

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
  } as const;

  const stepsContainerStyle = {
    display: 'flex',
    flexDirection: 'row',
    flexFlow: 'wrap',
  } as const;

  const stepContainerStyle = {
    position: 'relative',
    width: { xs: '100%', md: '25%' },
    padding: { xs: 2, md: 4 },
    alignText: 'center',
  } as const;

  const stepIconStyle = {
    fontSize: 50,
    marginBottom: { xs: 1, md: 2 },
  } as const;

  // const imageContainerStyle = {
  //   position: 'relative',
  //   width: 100,
  //   height: 80,
  //   marginY: { xs: 2, md: 2 },
  //   marginX: { xs: 'unset', md: 'auto' },
  // } as const;

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
        <Typography variant="body1" component="p">
          {t.rich('bookingDescription1', {
            strongText: (children) => <strong>{children}</strong>,
          })}
        </Typography>
        <Button
          sx={{ mb: 4, mt: 4 }}
          variant="contained"
          color="secondary"
          size="large"
          onClick={openWidget}
        >
          {t.rich('bookingButton')}
        </Button>
        <Box sx={stepsContainerStyle}>
          <Box sx={stepContainerStyle}>
            {/* <Box sx={imageContainerStyle}>
              <Image
                alt={t.raw('illustrationHorizontalLeaf')}
                src={illustrationHorizontalLeaf}
                layout="fill"
                objectFit="contain"
              />
            </Box> */}
            <LanguageIcon sx={stepIconStyle} color="secondary" />
            <Typography variant="body1" component="p">
              {t.rich('step1')}
            </Typography>
          </Box>
          <Box sx={stepContainerStyle}>
            <PersonPinIcon sx={stepIconStyle} color="secondary" />
            <Typography variant="body1" component="p">
              {t.rich('step2')}
            </Typography>
          </Box>
          <Box sx={stepContainerStyle}>
            <ScheduleIcon sx={stepIconStyle} color="secondary" />
            <Typography variant="body1" component="p">
              {t.rich('step3')}
            </Typography>
          </Box>
          <Box sx={stepContainerStyle}>
            <EventIcon sx={stepIconStyle} color="secondary" />
            <Typography variant="body1" component="p">
              {t.rich('step4')}
            </Typography>
          </Box>
        </Box>
        {widgetOpen && (
          <Script
            id="widget-js"
            src="//widget.simplybook.it/v2/widget/widget.js"
            onLoad={() => {
              new (window as any).SimplybookWidget(widgetConfig);
            }}
          />
        )}
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

export default TherapyBooking;
