'use client';

import Faqs from '@/components/common/Faqs';
import ImageTextRow, { ImageTextItem } from '@/components/common/ImageTextRow';
import Header from '@/components/layout/Header';
// import TherapyBookings from '@/components/therapy/TherapyBookings';
import { THERAPY_BOOKING_OPENED, THERAPY_BOOKING_VIEWED } from '@/lib/constants/events';
import { therapyFaqs } from '@/lib/constants/faqs';
import { useTypedSelector } from '@/lib/hooks/store';
import { getSimplybookWidgetConfig } from '@/lib/simplybook';
import { PartnerAccess } from '@/lib/store/partnerAccessSlice';
import logEvent from '@/lib/utils/logEvent';
import illustrationChange from '@/public/illustration_change.svg';
import illustrationChooseTherapist from '@/public/illustration_choose_therapist.svg';
import illustrationConfidential from '@/public/illustration_confidential.svg';
import illustrationDateSelector from '@/public/illustration_date_selector.svg';
import illustrationLeafMix from '@/public/illustration_leaf_mix.svg';
import illustrationPerson4Peach from '@/public/illustration_person4_peach.svg';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Container, IconButton, Modal, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Script from 'next/script';
import { useEffect, useState } from 'react';

const containerStyle = {
  pt: '0 !important',
  backgroundColor: 'secondary.light',
} as const;

const faqsContainerStyle = {
  maxWidth: '680px !important',
  margin: 'auto',
  textAlign: 'center',
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

const placeholderSectionStyle = {
  backgroundColor: 'primary.light',
  minHeight: '300px',
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

export default function BookTherapyPage() {
  const t = useTranslations('Therapy');
  const tS = useTranslations('Shared');
  const [partnerAccess, setPartnerAccess] = useState<PartnerAccess | null>(null);
  const [hasTherapyRemaining, setHasTherapyRemaining] = useState<boolean>(false);
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [widgetError, setWidgetError] = useState<string | null>(null);

  const user = useTypedSelector((state) => state.user);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);

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
    }
  }, [setPartnerAccess, partnerAccesses]);

  useEffect(() => {
    logEvent(THERAPY_BOOKING_VIEWED);
  }, []);

  const headerProps = {
    title: t('title'),
    introduction: `${t.rich('introduction', { partnerName: partnerAccess?.partner?.name as string })}`,
    imageSrc: illustrationPerson4Peach,
    imageAlt: 'alt.personTea',
  };

  const handleOpenWidgetModal = () => {
    logEvent(THERAPY_BOOKING_OPENED);
    setWidgetError(null);
    setIsWidgetModalOpen(true);
  };

  const handleCloseWidgetModal = () => {
    setIsWidgetModalOpen(false);
    setWidgetError(null);
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

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
      } else {
        setWidgetError(t('error.scriptNotLoaded'));
      }
    };

    if (isWidgetModalOpen && isScriptLoaded) {
      initializeWidget();
    } else if (!isWidgetModalOpen) {
      setWidgetError(null);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isWidgetModalOpen, isScriptLoaded, user, t]); // Added t to dependencies

  return (
    <Box>
      <Header
        title={headerProps.title}
        introduction={headerProps.introduction}
        imageSrc={headerProps.imageSrc}
        imageAlt={headerProps.imageAlt}
        cta={
          <Button
            sx={{ mt: -2 }}
            variant="contained"
            color="secondary"
            size="large"
            onClick={handleOpenWidgetModal}
            disabled={!hasTherapyRemaining}
          >
            {t('bookingButton')}
          </Button>
        }
      ></Header>
      <Container sx={containerStyle}>
        {/* <TherapyBookings therapySessionsRemaining={partnerAccess?.therapySessionsRemaining || 0} /> */}
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
        )}
        {!hasTherapyRemaining && partnerAccess && (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            {t('noSessionsRemaining')}
          </Typography>
        )}
      </Container>

      <Container id="therapist-profiles-section" sx={placeholderSectionStyle}>
        <Typography variant="h2" component="h2">
          {t('therapistSectionTitle')}
        </Typography>
      </Container>

      <Container sx={{ backgroundColor: 'background.default', py: 6 }}>
        <Typography variant="h2" component="h2" mb={2} textAlign="center">
          {t('faqHeader')}
        </Typography>
        <Box textAlign="center">
          <Image alt={tS('alt.leafMix')} src={illustrationLeafMix} width={125} height={100} />
        </Box>
        <Box sx={faqsContainerStyle}>
          <Faqs
            faqList={therapyFaqs(tS('feedbackTypeform'))}
            translations="Therapy.faqs"
            partner={partnerAccess?.partner}
          />
        </Box>
      </Container>

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
              <Typography color="error">{widgetError}</Typography>
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
