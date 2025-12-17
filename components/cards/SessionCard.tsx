'use client';

import { SessionProgressDisplay } from '@/components/session/SessionProgressDisplay';
import { getDefaultFullSlug } from '@/lib/utils/getDefaultFullSlug';
import { rowStyle } from '@/styles/common';
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
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

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
  alignItems: 'center',
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
  storyblokCourseUuid: string;
  isLoggedIn: boolean;
}

const SessionCard = (props: SessionCardProps) => {
  const { session, sessionSubtitle, storyblokCourseUuid, isLoggedIn } = props;
  const [expanded, setExpanded] = useState<boolean>(false);
  const t = useTranslations('Courses');
  const locale = useLocale();

  const scrollToSignupBanner = () => {
    const signupBanner = document.getElementById('signup-banner');

    if (signupBanner) {
      const scrollToY = signupBanner.getBoundingClientRect().top + window.scrollY - 136;

      window.scrollTo({ top: scrollToY, behavior: 'smooth' });
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
          ? { href: getDefaultFullSlug(session.full_slug, locale), component: Link }
          : { onClick: scrollToSignupBanner })}
        aria-label={`${t('navigateToSession')} ${session.name}`}
      >
        <CardContent sx={cardContentStyle}>
          <Typography flex={1} component="h3" variant="h3" mb={1}>
            {session.content.name}
          </Typography>
          <Box sx={cardContentRowStyles}>
            <Typography color="grey.700">{sessionSubtitle}</Typography>
            <SessionProgressDisplay
              sessionId={session.uuid}
              storyblokCourseUuid={storyblokCourseUuid}
            />
          </Box>
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
