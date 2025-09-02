'use client';

import ProgressStatus from '@/components/common/ProgressStatus';
import { ResourceSingleVideo } from '@/components/resources/ResourceSingleVideo';
import { Link as i18nLink } from '@/i18n/routing';
import { PROGRESS_STATUS, STORYBLOK_TAGS } from '@/lib/constants/enums';
import { RichTextOptions } from '@/lib/utils/richText';
import { breadcrumbButtonStyle, columnStyle, rowStyle } from '@/styles/common';
import theme from '@/styles/theme';
import { ArrowForward } from '@mui/icons-material';
import { Box, Button, Container, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { render, StoryblokRichtext } from 'storyblok-rich-text-react-renderer';
import References from '../common/References';
import { StoryblokReferenceProps } from '../storyblok/StoryblokTypes';

const headerStyle = {
  ...rowStyle,
  flexWrap: { xs: 'wrap', md: 'no-wrap' },
  gap: { xs: 3, md: 5 },
} as const;

const headerLeftStyles = {
  width: 514, // >515px enables the "watch on youtube" button
  maxWidth: '100%',
} as const;

const headerRightStyle = {
  ...columnStyle,
  justifyContent: 'flex-start',
  flex: { md: 1 },
  width: { md: '100%' },
} as const;

const referencesNextColumnStyle = {
  ...columnStyle,
  flexDirection: { xs: 'column-reverse', md: 'column' },
  mt: { xs: 4, md: 3 },
  gap: { xs: 4, md: 3 },
} as const;

interface ResourceSingleVideoHeaderProps {
  storyUuid: string;
  name: string;
  subtitle: string;
  description: StoryblokRichtext;
  resourceProgress: PROGRESS_STATUS;
  video: { url: string };
  video_transcript: StoryblokRichtext;
  references: StoryblokReferenceProps[];
  eventData: { [key: string]: any };
  nextResourceHref: string | undefined;
  tags: STORYBLOK_TAGS[];
}

export const ResourceSingleVideoHeader = (props: ResourceSingleVideoHeaderProps) => {
  const {
    storyUuid,
    name,
    subtitle,
    description,
    resourceProgress,
    video,
    video_transcript,
    references,
    eventData,
    nextResourceHref,
    tags,
  } = props;
  const t = useTranslations('Resources');

  const hasSomaticsTag = tags.includes(STORYBLOK_TAGS.SOMATICS);

  return (
    <Container sx={{ background: theme.palette.bloomGradient }}>
      <Button
        variant="contained"
        sx={{ ...breadcrumbButtonStyle, mb: 4 }}
        href={hasSomaticsTag ? '/courses?section=somatics' : '/courses'}
        component={i18nLink}
        size="small"
      >
        {t(hasSomaticsTag ? 'backToSomatics' : 'backToVideos')}
      </Button>
      <Box mb={4}>
        <Typography variant="h1" maxWidth={600} mb={1}>
          {name}
        </Typography>
        {subtitle && (
          <Typography variant="h2" component="p" maxWidth={600} fontWeight={300} mb={1}>
            {subtitle}
          </Typography>
        )}
      </Box>

      <Box sx={headerStyle}>
        <Box sx={headerLeftStyles}>
          <ResourceSingleVideo
            eventData={eventData}
            resourceProgress={resourceProgress}
            name={name}
            references={references}
            storyUuid={storyUuid}
            video={video}
            video_transcript={video_transcript}
          />
          {resourceProgress && <ProgressStatus status={resourceProgress} />}
        </Box>
        <Box sx={headerRightStyle}>
          {/* Description field is not currently displayed */}
          {render(description, RichTextOptions)}
          <Box sx={referencesNextColumnStyle}>
            {references.length > 0 && (
              <Box>
                <Typography sx={{ mb: '0.75rem !important' }}>
                  {t('references.keyReferences')}
                </Typography>
                <References references={references.filter((r) => r.is_key_reference)} />
              </Box>
            )}
            {nextResourceHref && (
              <Button
                variant="contained"
                color="secondary"
                sx={{ width: 'fit-content' }}
                href={nextResourceHref}
                endIcon={<ArrowForward />}
                component={i18nLink}
              >
                {t('nextVideoButtonLabel')}
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Container>
  );
};
