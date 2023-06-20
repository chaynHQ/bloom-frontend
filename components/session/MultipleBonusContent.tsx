import LinkIcon from '@mui/icons-material/Link';
import { useTranslations } from 'next-intl';
import { StoryData } from 'storyblok-js-client';
import { render } from 'storyblok-rich-text-react-renderer';
import SessionDetail from '../../pages/courses/image-based-abuse/[sessionSlug]';
import { RichTextOptions } from '../../utils/richText';
import SessionContentCard from '../cards/SessionContentCard';
import { Dots } from '../common/Dots';

/**
 * This React component is used to render storyblok component "Bonus Block".
 * This is currently used in the following session page: {@link SessionDetail}
 */
interface MultipleBonusContentProps {
  story: StoryData;
  eventData: { [index: string]: any };
}

const MultipleBonusContent = (props: MultipleBonusContentProps) => {
  const { story, eventData } = props;

  const t = useTranslations('Courses');

  return (
    <>
      <Dots />
      {story.content.bonus.map((bonus: any) => (
        <SessionContentCard
          key={bonus._uid}
          title={t('sessionDetail.bonusTitle')}
          titleIcon={LinkIcon}
          richtextContent
          eventPrefix="SESSION_BONUS_CONTENT"
          eventData={eventData}
        >
          <>{render(bonus.content, RichTextOptions)}</>
        </SessionContentCard>
      ))}
    </>
  );
};

export default MultipleBonusContent;
