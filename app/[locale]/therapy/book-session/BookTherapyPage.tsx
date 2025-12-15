'use client';

import ImageTextRow, { ImageTextItem } from '@/components/common/ImageTextRow';
import NoDataAvailable from '@/components/common/NoDataAvailable';
import Header, { HeaderProps } from '@/components/layout/Header';
import StoryblokPageSection from '@/components/storyblok/StoryblokPageSection';
import TherapyBookings from '@/components/therapy/TherapyBookings';
import { THERAPY_BOOKING_OPENED, THERAPY_BOOKING_VIEWED } from '@/lib/constants/events';
import { useTypedSelector } from '@/lib/hooks/store';
import { getSimplybookWidgetConfig } from '@/lib/simplybook';
import { PartnerAccess } from '@/lib/store/partnerAccessSlice';
import logEvent from '@/lib/utils/logEvent';
import illustrationChange from '@/public/illustration_change.svg';
import illustrationChooseTherapist from '@/public/illustration_choose_therapist.svg';
import illustrationConfidential from '@/public/illustration_confidential.svg';
import illustrationDateSelector from '@/public/illustration_date_selector.svg';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Container, IconButton, Modal, Typography } from '@mui/material';
import { ISbStoryData } from '@storyblok/react/rsc';
import { useTranslations } from 'next-intl';
import Script from 'next/script';
import { useEffect, useState } from 'react';

const containerStyle = {
  pt: '0 !important',
  backgroundColor: 'secondary.light',
} as const;

const bookingButtonStyle = {
  minWidth: 200,
  marginY: 4,
} as const;

const bookingSectionStyle = {
  backgroundColor: 'background.default',
  textAlign: 'center',
  paddingTop: 4,
  paddingBottom: 4,
} as const;

const modalStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
} as const;

const modalContentBoxStyle = {
  position: 'relative',
  width: '95%',
  height: '90vh',
  maxWidth: '1000px',
  maxHeight: '800px',
  bgcolor: 'background.default',
  boxShadow: 24,
  borderRadius: 2,
  p: 0,
  overflow: 'hidden',
  border: 'none',
  outline: 'none',
  display: 'flex',
  flexDirection: 'column',
} as const;

const widgetContainerStyle = {
  flexGrow: 1,
  width: '100%',
  height: '100%',
  overflowY: 'auto',
  overflowX: 'hidden',
  mt: 8,
  '& iframe': {
    width: '100%',
    border: 'none',
    display: 'block',
  },
} as const;

const modalTitleStyle = {
  position: 'absolute',
  top: 10,
  right: 0,
  left: 0,
  marginInline: 'auto',
  width: 'fit-content',
} as const;

