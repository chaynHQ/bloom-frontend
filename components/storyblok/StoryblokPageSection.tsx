import { Container } from '@mui/material';
import { render } from 'storyblok-rich-text-react-renderer';
import { STORYBLOK_COLORS } from '../../constants/enums';
import { columnStyle } from '../../styles/common';
import { RichTextOptions } from '../../utils/richText';

interface StoryblokPageSectionProps {
  content: AnalyserNode;
  color: STORYBLOK_COLORS;
  alignment: string;
}

const StoryblokPageSection = (props: StoryblokPageSectionProps) => {
  const { content, color, alignment } = props;

  if (!content) return <></>;

  const containerStyle = {
    ...columnStyle,
    ...(color && {
      backgroundColor: color,
    }),
    ...(alignment && {
      alignItems:
        alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start',
    }),
    textAlign: alignment === 'center' ? 'center' : alignment === 'right' ? 'right' : 'left',
    ...(alignment === 'center' && {
      ' p': { marginX: 'auto' },
    }),
  } as const;

  return <Container sx={containerStyle}>{render(content, RichTextOptions)}</Container>;
};

export default StoryblokPageSection;
