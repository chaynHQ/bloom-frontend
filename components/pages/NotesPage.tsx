'use client';

import RegisterNotesForm from '@/components/forms/RegisterNotesForm';
import WhatsappSubscribeForm from '@/components/forms/WhatsappSubscribeForm';
import WhatsappUnsubscribeForm from '@/components/forms/WhatsappUnsubscribeForm';
import StoryblokPageSection from '@/components/storyblok/StoryblokPageSection';
import { useGetSubscriptionsUserQuery } from '@/lib/api';
import { useTypedSelector } from '@/lib/hooks/store';
import { getImageSizes } from '@/lib/utils/imageSizes';
import { hasWhatsappSubscription } from '@/lib/utils/whatsappUtils';
import illustrationBloomHeadYellow from '@/public/illustration_bloom_head_yellow.svg';
import illustrationChange from '@/public/illustration_change.svg';
import illustrationChooseTherapist from '@/public/illustration_choose_therapist.svg';
import illustrationDateSelector from '@/public/illustration_date_selector.svg';
import notesExample from '@/public/notes_example.jpeg';
import { Box, Card, CardContent, Container, Typography } from '@mui/material';
import { ISbStoryData } from '@storyblok/react/rsc';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import NoDataAvailable from '@/components/common/NoDataAvailable';
const headerContainerStyle = {
  minHeight: { xs: 220, lg: 360 },
  paddingBottom: { xs: '2.5rem !important', md: '5rem !important' },
  paddingTop: { xs: '0', md: '6.5rem ' },
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
} as const;

const textContentStyle = {
  flex: 1,
  maxWidth: '700px',
} as const;

const illustrationStyle = {
  position: 'relative',
  width: { xs: 200, md: 280 },
  height: { xs: 200, md: 280 },
  flexShrink: 0,
} as const;

const formContainerStyle = {
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  alignItems: { xs: 'center', md: 'flex-end' },
  gap: { xs: 4, md: 6 },
  margin: '0 auto',
} as const;

const formCardStyle = {
  marginTop: 0,
} as const;

const howItWorksStyle = {
  backgroundColor: 'background.default',
} as const;

const howItWorksContentStyle = {
  maxWidth: 1200,
  margin: '0 auto',
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  gap: { xs: 4, md: 6 },
  paddingTop: { xs: 4, md: 6 },
  alignItems: { xs: 'flex-start', md: 'flex-start' },
} as const;

const stepsContainerStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
} as const;

const stepStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 2,
} as const;

const stepIconContainerStyle = {
  width: 60,
  height: 60,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  position: 'relative',
} as const;

const phoneImageStyle = {
  position: 'relative',
  width: { xs: 280, md: 320 },
  height: { xs: 400, md: 450 },
  flexShrink: 0,
} as const;

interface Props {
  story: ISbStoryData | undefined;
}

