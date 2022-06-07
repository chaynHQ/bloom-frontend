import Box from '@mui/material/Box';
import { GetStaticPropsContext, NextPage } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';
import { StoriesParams, StoryData } from 'storyblok-js-client';
import { RootState } from '../app/store';
import Header from '../components/layout/Header';
import StoryblokPageSection from '../components/storyblok/StoryblokPageSection';
import Storyblok, { useStoryblok } from '../config/storyblok';
import { LANGUAGES } from '../constants/enums';
import { ABOUT_COURSES_VIEWED } from '../constants/events';
import { useTypedSelector } from '../hooks/store';
import logEvent, { getEventUserData } from '../utils/logEvent';

interface Props {
  storyData: StoryData;
  preview: boolean;
  sbParams: StoriesParams;
  locale: LANGUAGES;
}

const CourseAbout: NextPage<Props> = ({ storyData, preview, sbParams, locale }) => {
  const story = useStoryblok(storyData, preview, sbParams, locale);
  const { user, partnerAccesses } = useTypedSelector((state: RootState) => state);
  const eventUserData = getEventUserData({ user, partnerAccesses });

  const headerProps = {
    title: story.content.title,
    introduction: story.content.description || '',
    imageSrc: story.content.header_image.filename,
    translatedImageAlt: story.content.header_image.alt,
  };

  useEffect(() => {
    logEvent(ABOUT_COURSES_VIEWED, eventUserData);
  }, []);

  return (
    <Box>
      <Head>
        <title>{story.content.title}</title>
      </Head>
      <Header
        title={headerProps.title}
        introduction={headerProps.introduction}
        imageSrc={headerProps.imageSrc}
        translatedImageAlt={headerProps.translatedImageAlt}
      />
      {story.content.page_sections?.length > 0 &&
        story.content.page_sections.map((section: any, index: number) => (
          <StoryblokPageSection
            key={`page_section_${index}`}
            content={section.content}
            alignment={section.alignment}
            color={section.color}
          />
        ))}
    </Box>
  );
};

export async function getStaticProps({ locale, preview = false }: GetStaticPropsContext) {
  const sbParams = {
    version: preview ? 'draft' : 'published',
    ...(preview && { cv: Date.now() }),
    language: locale,
  };

  let { data } = await Storyblok.get(`cdn/stories/about-our-courses`, sbParams);
  return {
    props: {
      storyData: data && data?.story ? data.story : null,
      preview,
      sbParams: JSON.stringify(sbParams),
      messages: {
        ...require(`../messages/shared/${locale}.json`),
        ...require(`../messages/navigation/${locale}.json`),
      },
      locale,
    },
    revalidate: 3600, // revalidate every hour
  };
}

export default CourseAbout;
