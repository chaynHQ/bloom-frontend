import { Box, Container, Typography } from '@mui/material';
import { ISbStoryData, useStoryblokState } from '@storyblok/react';
import { GetStaticPropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import Image from 'next/image';
import { SignUpBanner } from '../components/banner/SignUpBanner';
import NoDataAvailable from '../components/common/NoDataAvailable';
import Header, { HeaderProps } from '../components/layout/Header';
import StoryblokPageSection from '../components/storyblok/StoryblokPageSection';
import { useTypedSelector } from '../hooks/store';
import IllustrationCourseDBR from '../public/illustration_course_dbr.svg';
import { rowStyle } from '../styles/common';
import { getStoryblokPageProps } from '../utils/getStoryblokPageProps';
import { getEventUserData } from '../utils/logEvent';

const chatRowStyle = {
  ...rowStyle,
  gap: '10%',
} as const;

const iframeContainerStyle = {
  flex: 1,
  width: '100%',
  height: { xs: '70vh', md: '500px' },
  maxHeight: { md: '500px' },
  borderRadius: 1,
  overflow: 'hidden',
} as const;

const imageContainerStyle = {
  position: 'relative', // needed for next/image to fill the container
  width: 260,
  height: 260,
  mt: { md: 3 },
} as const;

interface Props {
  story: ISbStoryData | null;
}

const Chat: NextPage<Props> = ({ story }) => {
  story = useStoryblokState(story);

  const t = useTranslations('Chat');
  const tS = useTranslations('Shared');

  const userEmail = useTypedSelector((state) => state.user.email);
  const userId = useTypedSelector((state) => state.user.id);
  const userCrispTokenId = useTypedSelector((state) => state.user.crispTokenId);
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);

  if (!story) {
    return <NoDataAvailable />;
  }

  const headerProps: HeaderProps = {
    title: story.content.title,
    introduction: story.content.description,
    imageSrc: story.content.header_image.filename,
    translatedImageAlt: story.content.header_image.alt,
  };
  const eventUserData = getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin);

  let crispUrl = `https://go.crisp.chat/chat/embed/?website_id=${process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID}`;

  if (userEmail) crispUrl = crispUrl + '&user_email=' + encodeURI(userEmail);
  if (userCrispTokenId) crispUrl = crispUrl + '&token_id=' + encodeURI(userCrispTokenId);

  return (
    <>
      <Head>
        <title>{headerProps.title}</title>
      </Head>{' '}
      <Box>
        <Header {...headerProps} />
        {userId ? (
          <>
            <Container sx={{ backgroundColor: 'secondary.light' }}>
              <Typography variant="h2" mb={8}>
                {t('chatHeading')}
              </Typography>
              <Box sx={chatRowStyle}>
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
                <Box sx={iframeContainerStyle}>
                  <iframe height="100%" width="100%" src={crispUrl} />
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
  const storyblokProps = await getStoryblokPageProps('chat', locale, preview);

  return {
    props: {
      ...storyblokProps,
      messages: {
        ...require(`../messages/shared/${locale}.json`),
        ...require(`../messages/navigation/${locale}.json`),
        ...require(`../messages/chat/${locale}.json`),
      },
    },
    revalidate: 3600, // revalidate every hour
  };
}

export default Chat;
