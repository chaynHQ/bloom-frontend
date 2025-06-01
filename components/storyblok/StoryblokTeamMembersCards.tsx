'use client';

import { columnStyle, rowStyle } from '@/styles/common';
import { Box } from '@mui/material';
import { storyblokEditable } from '@storyblok/react/rsc';
import StoryblokTeamMemberCard, { StoryblokTeamMemberCardProps } from './StoryblokTeamMemberCard';

const cardColumnStyle = {
  ...columnStyle,
  justifyContent: 'flex-start',
  width: { xs: '100%', sm: 'calc(50% - 1rem)' },
  gap: { xs: 0, sm: 2, md: 4 },
} as const;

const cardColumnRowStyle = {
  ...rowStyle,
  width: '100%',
  marginTop: { xs: 2, md: 5 },
} as const;

interface StoryblokTeamMembersCardsProps {
  _uid?: string;
  _editable?: string;
  team_member_items: Array<StoryblokTeamMemberCardProps>;
  cards_expandable: boolean;
}

const StoryblokTeamMembersCards = (props: StoryblokTeamMembersCardsProps) => {
  const { _uid, _editable, team_member_items, cards_expandable } = props;

  const leftTeamMemberCards = team_member_items.filter((card, index) => index % 2 === 0);
  const rightTeamMemberCards = team_member_items.filter((card, index) => index % 2 === 1);

  return (
    <Box
      sx={cardColumnRowStyle}
      {...storyblokEditable({ _uid, _editable, team_member_items, cards_expandable })}
    >
      <Box sx={cardColumnStyle}>
        {leftTeamMemberCards.map((teamMemberCard) => (
          <StoryblokTeamMemberCard
            key={`${teamMemberCard._uid}_team_member`}
            {...teamMemberCard}
            cardExpandable={cards_expandable}
          />
        ))}
      </Box>
      <Box sx={cardColumnStyle}>
        {rightTeamMemberCards.map((teamMemberCard) => (
          <StoryblokTeamMemberCard
            key={`${teamMemberCard._uid}_team_member`}
            {...teamMemberCard}
            cardExpandable={cards_expandable}
          />
        ))}
      </Box>
    </Box>
  );
};

export default StoryblokTeamMembersCards;
