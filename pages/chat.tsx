import { Box } from '@mui/material';
import { GetStaticPropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { StoriesParams, StoryData } from 'storyblok-js-client';
import { RootState } from '../app/store';
import CrispButton from '../components/crisp/CrispButton';
import Header, { HeaderProps } from '../components/layout/Header';
import StoryblokPageSection from '../components/storyblok/StoryblokPageSection';
import Storyblok, { useStoryblok } from '../config/storyblok';
import { LANGUAGES } from '../constants/enums';
import { useTypedSelector } from '../hooks/store';
import { rowStyle } from '../styles/common';
import { getEventUserData } from '../utils/logEvent';

interface Props {
  story: StoryData;
  preview: boolean;
  sbParams: StoriesParams;
  locale: LANGUAGES;
}

const containerStyle = {
  backgroundColor: 'primary.light',
  textAlign: 'center',
  ...rowStyle,
} as const;

const crispButtonContainerStyle = {
  paddingTop: 4,
  paddingBottom: 1,
  display: 'flex',
} as const;

const Chat: NextPage<Props> = ({ story, preview, sbParams, locale }) => {
  let configuredStory = useStoryblok(story, preview, sbParams, locale);
  const { user, partnerAccesses, partnerAdmin } = useTypedSelector((state: RootState) => state);
  const t = useTranslations('Courses');
  const headerProps: HeaderProps = {
    title: configuredStory.content.title,
    introduction: configuredStory.content.description,
    imageSrc: configuredStory.content.header_image.filename,
    translatedImageAlt: configuredStory.content.header_image.alt,
  };
  const eventUserData = getEventUserData({ user, partnerAccesses, partnerAdmin });

  return (
    <>
      <Head>{headerProps.title}</Head>
      <Box>
        <Header
          {...headerProps}
          cta={
            <CrispButton
              email={user.email}
              eventData={eventUserData}
              buttonText={t('sessionDetail.chat.startButton')}
            />
          }
        />
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

  let { data } = await Storyblok.get(`cdn/stories/chat`, sbParams);
  return {
    props: {
      story: data ? data.story : null,
      preview,
      sbParams: JSON.stringify(sbParams),
      messages: {
        ...require(`../messages/shared/${locale}.json`),
        ...require(`../messages/navigation/${locale}.json`),
        ...require(`../messages/courses/${locale}.json`),
        ...require(`../messages/chat/${locale}.json`),
      },
      locale,
    },
    revalidate: 3600, // revalidate every hour
  };
}

export default Chat;
