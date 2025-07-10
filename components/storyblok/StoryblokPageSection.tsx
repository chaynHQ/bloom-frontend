'use client';

import PageSection from '@/components/common/PageSection';
import { STORYBLOK_COLORS } from '@/lib/constants/enums';
import { RichTextOptions } from '@/lib/utils/richText';
import { Box } from '@mui/material';
import { ISbRichtext, storyblokEditable } from '@storyblok/react/rsc';
import { render } from 'storyblok-rich-text-react-renderer';

export interface StoryblokPageSectionProps {
  isLoggedIn: boolean;
  _uid: string;
  _editable: string;
  content: ISbRichtext;
  color: STORYBLOK_COLORS;
  alignment: string;
  authenticated_hide: boolean;
  unauthenticated_hide: boolean;
}

const StoryblokPageSection = (props: StoryblokPageSectionProps) => {
  const {
    isLoggedIn,
    _uid,
    _editable,
    content,
    color,
    alignment,
    authenticated_hide,
    unauthenticated_hide,
  } = props;

  if (!content || (isLoggedIn && authenticated_hide) || (!isLoggedIn && unauthenticated_hide))
    return <></>;

  return (
    <Box {...storyblokEditable({ _uid, _editable, content, color, alignment })}>
      <PageSection color={color} alignment={alignment}>
        {render(content, RichTextOptions)}
      </PageSection>
    </Box>
  );
};

export default StoryblokPageSection;
