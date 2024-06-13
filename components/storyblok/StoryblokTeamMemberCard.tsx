import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LanguageIcon from '@mui/icons-material/Language';
import { Box, Card, CardActionArea, CardContent, Collapse, Typography } from '@mui/material';
import { ISbRichtext, storyblokEditable } from '@storyblok/react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';
import { render } from 'storyblok-rich-text-react-renderer';
import { columnStyle, rowStyle } from '../../styles/common';
import { RichTextOptions } from '../../utils/richText';

const cardStyle = {
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
  bio: ISbRichtext;
  image: { filename: string; alt: string };
  alwaysOpen?: boolean;
}

const StoryblokTeamMemberCard = (props: StoryblokTeamMemberCardProps) => {
  const { _uid, _editable, name, role, languages, bio, image, alwaysOpen = false } = props;

  const [expanded, setExpanded] = useState<boolean>(alwaysOpen);
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
      sx={cardStyle}
      {...storyblokEditable({
        _uid,
        _editable,
        name,
        role,
        languages,
        bio,
        image,
        alwaysOpen,
      })}
    >
      <CardActionArea
        onClick={handleExpandClick}
        aria-label={`${t.rich('expandTeamMember', { name: name })}`}
        disabled={alwaysOpen}
      >
        <CardContent sx={cardContentStyle}>
          <Box sx={imageContainerStyle}>
            <Image
              alt={image.alt}
              src={image.filename}
              fill
              sizes="100vw"
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
            {!alwaysOpen && (
              <Box style={expandArrowStyle}>
                <KeyboardArrowDownIcon color="error"></KeyboardArrowDownIcon>
              </Box>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={collapseContentStyle}>
          <Typography variant="body2" mb={0} paragraph>
            {render(bio, RichTextOptions)}
          </Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default StoryblokTeamMemberCard;
