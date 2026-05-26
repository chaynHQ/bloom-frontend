'use client';

import NoDataAvailable from '@/components/common/NoDataAvailable';
import NotesSteps from '@/components/common/NotesSteps';
import RegisterNotesForm from '@/components/forms/RegisterNotesForm';
import WhatsappSubscribeForm from '@/components/forms/WhatsappSubscribeForm';
import WhatsappUnsubscribeForm from '@/components/forms/WhatsappUnsubscribeForm';
import StoryblokPageSection from '@/components/storyblok/StoryblokPageSection';
import { useRouter } from '@/i18n/routing';
import { useGetSubscriptionsUserQuery } from '@/lib/api';
import { useTypedSelector } from '@/lib/hooks/store';
import { getImageSizes } from '@/lib/utils/imageSizes';
import { hasWhatsappSubscription } from '@/lib/utils/whatsappUtils';
import illustrationActivites from '@/public/illustration_activites.svg';
import notesExample from '@/public/notes_example.png';
import { rowStyle } from '@/styles/common';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import SmsFailedOutlined from '@mui/icons-material/SmsFailedOutlined';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  Container,
  IconButton,
  Typography,
} from '@mui/material';
import { ISbStoryData } from '@storyblok/react/rsc';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useMemo } from 'react';
import { backButtonStyle, backIconStyle } from '../layout/Header';

const headerContainerStyle = {
  minHeight: { xs: 220, lg: 360 },
  paddingBottom: { xs: '2.5rem !important', md: '5rem !important' },
  background: {
    xs: 'linear-gradient(180deg, #F3D6D8 53.12%, #FFEAE1 100%)',
    md: 'linear-gradient(180deg, #F3D6D8 36.79%, #FFEAE1 73.59%)',
  },
} as const;

const headerContentStyle = {
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  alignItems: 'center',
  gap: { xs: 4, md: 6 },
  paddingBottom: { xs: 4, md: 6 },
  maxWidth: 1200,
  margin: '0 auto',
  mt: { md: -2.5 },
} as const;

const textContentStyle = {
  flex: 1,
  maxWidth: 700,
} as const;

const illustrationStyle = {
  position: 'relative',
  mt: { xs: 0, md: 6 },
  width: { xs: 200, md: 300 },
  height: { xs: 200, md: 300 },
  flexShrink: 0,
} as const;

const usNoticeStyle = {
  mw: 600,
  mb: 2,
  backgroundColor: 'secondary.light',
  borderRadius: '20px !important',
  boxShadow: '0px 1px 3px 0px rgba(0, 0, 0, 0.12)',
  '&::before': { display: 'none' },
  '& .MuiAccordionSummary-root': {
    py: 1,
    pl: 1,
    borderRadius: 20,
    '&.Mui-expanded': {
      minHeight: 'auto !important',
      margin: '0 !important',
    },
  },
  '& .MuiAccordionSummary-content': {
    margin: '0.5rem !important',
    alignItems: 'flex-start',
  },
  '& .MuiAccordionSummary-expandIconWrapper': {
    marginTop: '2px',
  },
  '& .MuiAccordionDetails-root': {
    pt: 0,
  },
} as const;

const formContainerStyle = {
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  alignItems: { xs: 'center', md: 'flex-start' },
  justifyContent: 'space-between',
  gap: { xs: 4, lg: 6 },
  margin: '0 auto',
} as const;

const formCardStyle = {
  maxWidth: 600,
  marginTop: 0,
} as const;

const howItWorksContainerStyle = {
  backgroundColor: 'secondary.light',
} as const;

const howItWorksContentStyle = {
  ...rowStyle,
  flexDirection: { xs: 'column', sm: 'row' },
  maxWidth: 1000,
  margin: '0 auto',
  gap: { xs: 8, sm: 2, md: 14 },
  paddingTop: { xs: 4, md: 9 },
  alignItems: { xs: 'center', md: 'flex-start' },
  justifyContent: { xs: 'center' },
} as const;

const phoneImageStyle = {
  position: 'relative',
  width: { xs: '85vw', sm: 350, md: 350 },
  height: { xs: 'calc(85vw * 1.6)', sm: 500, md: 580 },
  maxWidth: { xs: 380, sm: '45%', md: 500 },
  maxHeight: 620,
  flex: { md: 1 },
  display: 'flex',
  justifyContent: 'center',
} as const;

interface Props {
  story: ISbStoryData | undefined;
}

