import LinkIcon from '@mui/icons-material/Link';
import { useTranslations } from 'next-intl';
import { StoryData } from 'storyblok-js-client';
import { render } from 'storyblok-rich-text-react-renderer';
import { RichTextOptions } from '../../utils/richText';
import SessionContentCard from '../cards/SessionContentCard';
import { Dots } from '../common/Dots';

// TODO add documentation on when this component is used i.e. which storyblok component it renders
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
