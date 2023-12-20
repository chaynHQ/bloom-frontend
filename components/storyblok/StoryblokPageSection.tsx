import { Box } from '@mui/material';
import { ISbRichtext, storyblokEditable } from '@storyblok/react';
import { render } from 'storyblok-rich-text-react-renderer';
import { STORYBLOK_COLORS } from '../../constants/enums';
import { RichTextOptions } from '../../utils/richText';
import PageSection from '../common/PageSection';

export interface StoryblokPageSectionProps {
  _uid: string;
  _editable: string;
  content: ISbRichtext;
  color: STORYBLOK_COLORS;
  alignment: string;
}

const StoryblokPageSection = (props: StoryblokPageSectionProps) => {
  const { _uid, _editable, content, color, alignment } = props;

  if (!content) return <></>;

  return (
    <Box {...storyblokEditable({ _uid, _editable, content, color, alignment })}>
      <PageSection color={color} alignment={alignment}>
        {render(content, RichTextOptions)}
      </PageSection>
    </Box>
  );
};

export default StoryblokPageSection;
