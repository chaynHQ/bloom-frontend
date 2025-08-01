'use client';

import { getImageSizes } from '@/lib/utils/imageSizes';
import { RichTextOptions } from '@/lib/utils/richText';
import { columnStyle, rowStyle } from '@/styles/common';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LanguageIcon from '@mui/icons-material/Language';
import { Box, Card, CardActionArea, CardContent, Collapse, Typography } from '@mui/material';
import { storyblokEditable } from '@storyblok/react/rsc';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';
import { render, StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

const cardStyle = {
  textAlign: 'left',
  alignSelf: 'flex-start',
  width: '100%',
  backgroundColor: 'background.default',
} as const;

const cardContentStyle = {
  ...rowStyle,
  padding: '0 !important',
  minHeight: { xs: 124, md: 136 },
} as const;

const cardHeaderStyle = {
  ...columnStyle,
  flex: 1,
  padding: { xs: 2, md: 2.5 },
  paddingRight: { xs: 1, md: 2 },
  paddingBottom: { xs: 0.5, md: 0.75 },
} as const;

const imageContainerStyle = {
  position: 'relative',
  width: { xs: 120, md: 180 },
  height: { xs: 120, md: 180 },
} as const;

const collapseContentStyle = {
  padding: { xs: 2, md: 3 },
  paddingBottom: { xs: 1, md: 1 },
} as const;

const languageRowStyles = {
  ...rowStyle,
  gap: 10,
  marginTop: 6,
  alignItems: 'center',
} as const;

export interface StoryblokTeamMemberCardProps {
  _uid: string;
  _editable: string;
  name: string;
  role: string;
  languages: string;
  bio: StoryblokRichtext;
  image: { filename: string; alt: string };
  cardExpandable?: boolean;
}

const StoryblokTeamMemberCard = (props: StoryblokTeamMemberCardProps) => {
  const { _uid, _editable, name, role, languages, bio, image, cardExpandable = false } = props;

  const [expanded, setExpanded] = useState<boolean>(!cardExpandable);
  const t = useTranslations('Shared.meetTheTeam');

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const expandArrowStyle = {
    marginLeft: 'auto',
    transform: expanded ? 'rotate(180deg)' : 'none',
  } as const;

  return (
    <Card
      data-testid="team-member-card"
      sx={cardStyle}
      {...storyblokEditable({
        _uid,
        _editable,
        name,
        role,
        languages,
        bio,
        image,
        cardExpandable,
      })}
    >
      <CardActionArea
        onClick={handleExpandClick}
        aria-label={`${t.rich('expandTeamMember', { name: name })}`}
        disabled={!cardExpandable}
      >
        <CardContent sx={cardContentStyle}>
          <Box sx={imageContainerStyle}>
            <Image
              alt={image.alt}
              src={image.filename}
              fill
              sizes={getImageSizes(imageContainerStyle.width)}
              style={{
                objectFit: 'cover',
              }}
            />
          </Box>
          <Box sx={cardHeaderStyle}>
            <Box flex={1}>
              <Typography component="h3" variant="h3" mb={0.5}>
                {name}
              </Typography>
              <Typography fontStyle={'italic'}>{role}</Typography>
              <Box style={languageRowStyles}>
                <LanguageIcon color="error" />
                <Typography variant="body2" flex="1">
                  {languages}
                </Typography>
              </Box>
            </Box>
            {cardExpandable && (
              <Box style={expandArrowStyle}>
                <KeyboardArrowDownIcon color="error"></KeyboardArrowDownIcon>
              </Box>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={collapseContentStyle}>
          <Box>{render(bio, RichTextOptions)}</Box>
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default StoryblokTeamMemberCard;
