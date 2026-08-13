'use client';

import { type CardProgress } from '@/components/cards/CardStatusBadge';
import { SessionPlaylist } from '@/components/session/SessionPlaylist';
import { Link as i18nLink } from '@/i18n/routing';
import { type CourseSession } from '@/lib/utils/courseSessions';
import KeyboardArrowUpRounded from '@mui/icons-material/KeyboardArrowUpRounded';
import { Box, Button, Drawer, Link, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

const panelStyle = {
  p: 2,
  borderRadius: '16px',
  border: '1px solid',
  borderColor: 'cardBorder',
  backgroundColor: 'pageBackground',
} as const;

const sidebarStyle = {
  display: { xs: 'none', lg: 'block' },
  order: { lg: -1 }, // rendered after the session content, shown alongside it from lg
  flexShrink: 0,
  width: 416,
  position: 'sticky',
  // Clears the fixed TopBar so the playlist stays readable while the session scrolls.
  top: 'calc(9rem + var(--top-banner-height, 0px))',
  alignSelf: 'flex-start',
  maxHeight: 'calc(100vh - 11rem)',
  overflowY: 'auto',
} as const;

const barStyle = {
  display: { xs: 'flex', lg: 'none' },
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 2,
  mt: 4,
  p: 2,
  borderTop: '1px solid',
  borderColor: 'cardBorder',
  backgroundColor: 'panelSurface',
} as const;

const barTriggerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: 1,
  flex: 1,
  minWidth: 0,
  maxWidth: 'none',
  p: 0,
  textAlign: 'start',
  textTransform: 'none',
  color: 'inherit',
  '&:hover': { backgroundColor: 'transparent' },
} as const;

// Two lines is enough to recognise the course; longer titles ellipsis rather than push the
// "view course" link off the row.
const barTitleStyle = {
  fontWeight: 600,
  color: 'common.black',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
} as const;

const drawerPaperStyle = {
  display: 'flex',
  flexDirection: 'column',
  borderStartStartRadius: '16px',
  borderStartEndRadius: '16px',
  backgroundColor: 'pageBackground',
  maxHeight: '85vh',
  p: 2,
} as const;

// The list scrolls inside the sheet so the close button stays reachable on short screens.
const drawerListStyle = { flex: 1, minHeight: 0, overflowY: 'auto' } as const;

const drawerCloseStyle = { flexShrink: 0, mt: 2, width: '100%', maxWidth: 'none' } as const;

interface SessionCourseNavProps {
  courseName: string;
  courseHref: string;
  sessions: CourseSession[];
  currentSessionUuid: string;
  progressByUuid: Record<string, CardProgress>;
  accountNeeded: boolean;
  backHref: string;
  backLabel: string;
  onSessionSelect: (session: CourseSession) => void;
  onPlaylistOpen: () => void;
}

export function SessionCourseNav({ onPlaylistOpen, ...playlistProps }: SessionCourseNavProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('Courses');
  const { courseName, courseHref, onSessionSelect } = playlistProps;

  const handleOpen = () => {
    setOpen(true);
    onPlaylistOpen();
  };

  const playlist = (
    <SessionPlaylist
      {...playlistProps}
      onSessionSelect={(session) => {
        setOpen(false);
        onSessionSelect(session);
      }}
    />
  );

  return (
    <>
      <Box component="aside" aria-label={t('courseDetail.sessionsTitle')} sx={sidebarStyle}>
        <Box sx={panelStyle}>{playlist}</Box>
      </Box>

      <Box sx={barStyle}>
        <Button
          qa-id="session-playlist-trigger"
          onClick={handleOpen}
          aria-label={t('courseDetail.sessionsTitle')}
          sx={barTriggerStyle}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ color: 'grey.700' }}>
              {t('sessionDetail.currentCourse')}
            </Typography>
            <Typography sx={barTitleStyle}>{courseName}</Typography>
          </Box>
          <KeyboardArrowUpRounded sx={{ flexShrink: 0, color: 'primary.dark' }} />
        </Button>
        <Link
          component={i18nLink}
          href={courseHref}
          sx={{ flexShrink: 0, color: 'primary.dark', fontSize: '0.875rem' }}
        >
          {t('sessionDetail.viewCourseDetail')}
        </Link>
      </Box>

      <Drawer
        anchor="bottom"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{ paper: { sx: drawerPaperStyle } }}
      >
        <Box sx={drawerListStyle}>{playlist}</Box>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => setOpen(false)}
          sx={drawerCloseStyle}
        >
          {t('sessionDetail.closeSessions')}
        </Button>
      </Drawer>
    </>
  );
}
