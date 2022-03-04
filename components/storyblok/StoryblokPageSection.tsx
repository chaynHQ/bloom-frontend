import { Container } from '@mui/material';
import { render } from 'storyblok-rich-text-react-renderer';
import { columnStyle } from '../../styles/common';
import { RichTextOptions } from '../../utils/richText';

interface StoryblokPageSectionProps {
  content: AnalyserNode;
  color: string;
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
  } as const;

  return <Container sx={containerStyle}>{render(content, RichTextOptions)}</Container>;
};

export default StoryblokPageSection;
