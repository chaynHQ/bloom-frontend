import LinkIcon from '@mui/icons-material/Link';
import { ISbRichtext, ISbStoryData } from '@storyblok/react';
import { render } from 'storyblok-rich-text-react-renderer';
import SessionDetail from '../../pages/courses/image-based-abuse-and-rebuilding-ourselves/[sessionSlug]';
import { RichTextOptions } from '../../utils/richText';
import SessionContentCard from '../cards/SessionContentCard';
import { Dots } from '../common/Dots';

/**
 * This React component is used to render storyblok component "Bonus Block".
 * This is currently used in the following session page: {@link SessionDetail}
 */

type BonusContent = {
  _uid: string;
  title: string;
  content: unknown;
};
interface MultipleBonusContentProps {
  story: ISbStoryData;
  eventData: { [index: string]: any };
}

const MultipleBonusContent = (props: MultipleBonusContentProps) => {
  const { story, eventData } = props;

  return (
    <>
      <Dots />
      {story.content.bonus.map((bonus: BonusContent) => (
        <SessionContentCard
          key={bonus._uid}
          title={bonus.title}
          titleIcon={LinkIcon}
          richtextContent
          eventPrefix="SESSION_BONUS_CONTENT"
          eventData={eventData}
        >
          <>{render(bonus.content as ISbRichtext, RichTextOptions)}</>
        </SessionContentCard>
      ))}
    </>
  );
};

export default MultipleBonusContent;
