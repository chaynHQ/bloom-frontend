'use client';

import { type CardProgress } from '@/components/cards/CardStatusBadge';
import { BackLink } from '@/components/common/BackLink';
import { Link as i18nLink } from '@/i18n/routing';
import { type CourseSession } from '@/lib/utils/courseSessions';
import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import LockOutlined from '@mui/icons-material/LockOutlined';
import { Box, Divider, Link, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

const listStyle = { display: 'flex', flexDirection: 'column', gap: 1.5, p: 0, m: 0 } as const;

const itemLinkStyle = (isCurrent: boolean) =>
  ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: 2,
    p: 1,
    borderRadius: '10px',
    textDecoration: 'none',
    color: 'inherit',
    backgroundColor: isCurrent ? 'supportArrowPanel' : 'transparent',
    '&:hover': { backgroundColor: isCurrent ? 'supportArrowPanel' : 'primary.light' },
  }) as const;

// The position disc never changes with progress — completion shows as a separate trailing badge.
const discStyle = (isCurrent: boolean) =>
  ({
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    borderRadius: '50%',
    backgroundColor: isCurrent ? 'primary.dark' : 'grey.300',
    color: isCurrent ? 'common.white' : 'common.black',
    fontFamily: 'headingFontFamily',
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1,
  }) as const;

const completedBadgeStyle = {
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 24,
  height: 24,
  borderRadius: '50%',
  backgroundColor: 'success.main',
  color: 'common.white',
} as const;

const copyStyle = {
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 0.25,
} as const;

const titleStyle = (isCurrent: boolean) =>
  ({
    fontWeight: isCurrent ? 500 : 400,
    color: 'common.black',
  }) as const;

const timeStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
  color: 'grey.700',
} as const;

// Height is left to the content: a fixed 20px box clips descenders and Arabic diacritics.
const currentBadgeStyle = {
  flexShrink: 0,
  px: 1,
  py: 0.25,
  borderRadius: '8px',
  backgroundColor: 'primary.dark',
  color: 'common.white',
  fontFamily: 'headingFontFamily',
  fontSize: '0.875rem',
  fontWeight: 500,
  lineHeight: 1.4,
} as const;

interface SessionPlaylistProps {
  courseName: string;
  courseHref: string;
  sessions: CourseSession[];
  currentSessionUuid: string;
  progressByUuid: Record<string, CardProgress>;
  accountNeeded: boolean;
  backHref: string;
  backLabel: string;
  // The bottom-drawer variant drops the back link — the drawer's Close button is the way out.
  hideBackLink?: boolean;
  // The bottom-drawer variant runs the list to the sheet's inline edge rather than indenting it.
  flushList?: boolean;
  onSessionSelect: (session: CourseSession) => void;
}

export function SessionPlaylist({
  courseName,
  courseHref,
  sessions,
  currentSessionUuid,
  progressByUuid,
  accountNeeded,
  backHref,
  backLabel,
  hideBackLink = false,
  flushList = false,
  onSessionSelect,
}: SessionPlaylistProps) {
  const t = useTranslations('Courses');
  const tL = useTranslations('Library');
  const tS = useTranslations('Shared');

  return (
    <Box qa-id="session-playlist">
      {!hideBackLink && (
        <>
          <BackLink href={backHref} label={backLabel} />
          <Divider sx={{ my: 2, borderColor: 'cardBorder' }} />
        </>
      )}

      {/* `div`, not the default `p`: the global `p:last-of-type { margin-bottom: 0 }` rule
          would otherwise cancel the gap below this label. */}
      <Typography component="div" variant="body2" sx={{ color: 'grey.700', mb: 1.5 }}>
        {t('sessionDetail.currentCourse')}
      </Typography>
      <Link
        component={i18nLink}
        href={courseHref}
        sx={{ textDecoration: 'none', color: 'inherit' }}
      >
        <Typography variant="h3" component="h2" sx={{ mb: 0 }}>
          {courseName}
        </Typography>
      </Link>
      <Divider sx={{ my: 2, borderColor: 'cardBorder' }} />

      <Box
        component="ol"
        sx={{ ...listStyle, listStyle: 'none', ...(flushList && { '& > li': { pl: 0 } }) }}
      >
        {sessions.map((session) => {
          const isCurrent = session.uuid === currentSessionUuid;
          const isCompleted = progressByUuid[session.uuid] === 'completed';

          return (
            <Box component="li" key={session.uuid}>
              <Link
                component={i18nLink}
                href={session.href}
                aria-current={isCurrent ? 'true' : undefined}
                aria-label={`${t('navigateToSession')} ${session.name}${
                  isCompleted ? `, ${tS('progressStatus.completed')}` : ''
                }`}
                onClick={() => onSessionSelect(session)}
                sx={itemLinkStyle(isCurrent)}
              >
                <Box aria-hidden sx={discStyle(isCurrent)}>
                  {session.position}
                </Box>
                <Box sx={copyStyle}>
                  <Typography sx={titleStyle(isCurrent)}>{session.name}</Typography>
                  {session.minutes != null && (
                    <Box sx={timeStyle}>
                      <AccessTimeRounded sx={{ fontSize: 14 }} />
                      <Typography component="span" variant="body2">
                        {tL('duration', { minutes: session.minutes })}
                      </Typography>
                    </Box>
                  )}
                </Box>
                {isCurrent ? (
                  // `div`, not `span`: the global `a span { color: inherit }` rule would otherwise
                  // override the white badge text.
                  <Typography component="div" sx={currentBadgeStyle}>
                    {t('sessionDetail.current')}
                  </Typography>
                ) : isCompleted ? (
                  <Box aria-hidden sx={completedBadgeStyle}>
                    <CheckRounded sx={{ fontSize: 16 }} />
                  </Box>
                ) : accountNeeded ? (
                  <LockOutlined sx={{ flexShrink: 0, fontSize: 16, color: 'grey.700', mt: 0.5 }} />
                ) : null}
              </Link>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
