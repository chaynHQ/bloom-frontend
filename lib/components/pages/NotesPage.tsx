'use client';

import { SignUpBanner } from '@/lib/components/banner/SignUpBanner';
import ImageTextColumn from '@/lib/components/common/ImageTextColumn';
import { ImageTextItem } from '@/lib/components/common/ImageTextGrid';
import WhatsappSubscribeForm from '@/lib/components/forms/WhatsappSubscribeForm';
import WhatsappUnsubscribeForm from '@/lib/components/forms/WhatsappUnsubscribeForm';
import Header, { HeaderProps } from '@/lib/components/layout/Header';
import StoryblokPageSection from '@/lib/components/storyblok/StoryblokPageSection';
import { useTypedSelector } from '@/lib/hooks/store';
import illustrationChange from '@/public/illustration_change.svg';
import illustrationChooseTherapist from '@/public/illustration_choose_therapist.svg';
import illustrationDateSelector from '@/public/illustration_date_selector.svg';
import { Box, Container } from '@mui/material';
import { ISbStoryData } from '@storyblok/react/rsc';
import Head from 'next/head';
import { useEffect, useState } from 'react';

import NoDataAvailable from '@/lib/components/common/NoDataAvailable';
import { hasWhatsappSubscription } from '@/lib/utils/whatsappUtils';
import { rowStyle } from '@/styles/common';

const containerStyle = {
  backgroundColor: 'secondary.light',
  textAlign: 'center',
  ...rowStyle,
} as const;

const infoBoxStyle = {
  maxWidth: 400,
};

const formContainerStyle = {
  width: { xs: '100%', sm: '70%', md: '47%' },
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
];

interface Props {
  story: ISbStoryData | undefined;
}

export default function NotesPage({ story }: Props) {
  const [hasActiveWhatsappSub, setHasActiveWhatsappSub] = useState<boolean>(false);

  const userActiveSubscriptions = useTypedSelector((state) => state.user.activeSubscriptions);
  const userId = useTypedSelector((state) => state.user.id);

  useEffect(() => {
    setHasActiveWhatsappSub(hasWhatsappSubscription(userActiveSubscriptions));
  }, [userActiveSubscriptions]);

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
    <>
      <Head>
        <title>{`${story.content.title} • Bloom`}</title>
        <meta property="og:title" content={story.content.title} key="og-title" />
        {story.content.seo_description && (
          <>
            <meta name="description" content={story.content.seo_description} key="description" />
            <meta
              property="og:description"
              content={story.content.seo_description}
              key="og-description"
            />
          </>
        )}
      </Head>
      <Box>
        <Header {...headerProps} />
        {!userId && <SignUpBanner />}
        {userId && (
          <Container sx={containerStyle}>
            <Box sx={infoBoxStyle}>
              <ImageTextColumn items={steps} translations="Whatsapp.steps" />
            </Box>
            <Box sx={formContainerStyle}>
              {hasActiveWhatsappSub ? <WhatsappUnsubscribeForm /> : <WhatsappSubscribeForm />}
            </Box>
          </Container>
        )}
        {userId &&
          story.content.page_sections?.length > 0 &&
          story.content.page_sections.map((section: any, index: number) => (
            <StoryblokPageSection key={`page_section_${index}`} {...section} />
          ))}
      </Box>
    </>
  );
}
