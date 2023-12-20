import { Box } from '@mui/material';
import { ISbStoryData, useStoryblokState } from '@storyblok/react';
import { GetStaticPropsContext, NextPage } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';
import NoDataAvailable from '../components/common/NoDataAvailable';
import Header from '../components/layout/Header';
import StoryblokPageSection from '../components/storyblok/StoryblokPageSection';
import { ABOUT_COURSES_VIEWED } from '../constants/events';
import { useTypedSelector } from '../hooks/store';
import { getStoryblokPageProps } from '../utils/getStoryblokPageProps';
import logEvent, { getEventUserData } from '../utils/logEvent';

interface Props {
  story: ISbStoryData | null;
}

const CourseAbout: NextPage<Props> = ({ story }) => {
  story = useStoryblokState(story);

  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);
  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);

  useEffect(() => {
    logEvent(ABOUT_COURSES_VIEWED, eventUserData);
  });

  if (!story) {
    return <NoDataAvailable />;
  }

  const headerProps = {
    title: story.content.title,
    introduction: story.content.description || '',
    imageSrc: story.content.header_image.filename,
    translatedImageAlt: story.content.header_image.alt,
  };

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
  const storyblokProps = await getStoryblokPageProps('about-our-courses', locale, preview);

  return {
    props: {
      ...storyblokProps,
      messages: {
        ...require(`../messages/shared/${locale}.json`),
        ...require(`../messages/navigation/${locale}.json`),
      },
    },
    revalidate: 3600, // revalidate every hour
  };
}

export default CourseAbout;
