import { Box, Container, Typography } from '@mui/material';
import { ISbStoryData, useStoryblokState } from '@storyblok/react';
import { GetStaticPropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import Image from 'next/image';
import { SignUpBanner } from '../components/banner/SignUpBanner';
import NoDataAvailable from '../components/common/NoDataAvailable';
import { CrispIframe } from '../components/crisp/CrispIframe';
import Header, { HeaderProps } from '../components/layout/Header';
import StoryblokPageSection from '../components/storyblok/StoryblokPageSection';
import { useTypedSelector } from '../hooks/store';
import IllustrationCourseDBR from '../public/illustration_course_dbr.svg';
import { rowStyle } from '../styles/common';
import { getStoryblokPageProps } from '../utils/getStoryblokPageProps';

const messageRowStyle = {
  ...rowStyle,
  flexDirection: { xs: 'column', md: 'row' },
  gap: { xs: '2rem', md: '10%' },
} as const;

const imageContainerStyle = {
  position: 'relative', // needed for next/image to fill the container
  width: { xs: '40%', md: 260 },
  height: { xs: '40%', md: 260 },
} as const;

interface Props {
  story: ISbStoryData | null;
}

const Message: NextPage<Props> = ({ story }) => {
  story = useStoryblokState(story);

  const t = useTranslations('Messaging');
  const tS = useTranslations('Shared');
  const userId = useTypedSelector((state) => state.user.id);

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
            <meta
              property="description"
              content={story.content.seo_description}
              key="description"
            />
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
        {userId ? (
          <>
            <Container sx={{ backgroundColor: 'secondary.light', pt: 2 }}>
              <Typography variant="h2" sx={{ mb: { xs: 4, md: 8 } }}>
                {t('messageHeading')}
              </Typography>
              <Box sx={messageRowStyle}>
                <Box sx={imageContainerStyle}>
                  <Image
                    alt={tS('alt.personSitting')}
                    src={IllustrationCourseDBR}
                    sizes="50vw"
                    style={{
                      width: '100%',
                      height: 'auto',
                    }}
                  />
                </Box>
                <Box flex={1}>
                  <CrispIframe />
                </Box>
              </Box>
            </Container>
            {story.content.page_sections?.length > 0 &&
              story.content.page_sections.map((section: any, index: number) => (
                <StoryblokPageSection key={`page_section_${index}`} {...section} />
              ))}
          </>
        ) : (
          <SignUpBanner />
        )}
      </Box>
    </>
  );
};

export async function getStaticProps({ locale, preview = false }: GetStaticPropsContext) {
  const storyblokProps = await getStoryblokPageProps('messaging', locale, preview);

  return {
    props: {
      ...storyblokProps,
      messages: {
        ...require(`../messages/shared/${locale}.json`),
        ...require(`../messages/navigation/${locale}.json`),
        ...require(`../messages/messaging/${locale}.json`),
      },
    },
    revalidate: 3600, // revalidate every hour
  };
}

export default Message;
