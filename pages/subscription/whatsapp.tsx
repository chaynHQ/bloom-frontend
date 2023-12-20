import { Box, Container } from '@mui/material';
import { GetStaticPropsContext, NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { SignUpBanner } from '../../components/banner/SignUpBanner';
import ImageTextColumn from '../../components/common/ImageTextColumn';
import { ImageTextItem } from '../../components/common/ImageTextGrid';
import WhatsappSubscribeForm from '../../components/forms/WhatsappSubscribeForm';
import WhatsappUnsubscribeForm from '../../components/forms/WhatsappUnsubscribeForm';
import Header, { HeaderProps } from '../../components/layout/Header';
import StoryblokPageSection from '../../components/storyblok/StoryblokPageSection';
import { useTypedSelector } from '../../hooks/store';
import illustrationChange from '../../public/illustration_change.svg';
import illustrationChooseTherapist from '../../public/illustration_choose_therapist.svg';
import illustrationDateSelector from '../../public/illustration_date_selector.svg';

import { ISbStoryData, useStoryblokState } from '@storyblok/react';
import NoDataAvailable from '../../components/common/NoDataAvailable';
import { rowStyle } from '../../styles/common';
import { getStoryblokPageProps } from '../../utils/getStoryblokPageProps';
import { hasWhatsappSubscription } from '../../utils/whatsappUtils';

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
  story = useStoryblokState(story);

  const [hasActiveWhatsappSub, setHasActiveWhatsappSub] = useState<boolean>(false);

  const userActiveSubscriptions = useTypedSelector((state) => state.user.activeSubscriptions);
  const userToken = useTypedSelector((state) => state.user.token);

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
      <Head>{story.content.title}</Head>
      <Box>
        <Header {...headerProps} />
        {!userToken && <SignUpBanner />}
        {userToken && (
          <Container sx={containerStyle}>
            <Box sx={infoBoxStyle}>
              <ImageTextColumn items={steps} translations="Whatsapp.steps" />
            </Box>
            <Box sx={formContainerStyle}>
              {hasActiveWhatsappSub ? <WhatsappUnsubscribeForm /> : <WhatsappSubscribeForm />}
            </Box>
          </Container>
        )}
        {userToken &&
          story.content.page_sections?.length > 0 &&
          story.content.page_sections.map((section: any, index: number) => (
            <StoryblokPageSection
              key={`page_section_${index}`}
              content={section.content}
              alignment={section.alignment}
              color={section.color}
            />
          ))}
      </Box>
    </>
  );
};

export async function getStaticProps({ locale, preview = false }: GetStaticPropsContext) {
  const storyblokProps = await getStoryblokPageProps(`subscription/whatsapp`, locale, preview);

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
