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
  sessionProgress: PROGRESS_STATUS;
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
  const [expanded, setExpanded] = useState<boolean>(false);

  const t = useTranslations('Courses');

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const arrowStyle = {
    transform: expanded ? 'rotate(180deg)' : 'none',
  } as const;

  return (
    <Card sx={cardStyle} key={session.id}>
      <CardActionArea
        href={`/${session.full_slug}`}
        aria-label={`${t('navigateToSession')} ${session.name}`}
      >
        <CardContent sx={cardContentStyle}>
          <Box sx={rowStyles}>
            {sessionProgress !== PROGRESS_STATUS.NOT_STARTED && (
              <Box mt={0.5}>
                {sessionProgress === PROGRESS_STATUS.STARTED && <DonutLargeIcon color="error" />}
                {sessionProgress === PROGRESS_STATUS.COMPLETED && <CheckCircleIcon color="error" />}
              </Box>
            )}
            <Typography component="h3" variant="h3">
              {session.content.name}
            </Typography>
          </Box>
          <Typography component="p" variant="body1" color="grey.700">
            {t('session')} {session.position / 10 - 1}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions sx={cardActionsStyle}>
        <IconButton
          sx={{ marginLeft: 'auto' }}
          aria-label={`${t('expandSummary')} ${session.name}`}
          onClick={handleExpandClick}
          size="small"
        >
          <KeyboardArrowDownIcon sx={arrowStyle} color="error" />
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
