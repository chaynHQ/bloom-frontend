import { SignUpBanner } from '@/components/banner/SignUpBanner';
import ImageTextColumn from '@/omponents/common/ImageTextColumn';
import { ImageTextItem } from '@/omponents/common/ImageTextGrid';
import WhatsappSubscribeForm from '@/omponents/forms/WhatsappSubscribeForm';
import WhatsappUnsubscribeForm from '@/omponents/forms/WhatsappUnsubscribeForm';
import Header, { HeaderProps } from '@/omponents/layout/Header';
import StoryblokPageSection from '@/omponents/storyblok/StoryblokPageSection';
import { useTypedSelector } from '@/ooks/store';
import illustrationChange from '@/ublic/illustration_change.svg';
import illustrationChooseTherapist from '@/ublic/illustration_choose_therapist.svg';
import illustrationDateSelector from '@/ublic/illustration_date_selector.svg';
import { Box, Container } from '@mui/material';
import { GetStaticPropsContext, NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';

import NoDataAvailable from '@/omponents/common/NoDataAvailable';
import { getStoryblokPageProps } from '@/tils/getStoryblokPageProps';
import { hasWhatsappSubscription } from '@/tils/whatsappUtils';
import { rowStyle } from '@/tyles/common';
import { ISbStoryData } from '@storyblok/react/rsc';

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

interface Props {
  story: ISbStoryData | null;
}

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

const ManageWhatsappSubscription: NextPage<Props> = ({ story }) => {
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
};

export async function getStaticProps({ locale, preview = false }: GetStaticPropsContext) {
  const storyblokProps = await getStoryblokPageProps(`subscription/whatsapp`, locale);

  return {
    props: {
      ...storyblokProps,
      messages: {
        ...require(`../../messages/shared/${locale}.json`),
        ...require(`../../messages/navigation/${locale}.json`),
        ...require(`../../messages/whatsapp/${locale}.json`),
      },
    },
    revalidate: 3600, // revalidate every hour
  };
}

export default ManageWhatsappSubscription;
