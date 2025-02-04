'use client';

import { SignUpBanner } from '@/components/banner/SignUpBanner';
import NoDataAvailable from '@/components/common/NoDataAvailable';
import { CrispIframe } from '@/components/crisp/CrispIframe';
import Header, { HeaderProps } from '@/components/layout/Header';
import StoryblokPageSection from '@/components/storyblok/StoryblokPageSection';
import { useTypedSelector } from '@/lib/hooks/store';
import { getImageSizes } from '@/lib/utils/imageSizes';
import IllustrationCourseDBR from '@/public/illustration_course_dbr.svg';
import { rowStyle } from '@/styles/common';
import { Box, Container, Typography } from '@mui/material';
import { ISbStoryData } from '@storyblok/react/rsc';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const messageRowStyle = {
  ...rowStyle,
  flexDirection: { xs: 'column', md: 'row' },
  gap: { xs: '2rem', md: '10%' },
} as const;

const imageContainerStyle = {
  position: 'relative',
  width: { xs: '40%', md: 260 },
  height: { xs: '40%', md: 260 },
} as const;

interface Props {
  story: ISbStoryData | undefined;
}

export default function MessagingPage({ story }: Props) {
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
                  sizes={getImageSizes(imageContainerStyle.width)}
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
  );
}
