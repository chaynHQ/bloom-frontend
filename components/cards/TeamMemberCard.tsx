import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LanguageIcon from '@mui/icons-material/Language';
import { Card, CardActionArea, CardContent, Collapse, Typography } from '@mui/material';
import Box from '@mui/material/Box';
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

interface TeamMemberCardProps {
  teamMember: any;
  alwaysOpen?: boolean;
}

const TeamMemberCard = (props: TeamMemberCardProps) => {
  const { teamMember, alwaysOpen = false } = props;
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
    <Card sx={cardStyle}>
      <CardActionArea
        onClick={handleExpandClick}
        aria-label={`${t.rich('expandTeamMember', { name: teamMember.name })}`}
        disabled={alwaysOpen}
      >
        <CardContent sx={cardContentStyle}>
          <Box sx={imageContainerStyle}>
            <Image
              alt={teamMember.image.alt}
              src={teamMember.image.filename}
              layout="fill"
              objectFit="cover"
            />
          </Box>
          <Box sx={cardHeaderStyle}>
            <Box flex={1}>
              <Typography component="h3" variant="h3" mb={0.5}>
                {teamMember.name}
              </Typography>
              <Typography fontStyle={'italic'}>{teamMember.role}</Typography>
              <Box style={languageRowStyles}>
                <LanguageIcon color="error" />
                <Typography variant="body2" flex="1">
                  {teamMember.languages}
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
            {render(teamMember.bio, RichTextOptions)}
          </Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default TeamMemberCard;
