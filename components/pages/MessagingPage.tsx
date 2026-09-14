'use client';

import NotesFromBloomPromo from '@/components/banner/NotesFromBloomPromo';
import NoDataAvailable from '@/components/common/NoDataAvailable';
import SignUpButton from '@/components/common/SignUpButton';
import { SignUpSection } from '@/components/common/SignUpSection';
import Header, { HeaderProps } from '@/components/layout/Header';
import { MessageThread } from '@/components/messaging/MessageThread';
import DynamicComponent from '@/components/storyblok/DynamicComponent';
import { MESSAGING_VIEWED } from '@/lib/constants/events';
import { useLogEventOnce } from '@/lib/hooks/useLogEventOnce';
import { useTypedSelector } from '@/lib/hooks/store';
import { getImageSizes } from '@/lib/utils/imageSizes';
import { getEventUserData } from '@/lib/utils/logEvent';
import IllustrationCourseDBR from '@/public/illustration_course_dbr.svg';
import { rowStyle } from '@/styles/common';
import { Box, Container, Typography } from '@mui/material';
import { ISbStoryData, SbBlokData } from '@storyblok/react/rsc';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const messageRowStyle = {
  ...rowStyle,
  flexDirection: { xs: 'column-reverse', md: 'row' },
  gap: { xs: 0, md: '10%' },
} as const;

const imageContainerStyle = {
  position: 'relative',
  margin: 'auto',
  width: { xs: '60%', md: 260 },
  height: { xs: '60%', md: 260 },
} as const;

interface Props {
  story: ISbStoryData | undefined;
}

export default function MessagingPage({ story }: Props) {
  const t = useTranslations('Messaging');
  const tS = useTranslations('Shared');
  const userId = useTypedSelector((state) => state.user.id);
  const userToken = useTypedSelector((state) => state.user.token);
  const authStateLoading = useTypedSelector((state) => state.user.authStateLoading);
  const userCreatedAt = useTypedSelector((state) => state.user.createdAt);
  const partnerAccesses = useTypedSelector((state) => state.partnerAccesses);
  const partnerAdmin = useTypedSelector((state) => state.partnerAdmin);

  const userSettled = !authStateLoading && (!userToken || Boolean(userId));
  useLogEventOnce(
    MESSAGING_VIEWED,
    {
      messaging_logged_in: Boolean(userId),
      ...getEventUserData(userCreatedAt, partnerAccesses, partnerAdmin),
    },
    userSettled,
  );

  if (!story) {
    return <NoDataAvailable />;
  }
  const headerProps: HeaderProps = {
    title: story.content.title,
    introduction: story.content.description,
    imageSrc: story.content.header_image.filename,
    translatedImageAlt: story.content.header_image.alt,
    cta: !userId ? <SignUpButton labelKey="ctaMessaging" source="messaging" /> : undefined,
  };

  return (
    <Box>
      <Header {...headerProps} />
      {userId ? (
        <>
          <Container sx={{ backgroundColor: 'secondary.light', pt: 0 }}>
            <Typography variant="h2" sx={{ mb: { xs: 4, md: 8 } }}>
              {t('messageHeading')}
            </Typography>
            <Box sx={messageRowStyle}>
              <Box sx={imageContainerStyle}>
                <Image
                  alt={tS('alt.personSitting')}
                  src={IllustrationCourseDBR}
                  sizes={getImageSizes(imageContainerStyle.width)}
                  style={{
                    width: '100%',
                    height: 'auto',
                  }}
                />
              </Box>
              <Box
                sx={{
                  flex: 1,
                }}
              >
                <MessageThread />
              </Box>
            </Box>
          </Container>
          {story.content.page_sections?.length > 0 &&
            story.content.page_sections.map((section: SbBlokData, index: number) => (
              <DynamicComponent key={`page_section_${index}`} blok={section} />
            ))}
        </>
      ) : (
        <>
          <NotesFromBloomPromo />
          <SignUpSection source="messaging" />
        </>
      )}
    </Box>
  );
}
