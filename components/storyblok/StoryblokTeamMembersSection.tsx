'use client';

import { STORYBLOK_COLORS } from '@/lib/constants/enums';
import { RichTextOptions } from '@/lib/utils/richText';
import { columnStyle, rowStyle } from '@/styles/common';
import { Box, Typography } from '@mui/material';
import { storyblokEditable } from '@storyblok/react/rsc';
import { render, StoryblokRichtext } from 'storyblok-rich-text-react-renderer';
import PageSection from '../common/PageSection';
import StoryblokTeamMemberCard, { StoryblokTeamMemberCardProps } from './StoryblokTeamMemberCard';

const rowStyles = {
  ...rowStyle,
  flexDirection: { xs: 'column', md: 'row' },
  alignItems: 'flex-start',
  width: '100%',
  gap: { xs: 3, md: 6 },
  marginTop: { xs: -2, md: 4 },
} as const;

const columnStyles = {
  ...columnStyle,
  flex: 1,
  width: { xs: '100%', md: 'auto' },
  justifyContent: 'flex-start',
  gap: 2,
} as const;

export interface StoryblokTeamMembersSectionProps {
  _uid?: string;
  _editable?: string;
  title: string;
  description: StoryblokRichtext;
  team_member_items: Array<StoryblokTeamMemberCardProps>;
  cards_expandable: boolean;
  color: STORYBLOK_COLORS;
}

const StoryblokTeamMembersSection = (props: StoryblokTeamMembersSectionProps) => {
  const { _uid, _editable, title, description, team_member_items, cards_expandable, color } = props;

  return (
    <PageSection color={color} alignment="flex-start">
      <Typography variant="h2">{title}</Typography>
      <Box
        sx={rowStyles}
        {...storyblokEditable({ _uid, _editable, team_member_items, cards_expandable })}
      >
        <Box sx={columnStyles}>
          {team_member_items?.map((teamMemberCard) => (
            <StoryblokTeamMemberCard
              key={`${teamMemberCard._uid}_team_member`}
              {...teamMemberCard}
              cardExpandable={cards_expandable}
            />
          ))}
        </Box>
        <Box sx={columnStyles}>{render(description, RichTextOptions)}</Box>
      </Box>
    </PageSection>
  );
};

export default StoryblokTeamMembersSection;
