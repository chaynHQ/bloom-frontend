import { Box, Container } from '@mui/material';
import { GetStaticPropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { StoriesParams, StoryData } from 'storyblok-js-client';
import ImageTextColumn from '../../components/common/ImageTextColumn';
import { ImageTextItem } from '../../components/common/ImageTextGrid';
import WhatsappForm from '../../components/forms/WhatsappForm';
import Header, { HeaderProps } from '../../components/layout/Header';
import StoryblokPageSection from '../../components/storyblok/StoryblokPageSection';
import Storyblok, { useStoryblok } from '../../config/storyblok';
import { LANGUAGES } from '../../constants/enums';
import illustrationChange from '../../public/illustration_change.svg';
import illustrationChooseTherapist from '../../public/illustration_choose_therapist.svg';
import illustrationDateSelector from '../../public/illustration_date_selector.svg';

import { rowStyle } from '../../styles/common';

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
  story: StoryData;
  preview: boolean;
  sbParams: StoriesParams;
  locale: LANGUAGES;
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

const ManageWhatsappSubscription: NextPage<Props> = ({ story, preview, sbParams, locale }) => {
  let configuredStory = useStoryblok(story, preview, sbParams, locale);

  const t = useTranslations('Whatsapp');

  const headerProps: HeaderProps = {
    title: configuredStory.content.title,
    introduction: configuredStory.content.description,
    imageSrc: configuredStory.content.header_image.filename,
    translatedImageAlt: configuredStory.content.header_image.alt,
  };

  return (
    <>
      <Head>{configuredStory.content.title}</Head>
      <Box>
        <Header {...headerProps} />
        <Container sx={containerStyle}>
          <Box sx={infoBoxStyle}>
            <ImageTextColumn items={steps} translations="Whatsapp.steps" />
          </Box>
          <Box sx={formContainerStyle}>
            <WhatsappForm />
          </Box>
        </Container>
        {configuredStory.content.page_sections?.length > 0 &&
          configuredStory.content.page_sections.map((section: any, index: number) => (
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
  let sbParams = {
    version: preview ? 'draft' : 'published',
    language: locale,
    ...(preview && { cv: Date.now() }),
  };

  let { data } = await Storyblok.get(`cdn/stories/subscription/whatsapp`, sbParams);

  return {
    props: {
      story: data ? data.story : null,
      preview,
      sbParams: JSON.stringify(sbParams),
      messages: {
        ...require(`../../messages/shared/${locale}.json`),
        ...require(`../../messages/navigation/${locale}.json`),
        ...require(`../../messages/whatsapp/${locale}.json`),
      },
      locale,
    },
    revalidate: 3600, // revalidate every hour
  };
}

export default ManageWhatsappSubscription;
