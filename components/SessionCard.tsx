import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Collapse,
  IconButton,
  Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { StoryData } from 'storyblok-js-client';
import { PROGRESS_STATUS } from '../constants/enums';
import { rowStyle } from '../styles/common';

interface SessionCardProps {
  session: StoryData;
  sessionProgress: PROGRESS_STATUS | null;
}

const cardStyle = {
  alignSelf: 'flex-start',
  width: { xs: '100%', md: 'calc(50% - 1rem)' },
  backgroundColor: 'background.default',
} as const;

const cardContentStyle = {
  padding: { xs: 2, md: 3 },
  paddingBottom: { xs: 1, md: 1 },
} as const;

const collapseContentStyle = {
  padding: { xs: 2, md: 3 },
  paddingTop: { xs: 0, md: 0 },
  paddingBottom: { xs: 1, md: 1 },
} as const;

const cardActionsStyle = {
  paddingTop: 0,
  alignItems: 'end',
} as const;

const rowStyles = {
  ...rowStyle,
  gap: 1.5,
} as const;

const SessionCard = (props: SessionCardProps) => {
  const { session, sessionProgress } = props;
  const t = useTranslations('Courses');
  const [expanded, setExpanded] = useState<boolean>(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  return (
    <Card sx={cardStyle} key={session.id}>
      <CardActionArea href={`/${session.full_slug}`}>
        <CardContent sx={cardContentStyle}>
          <Box sx={{ ...rowStyles, mb: 1 }}>
            {sessionProgress === PROGRESS_STATUS.STARTED && (
              <DonutLargeIcon color="error"></DonutLargeIcon>
            )}
            {sessionProgress === PROGRESS_STATUS.COMPLETED && (
              <CheckCircleIcon color="error"></CheckCircleIcon>
            )}
            <Typography key={session.slug} component="h3" variant="h3">
              {session.content.name}
            </Typography>
          </Box>
          <Typography key={session.slug} component="p" variant="body1">
            Session 1
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions sx={cardActionsStyle}>
        <IconButton
          sx={{ marginLeft: 'auto' }}
          aria-label="Expand summary"
          onClick={handleExpandClick}
          size="small"
        >
          <KeyboardArrowDownIcon color="error"></KeyboardArrowDownIcon>
        </IconButton>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={collapseContentStyle}>
          <Typography paragraph>{session.content.description}</Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default SessionCard;
