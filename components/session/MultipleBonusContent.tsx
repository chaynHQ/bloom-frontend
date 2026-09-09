'use client';

import SessionContentCard from '@/components/cards/SessionContentCard';
import { ScrollReveal } from '@/components/common/ScrollReveal';
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
      <ScrollReveal fill key={bonusItem._uid}>
        <SessionContentCard
          qaId="session-bonus"
          title={bonusItem.title}
          eventPrefix="SESSION_BONUS_CONTENT"
          eventData={eventData}
        >
          <>{render(bonusItem.content as StoryblokRichtext, RichTextOptions)}</>
        </SessionContentCard>
      </ScrollReveal>
    ))}
  </>
);

export default MultipleBonusContent;
