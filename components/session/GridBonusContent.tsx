import LinkIcon from '@mui/icons-material/Link';
import { useTranslations } from 'next-intl';
import { StoryData } from 'storyblok-js-client';
import { render } from 'storyblok-rich-text-react-renderer';
import { columnStyle } from '../../styles/common';
import { RichTextOptions } from '../../utils/richText';
import SessionContentCard from '../cards/SessionContentCard';
import { Dots } from '../common/Dots';

const bonusGridColumnStyle = {
  ...columnStyle,
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: 2,
  width: { xs: '100%', sm: '100%', md: 700 },
} as const;

export const bonusGridRowStyle = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  flexWrap: 'wrap',
  gap: 2,
  width: '100%',
} as const;

interface MultipleBonusContentProps {
  story: StoryData;
  eventData: { [index: string]: any };
}

// TODO rename this file to MultipleBonusContent
const MultipleBonusContent = (props: MultipleBonusContentProps) => {
  const { story, eventData } = props;

  const t = useTranslations('Courses');

  // TODO remove log
  console.log('>>> bonus', story);

  // TODO remove index
  return (
    <>
      <Dots />
      {story.content.bonus.map((bonus: any, index: number) => (
        <SessionContentCard
          key={bonus._uid}
          title={t('sessionDetail.bonusTitle') + index}
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
