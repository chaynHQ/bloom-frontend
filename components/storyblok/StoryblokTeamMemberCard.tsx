'use client';

import { Link as i18nLink } from '@/i18n/routing';
import { getImageSizes } from '@/lib/utils/imageSizes';
import { RichTextOptions } from '@/lib/utils/richText';
import { columnStyle, rowStyle } from '@/styles/common';
import { KeyboardArrowUp } from '@mui/icons-material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LanguageIcon from '@mui/icons-material/Language';
import { Box, Card, CardActionArea, CardContent, Collapse, Link, Typography } from '@mui/material';
import { storyblokEditable } from '@storyblok/react/rsc';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { render, StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

const cardStyle = {
  textAlign: 'left',
  alignSelf: 'flex-start',
  width: '100%',
  maxWidth: 550,
  backgroundColor: 'background.default',
} as const;

const cardContentStyle = {
  ...rowStyle,
  flexWrap: 'nowrap',
  padding: '0 !important',
  minHeight: { xs: 124, md: 136 },
} as const;

const cardHeaderStyle = {
  ...columnStyle,
  flex: 1,
  padding: { xs: 2, md: 2.5 },
  paddingRight: { xs: 1, md: 2 },
  paddingBottom: { xs: 0.5, md: 0.75 },
  overflow: 'hidden',
  ' p': {
    mx: '0 !important',
  },
} as const;

const imageContainerStyle = {
  position: 'relative',
  width: { xs: '30%', md: '40%' },
  maxWidth: 350,
  minHeight: { xs: 120, sm: 140, md: 180 },
  minWidth: 120,
} as const;

const collapseContentStyle = {
  padding: { xs: 2, md: 3 },
  paddingBottom: { xs: 1, md: 1 },
} as const;

const iconRowStyles = {
  ...rowStyle,
  my: 1,
  gap: 1,
  flexWrap: 'nowrap',
  overflow: 'hidden',
  flex: 1,
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  position: 'relative',
} as const;

const fadeOut = {
  ':after': {
    content: '""',
    background: 'linear-gradient(90deg,rgba(254, 246, 242, 0) 0%, rgba(254, 246, 242, 1) 100%)',
    opacity: 0.9,
    position: 'absolute',
    right: 0,
    top: 0,
    width: 20,
    height: '100%',
  },
};

const iconStyles = {
  mt: { xs: 0.25, md: 0 },
  width: { xs: 20, md: 24 },
  height: { xs: 20, md: 24 },
} as const;

const expandButtonContainerStyles = {
  textAlign: 'right',
  mt: 'auto',
};

export interface StoryblokTeamMemberCardProps {
  _uid: string;
  _editable: string;
  image: { filename: string; alt: string };
  name: string;
  role: string;
  languages: string;
  bio: StoryblokRichtext;
  short_bio: StoryblokRichtext;
  show_short_bio: boolean;
  hide_languages: boolean;
  website: { url: string };
  website_title: string;
  team_page_section: 'core' | 'somatics' | 'supporting';
  cardExpandable?: boolean;
}

const StoryblokTeamMemberCard = (props: StoryblokTeamMemberCardProps) => {
  const {
    _uid,
    _editable,
    image,
    name,
    role,
    languages,
    bio,
    short_bio,
    show_short_bio,
    hide_languages,
    website,
    website_title,
    team_page_section,
    cardExpandable = false,
  } = props;

  const [expanded, setExpanded] = useState<boolean>(!cardExpandable);
  const t = useTranslations('Shared.meetTheTeam');

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const websiteTitle = useMemo(() => {
    if (!website || !website.url) return undefined;
    if (website_title) return website_title;
    let url = website.url.endsWith('/') ? website.url.slice(0, -1) : website.url;
    return url.replace('https://', '').replace('www.', '');
  }, [website]);

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
        short_bio,
        show_short_bio,
        hide_languages,
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
            <Typography component="h3" variant="h3" mb={0.5} ml={0}>
              {name}
            </Typography>
            <Typography fontStyle={'italic'} ml={0}>
              {role}
            </Typography>
            {!hide_languages && (
              <Box sx={iconRowStyles}>
                <LanguageIcon color="error" sx={iconStyles} />
                <Typography variant="body2" ml={0}>
                  {languages}
                </Typography>
              </Box>
            )}
            {show_short_bio && website?.url && (
              <Box sx={{ ...iconRowStyles, ...fadeOut }}>
                <LanguageIcon color="error" sx={iconStyles} />
                <Link variant="body2" href={website.url} sx={{ textDecoration: 'none' }}>
                  {websiteTitle}
                </Link>
              </Box>
            )}
            {cardExpandable && (
              <Box sx={expandButtonContainerStyles}>
                {expanded ? (
                  <KeyboardArrowUp color="error" />
                ) : (
                  <KeyboardArrowDownIcon color="error" />
                )}
              </Box>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={collapseContentStyle}>
          <Box>{render(show_short_bio ? short_bio : bio, RichTextOptions)}</Box>
          {show_short_bio && (
            <Link
              component={i18nLink}
              href={`/meet-the-team${team_page_section ? `?section=${team_page_section}` : ''}`}
              mt={2}
              display="block"
            >
              {t.rich('fullBioButton', { name: name })}
            </Link>
          )}
          {!show_short_bio && website?.url && (
            <Link href={website.url} target="_blank" sx={{ ...iconRowStyles, mt: 2, mb: 0 }}>
              <LanguageIcon color="error" />
              {websiteTitle}
            </Link>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default StoryblokTeamMemberCard;
