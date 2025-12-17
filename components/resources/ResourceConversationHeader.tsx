'use client';

import { ResourceConversationAudio } from '@/components/resources/ResourceConversationAudio';
import { Link as i18nLink } from '@/i18n/routing';
import { PROGRESS_STATUS } from '@/lib/constants/enums';
import getNextResourceButtonLabel from '@/lib/utils/getNextResourceButtonLabel';
import { getImageSizes } from '@/lib/utils/imageSizes';
import { RichTextOptions } from '@/lib/utils/richText';
import { breadcrumbButtonStyle, rowStyle } from '@/styles/common';
import theme from '@/styles/theme';
import { ArrowForward } from '@mui/icons-material';
import { Box, Button, Container, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { render, StoryblokRichtext } from 'storyblok-rich-text-react-renderer';
import ProgressStatus from '../common/ProgressStatus';

const audioContainerStyle = {
  mt: { xs: 4, md: 6 },
} as const;

const headerStyle = {
  ...rowStyle,
  flexWrap: { xs: 'wrap', md: 'no-wrap' },
  gap: { xs: 3, md: 5 },
  mt: { md: -2.5 },
} as const;

const headerLeftStyle = {
  width: 600,
  maxWidth: '100%',
} as const;

const headerRightStyle = {
  display: 'flex',
  flexDirection: { xs: 'row-reverse', md: 'column' },
  justifyContent: { xs: 'space-between', md: 'flex-start' },
  alignItems: { xs: 'flex-start', md: 'center' },
  flex: 1,
  width: '100%',
} as const;

const nextResourceButtonStyle = {
  mt: { xs: 0, md: 'auto' },
  mr: { md: 'auto' },
} as const;

const imageContainerStyle = {
  position: 'relative',
  width: { xs: 150, md: 210 },
  height: { xs: 150, md: 210 },
  marginLeft: { xs: 'auto', md: 0 },
  marginRight: { xs: '1rem', md: '8%' },
  marginTop: 0,
} as const;

interface ResourceConversationHeaderProps {
  storyUuid: string;
  name: string;
  description: StoryblokRichtext;
  header_image: { filename: string; alt: string };
  resourceProgress: PROGRESS_STATUS;
  audio: { filename: string };
  audio_transcript: StoryblokRichtext;
  nextResourceHref: string | undefined;
  eventData: { [key: string]: any };
}

export const ResourceConversationHeader = (props: ResourceConversationHeaderProps) => {
  const {
    storyUuid,
    name,
    description,
    header_image,
    resourceProgress,
    audio,
    audio_transcript,
    nextResourceHref,
    eventData,
  } = props;
  const t = useTranslations('Resources');

  return (
    <Container sx={{ background: theme.palette.bloomGradient }}>
      <Button
        variant="contained"
        sx={breadcrumbButtonStyle}
        href="/courses?section=conversations"
        component={i18nLink}
        size="small"
      >
        {t('backToConversations')}
      </Button>

      <Box sx={headerStyle}>
        <Box sx={headerLeftStyle}>
          <Typography variant="h1" maxWidth={600}>
            {name}
          </Typography>
          {render(description, RichTextOptions)}

          <Box sx={audioContainerStyle}>
            <ResourceConversationAudio
              eventData={eventData}
              resourceProgress={resourceProgress}
              name={name}
              storyUuid={storyUuid}
              audio={audio.filename}
              audio_transcript={audio_transcript}
            />
            {resourceProgress && <ProgressStatus status={resourceProgress} />}
          </Box>
        </Box>
        <Box sx={headerRightStyle}>
          <Box sx={imageContainerStyle}>
            <Image
              alt={header_image.alt}
              src={header_image.filename}
              fill
              sizes={getImageSizes(imageContainerStyle.width)}
              style={{
                objectFit: 'contain',
              }}
            />
          </Box>

          {nextResourceHref && (
            <Button
              variant="contained"
              color="secondary"
              sx={nextResourceButtonStyle}
              href={nextResourceHref}
              endIcon={<ArrowForward />}
              component={i18nLink}
            >
              {t(getNextResourceButtonLabel(nextResourceHref))}
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};