export default function NotesPage({ story }: Props) {
  const [hasActiveWhatsappSub, setHasActiveWhatsappSub] = useState<boolean>(false);

  const userActiveSubscriptions = useTypedSelector((state) => state.user.activeSubscriptions);
  const userId = useTypedSelector((state) => state.user.id);

  const { data: subscriptions } = useGetSubscriptionsUserQuery(undefined, {
    skip: !userId,
  });

  const t = useTranslations('Whatsapp');
  const tS = useTranslations('Shared');

  useEffect(() => {
    setHasActiveWhatsappSub(hasWhatsappSubscription(userActiveSubscriptions));
  }, [userActiveSubscriptions]);

  if (!story) {
    return <NoDataAvailable />;
  }

  const headerProps = {
    title: story.content.title,
    introduction: story.content.description,
    imageSrc: story.content.header_image?.filename,
    translatedImageAlt: story.content.header_image?.alt,
  };

  const renderFormSection = () => {
    if (!userId) {
      // Unauthenticated user - show registration form
      return (
        <Box sx={formContainerStyle}>
          <Box sx={illustrationStyle}>
            <Image
              alt={tS('alt.bloomHomeIllustration')}
              src={illustrationBloomHeadYellow}
              fill
              sizes={getImageSizes(illustrationStyle.width)}
              style={{ objectFit: 'contain' }}
            />
          </Box>
          <Card sx={formCardStyle}>
            <CardContent>
              <Typography variant="h2" component="h2" mb={2}>
                {t('notes.createAccount')}
              </Typography>
              <Typography mb={3}>{t('notes.createAccountDescription')}</Typography>
              <RegisterNotesForm />
            </CardContent>
          </Card>
        </Box>
      );
    } else if (!hasActiveWhatsappSub) {
      // Authenticated but not subscribed
      return (
        <Box sx={formContainerStyle}>
          <Box sx={illustrationStyle}>
            <Image
              alt={tS('alt.bloomHomeIllustration')}
              src={illustrationBloomHeadYellow}
              fill
              sizes={getImageSizes(illustrationStyle.width)}
              style={{ objectFit: 'contain' }}
            />
          </Box>
          <Card sx={formCardStyle}>
            <CardContent>
              <Typography variant="h2" component="h2" mb={2}>
                {t('form.subscribeTitle')}
              </Typography>
              <Typography mb={3}>{t('notes.subscribeDescription')}</Typography>
              <WhatsappSubscribeForm />
            </CardContent>
          </Card>
        </Box>
      );
    }

    // Authenticated and subscribed
    return (
      <Box sx={formContainerStyle}>
        <Box sx={illustrationStyle}>
          <Image
            alt={tS('alt.bloomHomeIllustration')}
            src={illustrationBloomHeadYellow}
            fill
            sizes={getImageSizes(illustrationStyle.width)}
            style={{ objectFit: 'contain' }}
          />
        </Box>
        <Card sx={formCardStyle}>
          <CardContent>
            <Typography variant="h2" component="h2" mb={2}>
              {t('form.unsubscribeTitle')}
            </Typography>
            <Typography mb={3}>{t('notes.unsubscribeDescription')}</Typography>
            <WhatsappUnsubscribeForm />
          </CardContent>
        </Card>
      </Box>
    );
  };

  return (
    <Box>
      <Container sx={headerContainerStyle}>
        <Box sx={headerContentStyle}>
          <Box sx={textContentStyle}>
            <Typography variant="h1" component="h1" mb={2}>
              {t('notes.title')}
            </Typography>
            <Typography>{t('notes.description')}</Typography>
          </Box>
        </Box>
        {renderFormSection()}
      </Container>

      <Container sx={howItWorksStyle}>
        <Typography variant="h2" component="h2" mb={4} textAlign="center">
          {t('notes.howItWorks')}
        </Typography>

        <Box sx={howItWorksContentStyle}>
          <Box sx={stepsContainerStyle}>
            <Box sx={stepStyle}>
              <Box sx={stepIconContainerStyle}>
                <Image
                  alt={tS('alt.chooseTherapist')}
                  src={illustrationChooseTherapist}
                  fill
                  sizes={getImageSizes(stepIconContainerStyle.width)}
                  style={{ objectFit: 'contain' }}
                />
              </Box>
              <Typography>{t('notes.step1')}</Typography>
            </Box>

            <Box sx={stepStyle}>
              <Box sx={stepIconContainerStyle}>
                <Image
                  alt={tS('alt.dateSelector')}
                  src={illustrationDateSelector}
                  fill
                  sizes={getImageSizes(stepIconContainerStyle.width)}
                  style={{ objectFit: 'contain' }}
                />
              </Box>
              <Typography>{t('notes.step2')}</Typography>
            </Box>

            <Box sx={stepStyle}>
              <Box sx={stepIconContainerStyle}>
                <Image
                  alt={tS('alt.personTea')}
                  src={illustrationChange}
                  fill
                  sizes={getImageSizes(stepIconContainerStyle.width)}
                  style={{ objectFit: 'contain' }}
                />
              </Box>
              <Typography>{t('notes.step3')}</Typography>
            </Box>

            <Box sx={stepStyle}>
              <Box sx={stepIconContainerStyle}>
                <Image
                  alt={tS('alt.change')}
                  src={illustrationChange}
                  fill
                  sizes={getImageSizes(stepIconContainerStyle.width)}
                  style={{ objectFit: 'contain' }}
                />
              </Box>
              <Typography>{t('notes.step4')}</Typography>
            </Box>
          </Box>

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

      {userId &&
        story.content.page_sections?.length > 0 &&
        story.content.page_sections.map((section: any, index: number) => (
          <StoryblokPageSection key={`page_section_${index}`} {...section} />
        ))}
    </Box>
  );
}
