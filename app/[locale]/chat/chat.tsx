'use client';

import { Box } from '@mui/material';
import { ISbStoryData, useStoryblokState } from '@storyblok/react';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import { SignUpBanner } from '../../../components/banner/SignUpBanner';
import NoDataAvailable from '../../../components/common/NoDataAvailable';
import CrispButton from '../../../components/crisp/CrispButton';
import Header, { HeaderProps } from '../../../components/layout/Header';
import StoryblokPageSection from '../../../components/storyblok/StoryblokPageSection';
import { useTypedSelector } from '../../../hooks/store';
import { getEventUserData } from '../../../utils/logEvent';

const Chat = ({ story }: { story: ISbStoryData | null }) => {
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
      <Head>{headerProps.title}</Head>
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
            <StoryblokPageSection key={`page_section_${index}`} {...section} />
          ))
        ) : (
          <SignUpBanner />
        )}
      </Box>
    </>
  );
};

export default Chat;
