import { Box } from '@mui/material';
import { ISbStoryData, useStoryblokState } from '@storyblok/react';
import { GetStaticPropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { SignUpBanner } from '../components/banner/SignUpBanner';
import NoDataAvailable from '../components/common/NoDataAvailable';
import CrispButton from '../components/crisp/CrispButton';
import Header, { HeaderProps } from '../components/layout/Header';
import StoryblokPageSection from '../components/storyblok/StoryblokPageSection';
import { useTypedSelector } from '../hooks/store';
import { getStoryblokPageProps } from '../utils/getStoryblokPageProps';
import { getEventUserData } from '../utils/logEvent';

interface Props {
  story: ISbStoryData | null;
}

const Chat: NextPage<Props> = ({ story }) => {
  story = useStoryblokState(story);

  const t = useTranslations('Courses');

  const userEmail = useTypedSelector((state) => state.user.email);
  const userId = useTypedSelector((state) => state.user.id);
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

  return (
    <>
      <Head>
        <title>{headerProps.title}</title>
      </Head>{' '}
      <Box>
        <Header
          {...headerProps}
          cta={
            userId && (
              <CrispButton
                email={userEmail}
                eventData={eventUserData}
                buttonText={t('sessionDetail.chat.startButton')}
              />
            )
          }
        />
        {userId ? (
          story.content.page_sections?.length > 0 &&
          story.content.page_sections.map((section: any, index: number) => (
            <>
              <Box padding="10%" borderRadius="100px" overflow={'hidden'}>
                <iframe height="500px" width="100%" src={'/crisp'}></iframe>
              </Box>
              <StoryblokPageSection key={`page_section_${index}`} {...section} />
            </>
          ))
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
        ...require(`../messages/courses/${locale}.json`),
        ...require(`../messages/chat/${locale}.json`),
      },
    },
    revalidate: 3600, // revalidate every hour
  };
}

export default Chat;