export default function NotesPage({ story }: Props) {
  const router = useRouter();

  const userActiveSubscriptions = useTypedSelector((state) => state.user.activeSubscriptions);

  const hasActiveWhatsappSub = useMemo(
    () => hasWhatsappSubscription(userActiveSubscriptions),
    [userActiveSubscriptions],
  );
  const userId = useTypedSelector((state) => state.user.id);

  useGetSubscriptionsUserQuery(undefined, {
    skip: !userId,
  });

  const t = useTranslations('Whatsapp');
  const tS = useTranslations('Shared');

  if (!story) {
    return <NoDataAvailable />;
  }

  const usNotice = (
    <Accordion sx={usNoticeStyle}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <SmsFailedOutlined color="error" sx={{ mr: 1.25, mt: '1px' }} />
        <Typography variant="body1">{t('notes.usNoticeTitle')}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body2">{t('notes.usNoticeDescription')}</Typography>
      </AccordionDetails>
    </Accordion>
  );

  const renderFormSection = () => {
    if (!userId) {
      // Unauthenticated user - show registration form
      return (
        <Box sx={formContainerStyle}>
          <Box sx={illustrationStyle}>
            <Image
              alt={tS('alt.bloomHomeIllustration')}
              src={illustrationActivites}
              fill
              sizes={getImageSizes(illustrationStyle.width)}
              style={{ objectFit: 'contain' }}
            />
          </Box>
          <Box sx={{ maxWidth: 600 }}>
            {usNotice}
            <Card sx={formCardStyle}>
              <CardContent>
                <Typography variant="h2" component="h2">
                  {t('notes.createAccount')}
                </Typography>
                <Typography variant="body2" pb={2}>
                  {t('notes.createAccountDescription')}
                </Typography>
                <RegisterNotesForm />
              </CardContent>
            </Card>
          </Box>
        </Box>
      );
    } else if (!hasActiveWhatsappSub) {
      // Authenticated but not subscribed
      return (
        <Box sx={formContainerStyle}>
          <Box sx={illustrationStyle}>
            <Image
              alt={tS('alt.bloomHomeIllustration')}
              src={illustrationActivites}
              fill
              sizes={getImageSizes(illustrationStyle.width)}
              style={{ objectFit: 'contain' }}
            />
          </Box>
          <Box sx={{ maxWidth: 600 }}>
            {usNotice}
            <Card sx={formCardStyle}>
              <CardContent>
                <Typography variant="h2" component="h2">
                  {t('form.subscribeTitle')}
                </Typography>
                <Typography variant="body2" pb={2}>
                  {t('notes.subscribeDescription')}
                </Typography>
                <WhatsappSubscribeForm />
              </CardContent>
            </Card>
          </Box>
        </Box>
      );
    }

    // Authenticated and subscribed
    return (
      <Box sx={formContainerStyle}>
        <Box sx={illustrationStyle}>
          <Image
            alt={tS('alt.bloomHomeIllustration')}
            src={illustrationActivites}
            fill
            sizes={getImageSizes(illustrationStyle.width)}
            style={{ objectFit: 'contain' }}
          />
        </Box>
        <Box sx={{ maxWidth: 600 }}>
          {usNotice}
          <Card sx={formCardStyle}>
            <CardContent>
              <Typography variant="h2" component="h2">
                {t('form.unsubscribeTitle')}
              </Typography>
              <Typography variant="body2" pb={2}>
                {t('notes.unsubscribeDescription')}
              </Typography>
              <WhatsappUnsubscribeForm />
            </CardContent>
          </Card>
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      <Container sx={headerContainerStyle}>
        <IconButton
          sx={backButtonStyle}
          onClick={() => router.back()}
          aria-label={tS('navigateBack')}
        >
          <KeyboardArrowLeftIcon sx={backIconStyle} />
        </IconButton>
        <Box sx={headerContentStyle}>
          <Box sx={textContentStyle}>
            <Typography variant="h1" component="h1">
              {t('notes.title')}
            </Typography>
            <Typography>{t('notes.description')}</Typography>
          </Box>
        </Box>
        {renderFormSection()}
      </Container>

      <Container sx={howItWorksContainerStyle}>
        <Typography variant="h2" component="h2" textAlign="center">
          {t('notes.howItWorks')}
        </Typography>

        <Box sx={howItWorksContentStyle}>
          <NotesSteps />

          <Box sx={phoneImageStyle}>
            <Image
              alt="Example of Notes from Bloom WhatsApp messages"
              src={notesExample}
              fill
              sizes={getImageSizes(phoneImageStyle.width)}
              style={{ objectFit: 'contain', borderRadius: 16 }}
            />
          </Box>
        </Box>
      </Container>

      {story.content.page_sections?.length > 0 &&
        story.content.page_sections.map((section: any, index: number) => (
          <StoryblokPageSection key={`page_section_${index}`} {...section} isLoggedIn={!!userId} />
        ))}
    </Box>
  );
}
