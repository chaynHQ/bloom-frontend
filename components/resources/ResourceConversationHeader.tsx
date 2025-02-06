'use client';

import Header from '@/components/layout/Header';
import { ResourceConversationAudio } from '@/components/resources/ResourceConversationAudio';
import { Link as i18nLink } from '@/i18n/routing';
import { PROGRESS_STATUS } from '@/lib/constants/enums';
import { RichTextOptions } from '@/lib/utils/richText';
import illustrationCourses from '@/public/illustration_courses.svg';
import theme from '@/styles/theme';
import { Box, Button } from '@mui/material';
import { ISbRichtext } from '@storyblok/react/rsc';
import { useTranslations } from 'next-intl';
import { render } from 'storyblok-rich-text-react-renderer';

const audioContainerStyle = {
  mt: { xs: 4, md: 6 },
  mb: 3,
} as const;

const backButtonStyle = {
  background: theme.palette.background.default,
  boxShadow: 'none !important',
  ':hover': {
    background: 'white',
  },
} as const;

interface ResourceConversationHeaderProps {
  storyId: number;
  name: string;
  description: ISbRichtext;
  header_image: { filename: string; alt: string };
  resourceProgress: PROGRESS_STATUS;
  audio: { filename: string };
  audio_transcript: ISbRichtext;
  eventData: { [key: string]: any };
}

export const ResourceConversationHeader = (props: ResourceConversationHeaderProps) => {
  const {
    storyId,
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
              storyId={storyId}
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
        variant="outlined"
        sx={backButtonStyle}
        href="/courses?section=conversations"
        component={i18nLink}
        size="small"
      >
        {t('backToConversations')}
      </Button>
    </Header>
  );
};
