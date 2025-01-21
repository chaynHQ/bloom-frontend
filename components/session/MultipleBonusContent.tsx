'use client';

import LinkIcon from '@mui/icons-material/Link';
import { ISbRichtext } from '@storyblok/react/rsc';
import { render } from 'storyblok-rich-text-react-renderer';
import { EventUserData } from '../../utils/logEvent';
import { RichTextOptions } from '../../utils/richText';
import SessionContentCard from '../cards/SessionContentCard';
import { Dots } from '../common/Dots';

export type BonusContent = {
  _uid: string;
  title: string;
  content: unknown;
};
interface MultipleBonusContentProps {
  bonus: BonusContent[];
  eventData: EventUserData;
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
