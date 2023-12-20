import { ISbRichtext } from '@storyblok/react';
import { render } from 'storyblok-rich-text-react-renderer';
import { STORYBLOK_COLORS } from '../../constants/enums';
import { RichTextOptions } from '../../utils/richText';
import PageSection from '../common/PageSection';

interface StoryblokPageSectionProps {
  content: ISbRichtext;
  color: STORYBLOK_COLORS;
  alignment: string;
}

const StoryblokPageSection = (props: StoryblokPageSectionProps) => {
  const { content, color, alignment } = props;

  if (!content) return <></>;

  return (
    <PageSection color={color} alignment={alignment}>
      {render(content, RichTextOptions)}
    </PageSection>
  );
};

export default StoryblokPageSection;
