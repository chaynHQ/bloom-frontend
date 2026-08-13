'use client';

import SessionContentCard from '@/components/cards/SessionContentCard';
import { RichTextOptions } from '@/lib/utils/richText';
import { render, StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

export type BonusContent = {
  _uid: string;
  title: string;
  content: unknown;
};

interface MultipleBonusContentProps {
  bonus: BonusContent[];
  eventData: { [key: string]: any };
}

const MultipleBonusContent = ({ bonus, eventData }: MultipleBonusContentProps) => (
  <>
    {bonus.map((bonusItem: BonusContent) => (
      <SessionContentCard
        key={bonusItem._uid}
        qaId="session-bonus"
        title={bonusItem.title}
        eventPrefix="SESSION_BONUS_CONTENT"
        eventData={eventData}
      >
        <>{render(bonusItem.content as StoryblokRichtext, RichTextOptions)}</>
      </SessionContentCard>
    ))}
  </>
);

export default MultipleBonusContent;