const closeButtonStyle = {
  position: 'absolute',
  top: 20,
  right: 20,
  zIndex: 1301,
  color: 'grey.700',
  backgroundColor: 'rgba(255, 255, 255, 0.7)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
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

interface Props {
  story: ISbStoryData | undefined;
}

export default function BookTherapyPage({ story }: Props) {
  const t = useTranslations('Therapy');
  const [partnerAccess, setPartnerAccess] = useState<PartnerAccess | null>(null);
  const [hasTherapyRemaining, setHasTherapyRemaining] = useState<boolean>(false);
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [widgetError, setWidgetError] = useState<string | null>(null);

  const user = useTypedSelector((state) => state.user);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);

  function replacePartnerName(partnerName: string) {
    const accordionDetailsElements = document.querySelectorAll('.MuiAccordionDetails-root');
    const introductionElement: HTMLParagraphElement | null = document.querySelector('h1 + p');

    accordionDetailsElements.forEach((detailsElement) => {
      const paragraphElements = detailsElement.querySelectorAll('p');

      const allElementsToProcess = [...paragraphElements];
      if (introductionElement) {
        allElementsToProcess.push(introductionElement);
      }

      allElementsToProcess.forEach((element) => {
        if (!element) return;

        // Use innerHTML to preserve embedded HTML elements
        const currentHtml = element.innerHTML;

        // Replace all instances of '{partnerName}' with the provided partnerName
        const escapedPartnerName = partnerName.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const newHtml = currentHtml.replace(/\{partnerName\}/g, escapedPartnerName);

        element.innerHTML = newHtml;
      });
    });
  }

  useEffect(() => {
    let currentPartnerAccess = partnerAccesses.find(
      (pa) => pa.featureTherapy === true && pa.therapySessionsRemaining > 0,
    );
    if (currentPartnerAccess) {
      setHasTherapyRemaining(true);
    } else {
      const redeemedAccesses = partnerAccesses.filter(
        (pa) => !!pa.featureTherapy && pa.therapySessionsRedeemed > 0,
      );
      currentPartnerAccess = redeemedAccesses[redeemedAccesses.length - 1];
    }

    if (currentPartnerAccess?.partner.name) {
      setPartnerAccess(currentPartnerAccess);
      replacePartnerName(currentPartnerAccess?.partner.name);
    }
  }, [setPartnerAccess, partnerAccesses]);

  useEffect(() => {
    logEvent(THERAPY_BOOKING_VIEWED);
  }, []);

  const handleOpenWidgetModal = () => {
    logEvent(THERAPY_BOOKING_OPENED);
    setWidgetError(null);
    setIsWidgetModalOpen(true);

    // Trigger script loading if not already loaded
    if (!isScriptLoaded && typeof (window as any).SimplybookWidget === 'undefined') {
      const existingScript = document.getElementById('widget-js');
      if (existingScript) {
        existingScript.remove();
      }
      // Re-create script to force immediate loading
      const script = document.createElement('script');
      script.id = 'widget-js-immediate';
      script.src = '//widget.simplybook.it/v2/widget/widget.js';
      script.onload = () => setIsScriptLoaded(true);
      script.onerror = () => {
        console.error('Failed to load Simplybook widget script immediately');
        setWidgetError(t('error.scriptLoadFailed'));
      };
      document.head.appendChild(script);
    }
  };

  const handleCloseWidgetModal = () => {
    setIsWidgetModalOpen(false);
    setWidgetError(null);
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    let retryCount = 0;
    const maxRetries = 5;

    const initializeWidget = () => {
      if (typeof (window as any).SimplybookWidget === 'function') {
        const container = document.getElementById('simplybook-widget-container');
        if (container) {
          container.innerHTML = '';
          setWidgetError(null);
          try {
            new (window as any).SimplybookWidget(getSimplybookWidgetConfig(user));
          } catch (error) {
            setWidgetError(t('error.initializingWidget'));
          }
        } else {
          timeoutId = setTimeout(() => {
            const containerRetry = document.getElementById('simplybook-widget-container');
            if (containerRetry) {
              containerRetry.innerHTML = '';
              setWidgetError(null);
              try {
                new (window as any).SimplybookWidget(getSimplybookWidgetConfig(user));
              } catch (error) {
                setWidgetError(t('error.initializingWidgetRetry'));
              }
            } else {
              console.error('Simplybook widget container not found after retry.');
              setWidgetError(t('error.containerNotFoundRetry'));
            }
          }, 1000);
        }
      } else if (retryCount < maxRetries && isWidgetModalOpen) {
        // Script not loaded yet, retry with exponential backoff
        retryCount++;
        timeoutId = setTimeout(
          () => {
            initializeWidget();
          },
          Math.min(1000 * Math.pow(2, retryCount - 1), 5000),
        );
      } else {
        setWidgetError(t('error.scriptNotLoaded'));
      }
    };

    if (isWidgetModalOpen) {
      initializeWidget();
    } else {
      setWidgetError(null);
      retryCount = 0;
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isWidgetModalOpen, isScriptLoaded, user, t]); // Added t to dependencies

  if (!story) {
    return <NoDataAvailable />;
  }

  const headerProps: HeaderProps = {
    title: story.content.title,
    introduction: story.content.description,
    imageSrc: story.content.header_image.filename,
    translatedImageAlt: story.content.header_image.alt,
  };

  return (
    <Box>
      <Header
        {...headerProps}
        cta={
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={handleOpenWidgetModal}
            disabled={!hasTherapyRemaining}
          >
            {t('bookingButton')}
          </Button>
        }
      />
      <Container sx={containerStyle}>
        {partnerAccess && <TherapyBookings partnerAccess={partnerAccess} />}
      </Container>

      <Container id="booking-steps-section" sx={bookingSectionStyle} maxWidth="md">
        <Typography variant="h2" component="h2" gutterBottom>
          {t('bookingSectionTitle')}
        </Typography>
        <Box my={3}>
          <ImageTextRow items={steps} translations="Therapy.steps" />
        </Box>
        {hasTherapyRemaining && (
          <Button
            sx={bookingButtonStyle}
            variant="contained"
            color="secondary"
            size="large"
            onClick={handleOpenWidgetModal}
          >
            {t('bookingButton')}
          </Button>
        )}{' '}
      </Container>

      {story.content.page_sections?.length > 0 &&
        story.content.page_sections.map((section: any, index: number) => (
          <StoryblokPageSection key={`page_section_${index}`} {...section} isLoggedIn={!!user.id} />
        ))}

      <Modal
        open={isWidgetModalOpen}
        onClose={handleCloseWidgetModal}
        aria-labelledby="simplybook-widget-modal-title"
        aria-describedby="simplybook-widget-modal-description"
        sx={modalStyle}
      >
        <Box sx={modalContentBoxStyle}>
          <IconButton
            aria-label={t('closeBookingWidget')}
            onClick={handleCloseWidgetModal}
            sx={closeButtonStyle}
          >
            <CloseIcon />
          </IconButton>
          <Typography id="simplybook-widget-modal-title" variant="h3" sx={modalTitleStyle} mt={2}>
            {t('modalTitle')}
          </Typography>
          <Typography
            id="simplybook-widget-modal-description"
            sx={{ position: 'absolute', left: '-9999px' }}
          >
            {t('modalDescription')}
          </Typography>

          {widgetError && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography id="simplybook-widget-error" color="error">
                {widgetError}
              </Typography>
            </Box>
          )}

          <Box id="simplybook-widget-container" sx={widgetContainerStyle}></Box>
        </Box>
      </Modal>

      <Script
        id="widget-js"
        src="//widget.simplybook.it/v2/widget/widget.js"
        strategy="lazyOnload"
        onLoad={() => {
          setIsScriptLoaded(true);
        }}
        onError={(e) => {
          console.error('Failed to load Simplybook widget script:', e);
          setIsScriptLoaded(false);
          setWidgetError(t('error.scriptLoadFailed'));
        }}
      />
    </Box>
  );
}
