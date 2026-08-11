'use client';

import { LinkCard, type LinkCardSize } from '@/components/common/LinkCard';
import { STORYBLOK_COLORS } from '@/lib/constants/enums';
import { STORYBLOK_LINK_CARD_CLICKED } from '@/lib/constants/events';
import logEvent from '@/lib/utils/logEvent';
import { resolveStoryblokLink, type StoryblokLink } from '@/lib/utils/links';
import { Box } from '@mui/material';
import { storyblokEditable } from '@storyblok/react/rsc';

export interface StoryblokLinkCardProps {
  _uid: string;
  _editable: string;
  title: string;
  description: string;
  link: StoryblokLink;
  icon: { filename: string; alt: string };
  size: LinkCardSize;
  background: STORYBLOK_COLORS;
  arrow_color: STORYBLOK_COLORS;
  hide_arrow: boolean;
  // Stable analytics label, so reworded or translated titles stay comparable. Defaults to title.
  event_name: string;
}

const StoryblokLinkCard = (props: StoryblokLinkCardProps) => {
  const {
    _uid,
    _editable,
    title,
    description,
    link,
    icon,
    size = 'small',
    background = STORYBLOK_COLORS.COMMON_WHITE,
    arrow_color = STORYBLOK_COLORS.SECONDARY_LIGHT,
    hide_arrow = false,
    event_name,
  } = props;

  const { href, external } = resolveStoryblokLink(link);

  if (!title || !href) return <></>;

  return (
    <Box
      {...storyblokEditable({
        _uid,
        _editable,
        title,
        description,
        link,
        icon,
        size,
        background,
        arrow_color,
        hide_arrow,
      })}
      sx={{ height: '100%' }}
    >
      <LinkCard
        title={title}
        description={description}
        iconSrc={icon?.filename || undefined}
        href={href}
        external={external}
        size={size}
        background={background}
        arrowColor={arrow_color}
        hideArrow={hide_arrow}
        qaId="storyblok-link-card"
        onSelect={() =>
          logEvent(STORYBLOK_LINK_CARD_CLICKED, { link_card_name: event_name || title })
        }
      />
    </Box>
  );
};

export default StoryblokLinkCard;
