'use client';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Collapse,
  IconButton,
  Link,
  Typography,
} from '@mui/material';
import { ISbStoryData } from '@storyblok/react/rsc';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { rowStyle } from '../../styles/common';
import { SessionProgressDisplay } from '../session/SessionProgressDisplay';

const cardStyle = {
  alignSelf: 'flex-start',
  width: { xs: '100%', md: 'calc(50% - 1rem)' },
  backgroundColor: 'background.default',
} as const;

const cardContentStyle = {
  padding: { xs: 2, md: 3 },
  paddingBottom: '0.5rem !important',
} as const;

const collapseContentStyle = {
  padding: { xs: 2, md: 3 },
  paddingTop: { xs: 0, md: 0 },
} as const;

const cardActionsStyle = {
  paddingTop: 0,
  alignItems: 'end',
} as const;

const cardContentRowStyles = {
  ...rowStyle,
  justifyContent: 'flex-start',
  gap: 1.5,
} as const;

const cardActionStyle = {
  '&:hover': {
    borderBottom: '2px solid grey',
    borderBottomColor: 'primary.main',
    marginBottom: '-2px',
  },
} as const;

interface SessionCardProps {
  session: ISbStoryData;
  sessionSubtitle: string;
  storyblokCourseId: number;
  isLoggedIn: boolean;
}

const SessionCard = (props: SessionCardProps) => {
  const { session, sessionSubtitle, storyblokCourseId, isLoggedIn } = props;
  const [expanded, setExpanded] = useState<boolean>(false);

  const t = useTranslations('Courses');
  const router = useRouter();

  const scrollToSignupBanner = () => {
    if (isLoggedIn) {
      router.push(`/${session.full_slug}`);
    } else {
      const signupBanner = document.getElementById('signup-banner');

      if (signupBanner) {
        const scrollToY = signupBanner.getBoundingClientRect().top + window.scrollY - 136;

        window.scrollTo({ top: scrollToY, behavior: 'smooth' });
      }
    }
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const arrowStyle = {
    transform: expanded ? 'rotate(180deg)' : 'none',
  } as const;

  return (
    <Card sx={cardStyle}>
      <CardActionArea
        sx={cardActionStyle}
        {...(isLoggedIn
          ? { href: `/${session.full_slug}`, component: Link }
          : { onClick: scrollToSignupBanner })}
        aria-label={`${t('navigateToSession')} ${session.name}`}
      >
        <CardContent sx={cardContentStyle}>
          <Box sx={cardContentRowStyles}>
            <SessionProgressDisplay sessionId={session.id} storyblokCourseId={storyblokCourseId} />
            <Typography flex={1} component="h3" variant="h3">
              {session.content.name}
            </Typography>
          </Box>
          <Typography color="grey.700">{sessionSubtitle}</Typography>
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
          <Typography>{session.content.description}</Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default SessionCard;
