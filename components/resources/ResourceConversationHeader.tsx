'use client';

import Header from '@/components/layout/Header';
import { ResourceConversationAudio } from '@/components/resources/ResourceConversationAudio';
import { Link as i18nLink } from '@/i18n/routing';
import { PROGRESS_STATUS } from '@/lib/constants/enums';
import { RichTextOptions } from '@/lib/utils/richText';
import illustrationCourses from '@/public/illustration_courses.svg';
import { breadcrumbButtonStyle } from '@/styles/common';
import { Box, Button } from '@mui/material';
import { useTranslations } from 'next-intl';
import { render, StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

const audioContainerStyle = {
  mt: { xs: 4, md: 6 },
  mb: 3,
} as const;

interface ResourceConversationHeaderProps {
  storyUuid: string;
  name: string;
  description: StoryblokRichtext;
  header_image: { filename: string; alt: string };
  resourceProgress: PROGRESS_STATUS;
  audio: { filename: string };
  audio_transcript: StoryblokRichtext;
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
    eventData,
  } = props;
  const t = useTranslations('Resources');

  return (
    <Header
      title={name}
      introduction={
        <Box display="flex" flexDirection="column" gap={3}>
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
          </Box>
        </Box>
      }
      imageSrc={header_image ? header_image.filename : illustrationCourses}
      progressStatus={resourceProgress}
    >
      <Button
        variant="contained"
        sx={breadcrumbButtonStyle}
        href="/courses?section=conversations"
        component={i18nLink}
        size="small"
      >
        {t('backToConversations')}
      </Button>
    </Header>
  );
};
