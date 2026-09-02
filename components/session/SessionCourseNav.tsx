'use client';

import { type CardProgress } from '@/components/cards/CardStatusBadge';
import { SessionPlaylist } from '@/components/session/SessionPlaylist';
import { mobileBottomNavHeight } from '@/lib/constants/banners';
import { type CourseSession } from '@/lib/utils/courseSessions';
import KeyboardArrowUpRounded from '@mui/icons-material/KeyboardArrowUpRounded';
import { Box, Button, ButtonBase, Drawer, Typography } from '@mui/material';
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

// Replaces the desktop sidebar on mobile: the whole bar is a single button that opens the session
// drawer. It stays stuck to the bottom of the viewport (just above the app's fixed bottom nav)
// while the session scrolls, and is full-bleed past the page's inline padding.
const barStyle = {
  display: { xs: 'flex', lg: 'none' },
  position: 'sticky',
  bottom: { xs: `${mobileBottomNavHeight}px`, md: 0 },
  zIndex: 1090,
  alignSelf: 'stretch',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 2,
  mt: 4,
  mx: { xs: '-1.5rem', sm: '-2rem' },
  px: { xs: '1.5rem', sm: '2rem' },
  py: 2,
  textAlign: 'start',
  textTransform: 'none',
  color: 'inherit',
  borderTop: '1px solid',
  borderColor: 'sectionBorder',
  backgroundColor: 'pageBackground',
  boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.06)',
  '&:hover': { backgroundColor: 'pageBackground' },
} as const;

// Two lines is enough to recognise the course; longer titles ellipsis rather than push the
// chevron off the row.
const barTitleStyle = {
  fontWeight: 500,
  color: 'common.black',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
} as const;

const drawerPaperStyle = {
  display: 'flex',
  flexDirection: 'column',
  borderStartStartRadius: '20px',
  borderStartEndRadius: '20px',
  backgroundColor: 'pageBackground',
  maxHeight: '85vh',
  p: 2,
} as const;

// The list scrolls inside the sheet so the close button stays reachable on short screens.
const drawerListStyle = { flex: 1, minHeight: 0, overflowY: 'auto' } as const;

const drawerCloseStyle = {
  flexShrink: 0,
  mt: 2,
  pt: 2,
  borderTop: '1px solid',
  borderColor: 'cardBorder',
} as const;

const drawerCloseButtonStyle = { width: '100%', maxWidth: 'none' } as const;

interface SessionCourseNavProps {
  courseName: string;
  courseHref: string;
  sessions: CourseSession[];
  currentSessionUuid: string;
  progressByUuid: Record<string, CardProgress>;
  accountNeeded: boolean;
  previewSessionUuid?: string;
  backHref: string;
  backLabel: string;
  onSessionSelect: (session: CourseSession) => void;
  onPlaylistOpen: () => void;
}

export function SessionCourseNav({ onPlaylistOpen, ...playlistProps }: SessionCourseNavProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('Courses');
  const { courseName, onSessionSelect } = playlistProps;

  const handleOpen = () => {
    setOpen(true);
    onPlaylistOpen();
  };

  // `drawer` toggles the sheet-specific playlist treatment: no back link, list flush to the edge.
  const renderPlaylist = (drawer: boolean) => (
    <SessionPlaylist
      {...playlistProps}
      hideBackLink={drawer}
      flushList={drawer}
      onSessionSelect={(session) => {
        setOpen(false);
        onSessionSelect(session);
      }}
    />
  );

  return (
    <>
      <Box component="aside" aria-label={t('courseDetail.sessionsTitle')} sx={sidebarStyle}>
        <Box sx={panelStyle}>{renderPlaylist(false)}</Box>
      </Box>

      <ButtonBase
        qa-id="session-playlist-trigger"
        onClick={handleOpen}
        aria-label={t('courseDetail.sessionsTitle')}
        aria-haspopup="dialog"
        aria-expanded={open}
        sx={barStyle}
      >
        <Box component="span" sx={{ display: 'block', minWidth: 0 }}>
          <Typography component="span" variant="body2" sx={{ display: 'block', color: 'grey.700' }}>
            {t('sessionDetail.currentCourse')}
          </Typography>
          <Typography component="span" sx={barTitleStyle}>
            {courseName}
          </Typography>
        </Box>
        <KeyboardArrowUpRounded sx={{ flexShrink: 0, color: 'primary.dark' }} />
      </ButtonBase>

      <Drawer
        anchor="bottom"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{ paper: { sx: drawerPaperStyle } }}
      >
        <Box sx={drawerListStyle}>{renderPlaylist(true)}</Box>
        <Box sx={drawerCloseStyle}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setOpen(false)}
            sx={drawerCloseButtonStyle}
          >
            {t('sessionDetail.closeSessions')}
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
