'use client';

import SessionContentCard from '@/lib/components/cards/SessionContentCard';
import { Dots } from '@/lib/components/common/Dots';
import { RichTextOptions } from '@/lib/utils/richText';
import LinkIcon from '@mui/icons-material/Link';
import { ISbRichtext } from '@storyblok/react/rsc';
import { render } from 'storyblok-rich-text-react-renderer';

export type BonusContent = {
  _uid: string;
  title: string;
  content: unknown;
};
interface MultipleBonusContentProps {
  bonus: BonusContent[];
  eventData: { [key: string]: any };
}

const MultipleBonusContent = (props: MultipleBonusContentProps) => {
  const { bonus, eventData } = props;

  return (
    <>
      <Dots />
      {bonus.map((bonus: BonusContent) => (
        <SessionContentCard
          key={bonus._uid}
          title={bonus.title}
          titleIcon={LinkIcon}
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
